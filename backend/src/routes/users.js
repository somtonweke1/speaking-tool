import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import pool from '../config/database.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/users/progress - Get user progress
router.get('/progress', async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT 
        total_sessions,
        total_speaking_time,
        average_volume_score,
        average_clarity_score,
        average_speech_rate_score,
        total_filler_words,
        longest_session_duration,
        last_session_date,
        created_at,
        updated_at
       FROM user_progress 
       WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Progress not found',
        message: 'No progress data available'
      });
    }

    res.json({
      progress: result.rows[0]
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({
      error: 'Failed to get progress',
      message: 'Something went wrong while fetching your progress'
    });
  }
});

// GET /api/users/sessions - Get user speaking sessions
router.get('/sessions', async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'desc' } = req.query;

    const offset = (page - 1) * limit;
    const validSortFields = ['created_at', 'duration_seconds', 'volume_score', 'clarity_score'];
    const validSortOrders = ['asc', 'desc'];

    if (!validSortFields.includes(sortBy)) {
      sortBy = 'created_at';
    }
    if (!validSortOrders.includes(sortOrder)) {
      sortOrder = 'desc';
    }

    // Get total count
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM speaking_sessions WHERE user_id = $1',
      [userId]
    );
    const totalSessions = parseInt(countResult.rows[0].count);

    // Get sessions with pagination
    const result = await pool.query(
      `SELECT 
        id,
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
       ORDER BY ${sortBy} ${sortOrder}
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.json({
      sessions: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalSessions,
        totalPages: Math.ceil(totalSessions / limit)
      }
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({
      error: 'Failed to get sessions',
      message: 'Something went wrong while fetching your sessions'
    });
  }
});

// GET /api/users/sessions/:id - Get specific session
router.get('/sessions/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;

    const result = await pool.query(
      `SELECT 
        id,
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
       WHERE id = $1 AND user_id = $2`,
      [sessionId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Session not found',
        message: 'Session not found or access denied'
      });
    }

    res.json({
      session: result.rows[0]
    });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({
      error: 'Failed to get session',
      message: 'Something went wrong while fetching the session'
    });
  }
});

// POST /api/users/sessions - Save new speaking session
router.post('/sessions', async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      questionId,
      transcript,
      durationSeconds,
      volumeScore,
      clarityScore,
      speechRateScore,
      fillerWordsCount,
      feedbackSummary
    } = req.body;

    // Insert new session
    const result = await pool.query(
      `INSERT INTO speaking_sessions 
       (user_id, question_id, transcript, duration_seconds, volume_score, clarity_score, speech_rate_score, filler_words_count, feedback_summary)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [userId, questionId, transcript, durationSeconds, volumeScore, clarityScore, speechRateScore, fillerWordsCount, feedbackSummary]
    );

    // Update user progress
    await pool.query(
      `UPDATE user_progress 
       SET 
         total_sessions = total_sessions + 1,
         total_speaking_time = total_speaking_time + $1,
         total_filler_words = total_filler_words + $2,
         last_session_date = CURRENT_TIMESTAMP,
         updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $3`,
      [durationSeconds, fillerWordsCount, userId]
    );

    // Update average scores
    await pool.query(
      `UPDATE user_progress 
       SET 
         average_volume_score = (
           SELECT AVG(volume_score) 
           FROM speaking_sessions 
           WHERE user_id = $1 AND volume_score IS NOT NULL
         ),
         average_clarity_score = (
           SELECT AVG(clarity_score) 
           FROM speaking_sessions 
           WHERE user_id = $1 AND clarity_score IS NOT NULL
         ),
         average_speech_rate_score = (
           SELECT AVG(speech_rate_score) 
           FROM speaking_sessions 
           WHERE user_id = $1 AND speech_rate_score IS NOT NULL
         ),
         longest_session_duration = (
           SELECT GREATEST(longest_session_duration, $2)
           FROM user_progress 
           WHERE user_id = $1
         )
       WHERE user_id = $1`,
      [userId, durationSeconds]
    );

    res.status(201).json({
      message: 'Session saved successfully',
      session: result.rows[0]
    });
  } catch (error) {
    console.error('Save session error:', error);
    res.status(500).json({
      error: 'Failed to save session',
      message: 'Something went wrong while saving your session'
    });
  }
});

// GET /api/users/stats - Get user statistics
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user.id;

    // Get comprehensive stats
    const statsResult = await pool.query(
      `SELECT 
        up.total_sessions,
        up.total_speaking_time,
        up.average_volume_score,
        up.average_clarity_score,
        up.average_speech_rate_score,
        up.total_filler_words,
        up.longest_session_duration,
        up.last_session_date,
        COUNT(ss.id) as sessions_this_month,
        AVG(ss.duration_seconds) as avg_session_duration,
        MIN(ss.created_at) as first_session_date
       FROM user_progress up
       LEFT JOIN speaking_sessions ss ON up.user_id = ss.user_id 
         AND ss.created_at >= DATE_TRUNC('month', CURRENT_DATE)
       WHERE up.user_id = $1
       GROUP BY up.total_sessions, up.total_speaking_time, up.average_volume_score, 
                up.average_clarity_score, up.average_speech_rate_score, up.total_filler_words,
                up.longest_session_duration, up.last_session_date`,
      [userId]
    );

    if (statsResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Stats not found',
        message: 'No statistics available'
      });
    }

    const stats = statsResult.rows[0];

    // Calculate additional metrics
    const totalHours = Math.floor(stats.total_speaking_time / 3600);
    const totalMinutes = Math.floor((stats.total_speaking_time % 3600) / 60);
    const avgWordsPerMinute = stats.avg_session_duration ? 
      Math.round((stats.total_filler_words / stats.avg_session_duration) * 60) : 0;

    res.json({
      stats: {
        ...stats,
        totalHours,
        totalMinutes,
        avgWordsPerMinute,
        sessionsThisMonth: parseInt(stats.sessions_this_month) || 0
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      error: 'Failed to get statistics',
      message: 'Something went wrong while fetching your statistics'
    });
  }
});

// PUT /api/users/subscription - Update subscription tier
router.put('/subscription', async (req, res) => {
  try {
    const userId = req.user.id;
    const { subscriptionTier } = req.body;

    const validTiers = ['free', 'pro', 'enterprise'];
    if (!validTiers.includes(subscriptionTier)) {
      return res.status(400).json({
        error: 'Invalid subscription tier',
        message: 'Please provide a valid subscription tier'
      });
    }

    await pool.query(
      'UPDATE users SET subscription_tier = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [subscriptionTier, userId]
    );

    res.json({
      message: 'Subscription updated successfully',
      subscriptionTier
    });
  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({
      error: 'Failed to update subscription',
      message: 'Something went wrong while updating your subscription'
    });
  }
});

export default router;
