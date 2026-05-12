const admin = require('firebase-admin');
const { query } = require('../../config/db');
const logger = require('../../utils/logger');

/**
 * Sends a push notification via FCM and records it in the database.
 */
const sendPushNotification = async (userId, title, body, data = {}, type = 'SYSTEM') => {
  try {
    // 1. Get user FCM token and preferences
    const { rows } = await query(
      `SELECT fcm_token, notification_preferences FROM users WHERE id = $1`,
      [userId]
    );

    const user = rows[0];
    if (!user) return;

    // 2. Check Quiet Hours
    const now = new Date();
    const currentTime = `${now.getHours()}:${now.getMinutes()}`;
    const { quietHours } = user.notification_preferences;
    
    if (currentTime >= quietHours.start || currentTime <= quietHours.end) {
      logger.info(`Notification for ${userId} skipped due to quiet hours`);
      // We still save it to the in-app inbox
    } else if (user.fcm_token) {
      // 3. Send Push via FCM
      const message = {
        notification: { title, body },
        data: { ...data, type },
        token: user.fcm_token
      };

      try {
        await admin.messaging().send(message);
      } catch (fcmErr) {
        logger.warn(`FCM send failed for user ${userId}: ${fcmErr.message}`);
      }
    }

    // 4. Save to In-App Inbox
    await query(
      `INSERT INTO notifications (user_id, type, title, body, data)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, type, title, body, JSON.stringify(data)]
    );

  } catch (err) {
    logger.error('Error sending notification:', err);
  }
};

/**
 * Fetch in-app notifications
 */
const getUserNotifications = async (userId, limit = 20) => {
  const { rows } = await query(
    `SELECT * FROM notifications 
     WHERE user_id = $1 
     ORDER BY created_at DESC 
     LIMIT $2`,
    [userId, limit]
  );
  return rows;
};

const markAsRead = async (userId, notificationId) => {
  await query(
    `UPDATE notifications SET is_read = TRUE 
     WHERE id = $1 AND user_id = $2`,
    [notificationId, userId]
  );
};

module.exports = {
  sendPushNotification,
  getUserNotifications,
  markAsRead
};
