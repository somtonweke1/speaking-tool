import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Database configuration for Railway
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Test database connection
export const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL database');
    
    // Create tables if they don't exist
    await createTables(client);
    
    client.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

// Create database tables
export const createTables = async (client) => {
  try {
    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        subscription_tier VARCHAR(50) DEFAULT 'free'
      )
    `);

    // Speaking sessions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS speaking_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        question_id VARCHAR(100) NOT NULL,
        transcript TEXT,
        duration_seconds INTEGER,
        volume_score DECIMAL(3,2),
        clarity_score DECIMAL(3,2),
        speech_rate_score DECIMAL(3,2),
        filler_words_count INTEGER,
        feedback_summary TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // User progress table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        total_sessions INTEGER DEFAULT 0,
        total_speaking_time INTEGER DEFAULT 0,
        average_volume_score DECIMAL(3,2) DEFAULT 0,
        average_clarity_score DECIMAL(3,2) DEFAULT 0,
        average_speech_rate_score DECIMAL(3,2) DEFAULT 0,
        total_filler_words INTEGER DEFAULT 0,
        longest_session_duration INTEGER DEFAULT 0,
        last_session_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Password reset tokens table
    await client.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Database tables created successfully');
  } catch (error) {
    console.error('❌ Failed to create tables:', error);
    throw error;
  }
};

// Export pool for use in other modules
export { pool };
