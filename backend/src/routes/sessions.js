import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import pool from '../config/database.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/sessions/analytics - Get session analytics
router.get('/analytics', async (req, res) => {
  try {
    const userId = req.user.id;
    const { timeframe = '30' } = req.query; // days

    const result = await pool.query(
      `SELECT 
        DATE_TRUNC('day', created_at) as date,
        COUNT(*) as session_count,
        AVG(duration_seconds) as avg_duration,
        AVG(volume_score) as avg_volume,
        AVG(clarity_score) as avg_clarity,
        AVG(speech_rate_score) as avg_speech_rate,
        SUM(filler_words_count) as total_filler_words
       FROM speaking_sessions 
       WHERE user_id = $1 
         AND created_at >= CURRENT_DATE - INTERVAL '${timeframe} days'
       GROUP BY DATE_TRUNC('day', created_at)
       ORDER BY date DESC`,
      [userId]
    );

    res.json({
      analytics: result.rows,
      timeframe: parseInt(timeframe)
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      error: 'Failed to get analytics',
      message: 'Something went wrong while fetching analytics'
    });
  }
});

// GET /api/sessions/insights - Get personalized insights
router.get('/insights', async (req, res) => {
  try {
    const userId = req.user.id;

    // Get recent sessions for analysis
    const recentSessions = await pool.query(
      `SELECT 
        volume_score,
        clarity_score,
        speech_rate_score,
        filler_words_count,
        duration_seconds,
        created_at
       FROM speaking_sessions 
       WHERE user_id = $1 
         AND created_at >= CURRENT_DATE - INTERVAL '7 days'
       ORDER BY created_at DESC
       LIMIT 20`,
      [userId]
    );

    if (recentSessions.rows.length === 0) {
      return res.json({
        insights: [],
        message: 'Not enough data for insights yet. Complete more speaking sessions!'
      });
    }

    const sessions = recentSessions.rows;
    
    // Calculate insights
    const insights = [];

    // Volume trend
    const recentVolume = sessions.slice(0, 5).map(s => s.volume_score).filter(Boolean);
    const olderVolume = sessions.slice(-5).map(s => s.volume_score).filter(Boolean);
    
    if (recentVolume.length > 0 && olderVolume.length > 0) {
      const recentAvg = recentVolume.reduce((a, b) => a + b, 0) / recentVolume.length;
      const olderAvg = olderVolume.reduce((a, b) => a + b, 0) / olderVolume.length;
      
      if (recentAvg > olderAvg + 0.1) {
        insights.push({
          type: 'improvement',
          category: 'volume',
          message: 'Great job! Your volume projection has improved over the last week.',
          metric: `From ${olderAvg.toFixed(2)} to ${recentAvg.toFixed(2)}`
        });
      } else if (recentAvg < olderAvg - 0.1) {
        insights.push({
          type: 'attention',
          category: 'volume',
          message: 'Your volume projection has decreased. Try speaking with more confidence!',
          metric: `From ${olderAvg.toFixed(2)} to ${recentAvg.toFixed(2)}`
        });
      }
    }

    // Clarity trend
    const recentClarity = sessions.slice(0, 5).map(s => s.clarity_score).filter(Boolean);
    const olderClarity = sessions.slice(-5).map(s => s.clarity_score).filter(Boolean);
    
    if (recentClarity.length > 0 && olderClarity.length > 0) {
      const recentAvg = recentClarity.reduce((a, b) => a + b, 0) / recentClarity.length;
      const olderAvg = olderClarity.reduce((a, b) => a + b, 0) / olderClarity.length;
      
      if (recentAvg > olderAvg + 0.1) {
        insights.push({
          type: 'improvement',
          category: 'clarity',
          message: 'Excellent! Your speech clarity has improved significantly.',
          metric: `From ${olderAvg.toFixed(2)} to ${recentAvg.toFixed(2)}`
        });
      }
    }

    // Filler words analysis
    const totalFillerWords = sessions.reduce((sum, s) => sum + (s.filler_words_count || 0), 0);
    const avgFillerWords = totalFillerWords / sessions.length;
    
    if (avgFillerWords > 10) {
      insights.push({
        type: 'improvement',
        category: 'filler_words',
        message: 'You\'re using quite a few filler words. Practice pausing instead of saying "um" or "uh".',
        metric: `Average: ${avgFillerWords.toFixed(1)} filler words per session`
      });
    } else if (avgFillerWords < 5) {
      insights.push({
        type: 'achievement',
        category: 'filler_words',
        message: 'Outstanding! You\'re using very few filler words. Keep up the excellent work!',
        metric: `Average: ${avgFillerWords.toFixed(1)} filler words per session`
      });
    }

    // Session frequency
    const daysWithSessions = new Set(sessions.map(s => s.created_at.toDateString())).size;
    if (daysWithSessions >= 5) {
      insights.push({
        type: 'achievement',
        category: 'consistency',
        message: 'You\'re practicing consistently! This regular practice will lead to rapid improvement.',
        metric: `${daysWithSessions} days of practice this week`
      });
    } else if (daysWithSessions < 3) {
      insights.push({
        type: 'motivation',
        category: 'consistency',
        message: 'Try to practice more regularly. Even 5 minutes daily can make a huge difference!',
        metric: `${daysWithSessions} days of practice this week`
      });
    }

    // Longest session
    const longestSession = Math.max(...sessions.map(s => s.duration_seconds || 0));
    if (longestSession > 300) { // 5 minutes
      insights.push({
        type: 'achievement',
        category: 'endurance',
        message: 'Impressive! You completed a long speaking session. This builds confidence for real presentations.',
        metric: `${Math.floor(longestSession / 60)} minutes and ${longestSession % 60} seconds`
      });
    }

    res.json({
      insights,
      sessionCount: sessions.length,
      timeframe: '7 days'
    });
  } catch (error) {
    console.error('Get insights error:', error);
    res.status(500).json({
      error: 'Failed to get insights',
      message: 'Something went wrong while generating insights'
    });
  }
});

// GET /api/sessions/leaderboard - Get user's ranking (if applicable)
router.get('/leaderboard', async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's current stats
    const userStats = await pool.query(
      `SELECT 
        total_sessions,
        total_speaking_time,
        average_volume_score,
        average_clarity_score,
        average_speech_rate_score
       FROM user_progress 
       WHERE user_id = $1`,
      [userId]
    );

    if (userStats.rows.length === 0) {
      return res.json({
        leaderboard: [],
        userRank: null,
        message: 'Complete your first session to see your ranking!'
      });
    }

    const userData = userStats.rows[0];

    // Get top performers (anonymized for privacy)
    const topPerformers = await pool.query(
      `SELECT 
        up.total_sessions,
        up.total_speaking_time,
        up.average_volume_score,
        up.average_clarity_score,
        up.average_speech_rate_score,
        ROW_NUMBER() OVER (ORDER BY up.average_clarity_score DESC, up.total_sessions DESC) as rank
       FROM user_progress up
       WHERE up.total_sessions >= 5
       ORDER BY up.average_clarity_score DESC, up.total_sessions DESC
       LIMIT 10`
    );

    // Find user's rank
    const userRank = await pool.query(
      `SELECT 
        COUNT(*) + 1 as rank
       FROM user_progress up
       WHERE up.average_clarity_score > $1 
         OR (up.average_clarity_score = $1 AND up.total_sessions > $2)
         OR (up.average_clarity_score = $1 AND up.total_sessions = $2 AND up.user_id < $3)`,
      [userData.average_clarity_score, userData.total_sessions, userId]
    );

    res.json({
      leaderboard: topPerformers.rows.map((row, index) => ({
        rank: index + 1,
        sessions: row.total_sessions,
        speakingTime: row.total_speaking_time,
        clarityScore: row.average_clarity_score,
        volumeScore: row.average_volume_score,
        speechRateScore: row.average_speech_rate_score
      })),
      userRank: parseInt(userRank.rows[0].rank),
      userStats: {
        sessions: userData.total_sessions,
        speakingTime: userData.total_speaking_time,
        clarityScore: userData.average_clarity_score,
        volumeScore: userData.average_volume_score,
        speechRateScore: userData.average_speech_rate_score
      }
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      error: 'Failed to get leaderboard',
      message: 'Something went wrong while fetching the leaderboard'
    });
  }
});

// GET /api/sessions/export - Export user's session data
router.get('/export', async (req, res) => {
  try {
    const userId = req.user.id;
    const { format = 'json' } = req.query;

    if (format !== 'json' && format !== 'csv') {
      return res.status(400).json({
        error: 'Invalid format',
        message: 'Only JSON and CSV formats are supported'
      });
    }

    // Get all user sessions
    const sessions = await pool.query(
      `SELECT 
        question_id,
        transcript,
        duration_seconds,
        volume_score,
        clarity_score,
        speech_rate_score,
        filler_words_count,
        feedback_summary,
        created_at
       FROM speaking_sessions 
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    if (format === 'csv') {
      // Generate CSV
      const csvHeaders = 'Question ID,Transcript,Duration (seconds),Volume Score,Clarity Score,Speech Rate Score,Filler Words,Feedback Summary,Date\n';
      const csvRows = sessions.rows.map(session => 
        `"${session.question_id}","${session.transcript || ''}","${session.duration_seconds}","${session.volume_score || ''}","${session.clarity_score || ''}","${session.speech_rate_score || ''}","${session.filler_words_count || 0}","${session.feedback_summary || ''}","${session.created_at}"`
      ).join('\n');
      
      const csv = csvHeaders + csvRows;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="speaking-sessions-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csv);
    } else {
      // Return JSON
      res.json({
        sessions: sessions.rows,
        exportDate: new Date().toISOString(),
        totalSessions: sessions.rows.length
      });
    }
  } catch (error) {
    console.error('Export sessions error:', error);
    res.status(500).json({
      error: 'Failed to export sessions',
      message: 'Something went wrong while exporting your data'
    });
  }
});

export default router;
