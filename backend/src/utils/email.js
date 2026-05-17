const { Resend } = require('resend');
const logger = require('./logger');

const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_123');

/**
 * Send an email using Resend
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    if (!process.env.RESEND_API_KEY || process.env.NODE_ENV === 'test') {
      logger.info('Skipping email send (no API key or test env)', { to, subject });
      return { success: true, id: 'mock_id' };
    }

    const { data, error } = await resend.emails.send({
      from: 'Brainiyo <noreply@brainiyo.com>',
      to,
      subject,
      html,
    });

    if (error) {
      logger.error('Resend Error', { error });
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    logger.error('Email sending failed', { error: err.message });
    return { success: false, error: err.message };
  }
};

/**
 * Template for Admin Invitation
 */
const sendAdminInvite = async (email, inviteLink) => {
  return sendEmail({
    to: email,
    subject: 'You have been invited to join the Brainiyo Admin Team',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #4F46E5;">Welcome to the Brainiyo Team!</h2>
        <p>You have been invited as an administrator to manage the Brainiyo EdTech platform.</p>
        <p>Click the button below to accept your invitation and set up your account:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${inviteLink}" style="background-color: #4F46E5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Accept Invitation
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">This invitation will expire in 48 hours.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="color: #999; font-size: 12px; text-align: center;">Brainiyo EdTech — Empowering the next generation of engineers and doctors.</p>
      </div>
    `
  });
};

/**
 * Template for Welcome Email
 */
const sendWelcomeEmail = async (email, name) => {
  return sendEmail({
    to: email,
    subject: `Welcome to Brainiyo, ${name}! 🚀`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #4F46E5;">Ready to ace NEET/JEE?</h2>
        <p>Hi ${name},</p>
        <p>We're thrilled to have you join Brainiyo. Our mission is to provide you with the most advanced, personalized tools to help you crack your entrance exams.</p>
        <p>Here's what you can do right now:</p>
        <ul>
          <li><strong>Practice Arena:</strong> Tackle 100k+ handpicked questions.</li>
          <li><strong>Mock Tests:</strong> Experience the real exam environment.</li>
          <li><strong>Deep Analytics:</strong> Identify and bridge your conceptual gaps.</li>
        </ul>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://app.brainiyo.com" style="background-color: #4F46E5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Start Practicing
          </a>
        </div>
        <p>Happy learning!<br/>Team Brainiyo</p>
      </div>
    `
  });
};

module.exports = {
  sendEmail,
  sendAdminInvite,
  sendWelcomeEmail
};
