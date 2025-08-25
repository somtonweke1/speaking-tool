import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

// Verify JWT token middleware
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Access token required',
        message: 'Please log in to access this resource'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Get user from database
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid token',
        message: 'User not found'
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token',
        message: 'Token is malformed or invalid'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        message: 'Please log in again'
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      error: 'Authentication error',
      message: 'Something went wrong during authentication'
    });
  }
};

// Optional authentication middleware (for public routes that can show user-specific content if logged in)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findById(decoded.userId);
        if (user) {
          req.user = user;
        }
      } catch (error) {
        // Token is invalid, but we continue without user
        console.log('Optional auth: Invalid token, continuing as guest');
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Check subscription tier middleware
export const requireSubscription = (requiredTier = 'pro') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please log in to access this feature'
      });
    }

    const subscriptionTiers = {
      'free': 0,
      'pro': 1,
      'enterprise': 2
    };

    const userTier = subscriptionTiers[req.user.subscriptionTier] || 0;
    const requiredTierLevel = subscriptionTiers[requiredTier] || 0;

    if (userTier < requiredTierLevel) {
      return res.status(403).json({ 
        error: 'Subscription required',
        message: `This feature requires a ${requiredTier} subscription or higher`,
        currentTier: req.user.subscriptionTier,
        requiredTier: requiredTier
      });
    }

    next();
  };
};

// Rate limiting for authentication attempts
export const authRateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth attempts per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
};
