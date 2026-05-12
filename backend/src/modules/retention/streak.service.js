const { query } = require('../../config/db');
const logger = require('../../utils/logger');

/**
 * Records daily activity and updates the student's streak.
 * 
 * @param {string} userId 
 */
const recordDailyActivity = async (userId) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    
    // 1. Upsert daily activity
    await query(
      `INSERT INTO daily_activity (user_id, date, questions_attempted)
       VALUES ($1, $2, 1)
       ON CONFLICT (user_id, date) 
       DO UPDATE SET questions_attempted = daily_activity.questions_attempted + 1`,
      [userId, today]
    );

    // 2. Fetch current streak data
    const { rows } = await query(
      `SELECT current_streak, longest_streak, last_active_date::text 
       FROM users WHERE id = $1`,
      [userId]
    );

    const user = rows[0];
    if (!user) return;

    let newStreak = user.current_streak;
    const lastActive = user.last_active_date;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    // Streak Logic
    if (lastActive === today) {
      // Already active today, no change to streak count
      return;
    } else if (lastActive === yesterdayStr) {
      // Yesterday was active, increment
      newStreak += 1;
    } else {
      // Streak broken (or first time)
      newStreak = 1;
    }

    // Update longest streak
    const newLongest = Math.max(newStreak, user.longest_streak);

    await query(
      `UPDATE users 
       SET current_streak = $1, 
           longest_streak = $2, 
           last_active_date = $3 
       WHERE id = $4`,
      [newStreak, newLongest, today, userId]
    );

    logger.info(`Streak updated for user ${userId}: ${newStreak} days`);
  } catch (err) {
    logger.error('Error recording daily activity:', err);
  }
};

/**
 * Returns streak status including freeze availability.
 */
const getStreakStatus = async (userId) => {
  const { rows } = await query(
    `SELECT current_streak, longest_streak, streak_freeze_count 
     FROM users WHERE id = $1`,
    [userId]
  );
  return rows[0];
};

/**
 * Protects streak for 1 missed day.
 * Restricted to Pro users (handled in middleware/controller).
 */
const useStreakFreeze = async (userId) => {
  const { rowCount } = await query(
    `UPDATE users 
     SET streak_freeze_count = streak_freeze_count - 1,
         last_active_date = CURRENT_DATE - INTERVAL '1 day'
     WHERE id = $1 AND streak_freeze_count > 0`,
    [userId]
  );
  return rowCount > 0;
};

module.exports = {
  recordDailyActivity,
  getStreakStatus,
  useStreakFreeze
};
