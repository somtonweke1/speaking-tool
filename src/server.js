import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://speaking-tool.vercel.app',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'SpeakingTool Backend API',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'SpeakingTool Backend API is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Basic auth routes (simplified for now)
app.post('/api/auth/register', (req, res) => {
  res.json({ message: 'Registration endpoint ready' });
});

app.post('/api/auth/login', (req, res) => {
  res.json({ message: 'Login endpoint ready' });
});

app.get('/api/auth/profile', (req, res) => {
  res.json({ message: 'Profile endpoint ready' });
});

// Users routes
app.get('/api/users', (req, res) => {
  res.json({ message: 'Users endpoint ready' });
});

// Sessions routes
app.get('/api/sessions', (req, res) => {
  res.json({ message: 'Sessions endpoint ready' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    message: `Route ${req.originalUrl} not found` 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 SpeakingTool Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
