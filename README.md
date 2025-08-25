# 🎤 SpeakingTool - AI-Powered Public Speaking Coach

Transform your public speaking skills with real-time AI feedback, personalized insights, and comprehensive progress tracking.

## ✨ Features

- **Real-time Speech Analysis** - Instant feedback on volume, clarity, and speech rate
- **AI-Powered Insights** - Personalized improvement suggestions based on your speaking patterns
- **Extended Practice Sessions** - Practice for 5+ minutes to build endurance
- **Filler Word Detection** - Identify and eliminate "um", "uh", and other filler words
- **Progress Tracking** - Monitor improvement over time with detailed analytics
- **Achievement System** - Gamified milestones to keep you motivated
- **User Authentication** - Secure signup/login with JWT tokens
- **Session Management** - Save and review your speaking sessions

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

### Frontend Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000`

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with your database credentials
   ```

4. **Set up PostgreSQL database:**
   ```bash
   # Create database
   createdb speaking_tool
   
   # Or using psql
   psql -U postgres
   CREATE DATABASE speaking_tool;
   ```

5. **Start backend server:**
   ```bash
   npm run dev
   ```

6. **Verify backend is running:**
   Visit `http://localhost:5000/health`

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Lucide React** - Beautiful, consistent icons

### Backend (Node.js + Express)
- **Express.js** - Fast, unopinionated web framework
- **PostgreSQL** - Robust, scalable database
- **JWT** - Secure authentication
- **bcrypt** - Password hashing
- **Express Validator** - Input validation
- **Rate Limiting** - API protection

### Database Schema
- **Users** - User accounts and profiles
- **Speaking Sessions** - Individual practice sessions
- **User Progress** - Aggregated progress metrics
- **Password Reset Tokens** - Secure password recovery

## 🔐 Authentication

The app uses JWT (JSON Web Tokens) for secure authentication:

- **Registration**: `/api/auth/register` - Create new account
- **Login**: `/api/auth/login` - Authenticate user
- **Profile**: `/api/auth/profile` - Get/update user profile
- **Password Change**: `/api/auth/change-password` - Update password
- **Logout**: `/api/auth/logout` - Invalidate token

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### User Management
- `GET /api/users/progress` - Get user progress
- `GET /api/users/sessions` - Get user sessions
- `POST /api/users/sessions` - Save new session
- `GET /api/users/stats` - Get user statistics

### Analytics
- `GET /api/sessions/analytics` - Session analytics
- `GET /api/sessions/insights` - Personalized insights
- `GET /api/sessions/leaderboard` - User rankings
- `GET /api/sessions/export` - Export session data

## 🎯 Usage

### 1. Sign Up
- Visit the landing page
- Click "Start Free Trial"
- Fill in your details
- Verify your email

### 2. Start Practicing
- Choose a speaking prompt
- Click "Start Recording"
- Speak naturally for up to 5 minutes
- Get real-time feedback

### 3. Review Results
- View detailed analysis
- Check your scores
- Read improvement suggestions
- Track your progress

### 4. Improve Over Time
- Practice regularly
- Monitor your metrics
- Celebrate achievements
- Export your data

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=speaking_tool
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_super_secret_key

# Frontend
FRONTEND_URL=http://localhost:3000
```

### Database Configuration

The app automatically creates tables on first run. Make sure PostgreSQL is running and accessible.

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Build the project: `npm run build`
2. Deploy the `dist` folder
3. Set environment variables

### Backend (Heroku/DigitalOcean)
1. Set environment variables
2. Deploy using Git
3. Ensure PostgreSQL is configured

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README
- **Issues**: Create a GitHub issue
- **Email**: support@speakingtool.com

## 🎉 Acknowledgments

- Built with modern web technologies
- Inspired by the need for accessible public speaking practice
- Powered by AI and machine learning
- Designed for maximum user engagement

---

**Ready to transform your speaking skills?** 🎤✨

Start your free trial today and join thousands of users improving their public speaking with AI-powered coaching!
