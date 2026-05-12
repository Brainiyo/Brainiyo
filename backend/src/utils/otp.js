const crypto = require('crypto');
const redis = require('../config/redis');
const { OTP } = require('../config/constants');
const logger = require('./logger');
const axios = require('axios');

/**
 * Generate a numeric OTP of configured length
 */
const generateOTP = () => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < OTP.LENGTH; i++) {
    otp += digits[crypto.randomInt(0, digits.length)];
  }
  return otp;
};

/**
 * Store OTP in Redis with TTL
 */
const storeOTP = async (phone, otp) => {
  const key = `otp:${phone}`;
  await redis.setex(key, OTP.TTL_SECONDS, otp);
};

/**
 * Verify OTP from Redis
 * @returns {boolean}
 */
const verifyOTP = async (phone, inputOtp) => {
  const key = `otp:${phone}`;
  const storedOtp = await redis.get(key);
  if (!storedOtp) return false;
  if (storedOtp !== inputOtp) return false;
  await redis.del(key); // one-time use
  return true;
};

/**
 * Send OTP via MSG91 (or log in dev)
 */
const sendOTP = async (phone, otp) => {
  if (process.env.NODE_ENV !== 'production') {
    logger.info(`[DEV] OTP for ${phone}: ${otp}`);
    return;
  }

  try {
    await axios.post(
      'https://api.msg91.com/api/v5/otp',
      {
        template_id: process.env.MSG91_TEMPLATE_ID,
        mobile: `91${phone}`,
        authkey: process.env.MSG91_AUTH_KEY,
        otp,
      },
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    logger.error('Failed to send OTP via MSG91', { error: err.message });
    throw new Error('SMS delivery failed');
  }
};

module.exports = { generateOTP, storeOTP, verifyOTP, sendOTP };
