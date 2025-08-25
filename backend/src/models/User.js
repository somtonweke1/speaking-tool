import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

export class User {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.firstName = data.first_name;
    this.lastName = data.last_name;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
    this.lastLogin = data.last_login;
    this.isActive = data.is_active;
    this.subscriptionTier = data.subscription_tier;
  }

  // Create new user
  static async create(userData) {
    const { email, password, firstName, lastName } = userData;
    
    try {
      // Check if user already exists
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Insert new user
      const result = await pool.query(
        `INSERT INTO users (email, password_hash, first_name, last_name)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [email, passwordHash, firstName, lastName]
      );

      // Create initial progress record
      await pool.query(
        `INSERT INTO user_progress (user_id) VALUES ($1)`,
        [result.rows[0].id]
      );

      return new User(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Authenticate user
  static async authenticate(email, password) {
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1 AND is_active = true',
        [email]
      );

      if (result.rows.length === 0) {
        throw new Error('Invalid credentials');
      }

      const user = result.rows[0];
      const isValidPassword = await bcrypt.compare(password, user.password_hash);

      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // Update last login
      await pool.query(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
        [user.id]
      );

      return new User(user);
    } catch (error) {
      throw error;
    }
  }

  // Generate JWT token
  generateToken() {
    return jwt.sign(
      { 
        userId: this.id, 
        email: this.email,
        subscriptionTier: this.subscriptionTier 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
  }

  // Get user by ID
  static async findById(id) {
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE id = $1 AND is_active = true',
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return new User(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Update user profile
  async updateProfile(updateData) {
    try {
      const { firstName, lastName, email } = updateData;
      
      const result = await pool.query(
        `UPDATE users 
         SET first_name = $1, last_name = $2, email = $3, updated_at = CURRENT_TIMESTAMP
         WHERE id = $4
         RETURNING *`,
        [firstName, lastName, email, this.id]
      );

      // Update instance properties
      Object.assign(this, {
        firstName: result.rows[0].first_name,
        lastName: result.rows[0].last_name,
        email: result.rows[0].email,
        updatedAt: result.rows[0].updated_at
      });

      return this;
    } catch (error) {
      throw error;
    }
  }

  // Change password
  async changePassword(currentPassword, newPassword) {
    try {
      // Verify current password
      const user = await pool.query(
        'SELECT password_hash FROM users WHERE id = $1',
        [this.id]
      );

      const isValidPassword = await bcrypt.compare(currentPassword, user.rows[0].password_hash);
      
      if (!isValidPassword) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const saltRounds = 12;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await pool.query(
        'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [newPasswordHash, this.id]
      );

      return true;
    } catch (error) {
      throw error;
    }
  }

  // Get user progress
  async getProgress() {
    try {
      const result = await pool.query(
        'SELECT * FROM user_progress WHERE user_id = $1',
        [this.id]
      );

      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Delete user account
  async deleteAccount() {
    try {
      await pool.query(
        'UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [this.id]
      );

      this.isActive = false;
      return true;
    } catch (error) {
      throw error;
    }
  }
}
