const cron = require('node-cron');
const { query } = require('../../config/db');
const { sendPushNotification } = require('./notification.service');
const logger = require('../../utils/logger');

const motivationalMessages = [
  "Small steps lead to big results. Solve 5 questions now!",
  "Consistency is the key to AIR 1. Keep going!",
  "NEET/JEE isn't just about intelligence, it's about persistence.",
  "Your future self will thank you for today's hard work.",
  "Don't stop until you're proud of your progress."
];

const initRetentionCron = () => {
  // 1. Daily Morning Reminder (08:00 AM)
  cron.schedule('0 8 * * *', async () => {
    logger.info('Running Daily Morning Reminder cron');
    const { rows } = await query(`SELECT id, name FROM users`);
    for (const user of rows) {
      await sendPushNotification(
        user.id,
        `Good morning ${user.name}! 🌅`,
        "Your daily target is 30 questions. Ready to start?",
        { action: 'OPEN_PRACTICE' },
        'REMINDER'
      );
    }
  });

  // 2. Revision Reminder (10:00 AM)
  cron.schedule('0 10 * * *', async () => {
    logger.info('Running Revision Reminder cron');
    const { rows } = await query(
      `SELECT user_id, COUNT(*) as count 
       FROM spaced_repetition_queue 
       WHERE next_review_at <= NOW() 
       GROUP BY user_id`
    );
    for (const row of rows) {
      await sendPushNotification(
        row.user_id,
        "Revision Due! 🧠",
        `${row.count} questions are due for revision today. Don't forget!`,
        { action: 'OPEN_REVISION' },
        'REVISION'
      );
    }
  });

  // 3. Streak At Risk (08:00 PM)
  cron.schedule('0 20 * * *', async () => {
    logger.info('Running Streak At Risk cron');
    const today = new Date().toISOString().slice(0, 10);
    const { rows } = await query(
      `SELECT id, name, current_streak FROM users 
       WHERE (last_active_date < $1 OR last_active_date IS NULL) 
       AND current_streak > 0`,
      [today]
    );
    for (const user of rows) {
      await sendPushNotification(
        user.id,
        "⚠️ Streak at risk!",
        `Hey ${user.name}, your ${user.current_streak}-day streak ends tonight! Practice 5 Qs to save it.`,
        { action: 'OPEN_PRACTICE' },
        'STREAK_ALARM'
      );
    }
  });

  // 4. Weekly Progress Report (Sunday 09:00 AM)
  cron.schedule('0 9 * * 0', async () => {
    logger.info('Running Weekly Report cron');
    const { rows } = await query(
      `SELECT u.id, u.name, 
              SUM(da.questions_attempted) as total_qs
       FROM users u
       JOIN daily_activity da ON da.user_id = u.id
       WHERE da.date >= CURRENT_DATE - INTERVAL '7 days'
       GROUP BY u.id, u.name`
    );
    for (const row of rows) {
      await sendPushNotification(
        row.id,
        "Your Weekly Wrap 📊",
        `You solved ${row.total_qs} questions this week! Keep it up.`,
        { action: 'OPEN_ANALYTICS' },
        'REPORT'
      );
    }
  });

  // 5. Random Motivational (3 times a week - Tue, Thu, Sat at 04:00 PM)
  cron.schedule('0 16 * * 2,4,6', async () => {
    const msg = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
    const { rows } = await query(`SELECT id FROM users`);
    for (const user of rows) {
      await sendPushNotification(user.id, "Stay Focused! 🚀", msg, {}, 'MOTIVATION');
    }
  });
};

module.exports = { initRetentionCron };
