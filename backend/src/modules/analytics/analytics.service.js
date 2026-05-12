const { query } = require('../../config/db');
const redis = require('../../config/redis');

const CACHE_TTL = 60; // 60 seconds cache for analytics

/**
 * Main dashboard stats
 */
const getDashboard = async (userId) => {
  const cacheKey = `dashboard:${userId}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const [streakRes, weeklyRes, weakTopicsRes, accuracyTrendRes] = await Promise.all([
    // Current streak (consecutive days with at least 1 attempt)
    query(
      `WITH daily AS (
         SELECT DATE(attempted_at) AS day
         FROM student_attempts
         WHERE user_id = $1
         GROUP BY DATE(attempted_at)
         ORDER BY day DESC
       ),
       numbered AS (
         SELECT day, ROW_NUMBER() OVER (ORDER BY day DESC) AS rn
         FROM daily
       )
       SELECT COUNT(*) AS streak
       FROM numbered
       WHERE day = CURRENT_DATE - (rn - 1)`,
      [userId]
    ),

    // This week's attempt count
    query(
      `SELECT COUNT(*) AS count,
              SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) AS correct
       FROM student_attempts
       WHERE user_id = $1
         AND attempted_at >= date_trunc('week', NOW())`,
      [userId]
    ),

    // Top 5 weakest topics (lowest accuracy with >= 5 attempts)
    query(
      `SELECT s.topic_id, t.name AS topic_name, ch.name AS chapter_name,
              s.accuracy_percent, s.total_attempts
       FROM student_topic_stats s
       JOIN topics t   ON t.id = s.topic_id
       JOIN chapters ch ON ch.id = t.chapter_id
       WHERE s.user_id = $1 AND s.total_attempts >= 5
       ORDER BY s.accuracy_percent ASC
       LIMIT 5`,
      [userId]
    ),

    // 7-day accuracy trend
    query(
      `SELECT DATE(attempted_at) AS date,
              ROUND(AVG(CASE WHEN is_correct THEN 100.0 ELSE 0.0 END), 1) AS accuracy,
              COUNT(*) AS attempts
       FROM student_attempts
       WHERE user_id = $1
         AND attempted_at >= NOW() - INTERVAL '7 days'
       GROUP BY DATE(attempted_at)
       ORDER BY date ASC`,
      [userId]
    ),
  ]);

  const data = {
    streak:        parseInt(streakRes.rows[0]?.streak || 0, 10),
    weekly: {
      attempts: parseInt(weeklyRes.rows[0]?.count || 0, 10),
      correct:  parseInt(weeklyRes.rows[0]?.correct || 0, 10),
    },
    weak_topics:    weakTopicsRes.rows,
    accuracy_trend: accuracyTrendRes.rows,
  };

  await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(data));
  return data;
};

/**
 * Per-topic analytics
 */
const getTopicAnalytics = async (userId, topicId) => {
  const [statsRes, recentRes] = await Promise.all([
    query(
      `SELECT * FROM student_topic_stats WHERE user_id = $1 AND topic_id = $2`,
      [userId, topicId]
    ),
    query(
      `SELECT sa.selected_option, sa.is_correct, sa.time_taken_seconds,
              sa.attempted_at, q.difficulty
       FROM student_attempts sa
       JOIN questions q ON q.id = sa.question_id
       WHERE sa.user_id = $1 AND q.topic_id = $2
       ORDER BY sa.attempted_at DESC
       LIMIT 20`,
      [userId, topicId]
    ),
  ]);

  return {
    stats:           statsRes.rows[0] || null,
    recent_attempts: recentRes.rows,
  };
};

/**
 * Activity heatmap (GitHub contribution-style)
 */
const getHeatmap = async (userId, year) => {
  const result = await query(
    `SELECT DATE(attempted_at) AS date, COUNT(*) AS count
     FROM student_attempts
     WHERE user_id = $1
       AND EXTRACT(YEAR FROM attempted_at) = $2
     GROUP BY DATE(attempted_at)
     ORDER BY date ASC`,
    [userId, year]
  );
  return result.rows;
};

module.exports = { getDashboard, getTopicAnalytics, getHeatmap };
