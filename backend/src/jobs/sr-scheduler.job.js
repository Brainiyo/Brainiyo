const cron = require('node-cron');
const { query } = require('../config/db');
const logger = require('../utils/logger');

/**
 * Daily job: log count of due SR reviews per user (extend for push notifications)
 * Runs at 8:00 AM IST every day
 */
const srSchedulerJob = cron.schedule(
  '30 2 * * *', // 08:00 IST = 02:30 UTC
  async () => {
    try {
      logger.info('[SR Scheduler] Running daily spaced repetition digest...');

      const result = await query(
        `SELECT user_id, COUNT(*) AS due_count
         FROM spaced_repetition_queue
         WHERE next_review_at <= NOW()
         GROUP BY user_id
         HAVING COUNT(*) > 0
         LIMIT 1000`
      );

      logger.info(`[SR Scheduler] ${result.rows.length} users have due reviews`);

      // TODO: integrate with FCM (Firebase Cloud Messaging) to send push notifications
      // for (const row of result.rows) {
      //   await sendPushNotification(row.user_id, `You have ${row.due_count} questions to review today!`);
      // }
    } catch (err) {
      logger.error('[SR Scheduler] Job failed', { error: err.message });
    }
  },
  { scheduled: false } // start manually in server.js
);

module.exports = { srSchedulerJob };
