const bcrypt = require('bcryptjs');
const { query } = require('../../config/db');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../../utils/jwt');
const { generateOTP, storeOTP, verifyOTP, sendOTP } = require('../../utils/otp');
const { AppError } = require('../../middleware/errorHandler');

/**
 * Send OTP to phone number
 */
const sendOtp = async (phone) => {
  const otp = generateOTP();
  await storeOTP(phone, otp);
  await sendOTP(phone, otp);
  return { message: 'OTP sent successfully' };
};

/**
 * Verify OTP — marks phone as verified in Redis (used before registration)
 */
const verifyOtp = async (phone, otp) => {
  const valid = await verifyOTP(phone, otp);
  if (!valid) throw new AppError('Invalid or expired OTP', 400);

  // Store verification token in Redis for 10 minutes
  const redis = require('../../config/redis');
  await redis.setex(`phone_verified:${phone}`, 600, '1');

  return { message: 'Phone verified successfully' };
};

/**
 * Register new user — requires phone to have been OTP-verified first
 */
const register = async ({ name, phone, email, class: studentClass, target_exam, password }) => {
  const redis = require('../../config/redis');

  // Check phone was recently verified
  const isVerified = await redis.get(`phone_verified:${phone}`);
  if (!isVerified) throw new AppError('Phone number not verified. Please verify OTP first.', 403);

  // Check for existing account
  const existing = await query('SELECT id FROM users WHERE phone = $1', [phone]);
  if (existing.rows.length) throw new AppError('Account with this phone number already exists', 409);

  const password_hash = await bcrypt.hash(password, 12);

  const result = await query(
    `INSERT INTO users (name, phone, email, class, target_exam, password_hash, is_verified)
     VALUES ($1, $2, $3, $4, $5, $6, TRUE)
     RETURNING id, name, phone, email, class, target_exam, created_at`,
    [name, phone, email || null, studentClass, target_exam, password_hash]
  );

  const user = result.rows[0];
  await redis.del(`phone_verified:${phone}`);

  // Create free subscription by default
  await query(
    `INSERT INTO subscriptions (user_id, plan) VALUES ($1, 'free')`,
    [user.id]
  );

  const accessToken  = signAccessToken({ userId: user.id, phone });
  const refreshToken = signRefreshToken({ userId: user.id, phone });

  return { token: accessToken, refreshToken, user };
};

/**
 * Login with phone + password
 */
const login = async (phone, password) => {
  const result = await query(
    'SELECT id, name, phone, email, class, target_exam, password_hash, is_verified FROM users WHERE phone = $1',
    [phone]
  );

  if (!result.rows.length) throw new AppError('Invalid phone number or password', 401);

  const user = result.rows[0];
  if (!user.is_verified) throw new AppError('Please verify your phone number first', 403);

  const passwordMatch = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatch) throw new AppError('Invalid phone number or password', 401);

  // eslint-disable-next-line no-unused-vars
  const { password_hash, ...safeUser } = user;

  const accessToken  = signAccessToken({ userId: user.id, phone });
  const refreshToken = signRefreshToken({ userId: user.id, phone });

  return { token: accessToken, refreshToken, user: safeUser };
};

/**
 * Refresh access token using a valid refresh token
 */
const refresh = (refreshToken) => {
  try {
    const decoded = verifyRefreshToken(refreshToken);
    const newAccessToken = signAccessToken({ userId: decoded.userId, phone: decoded.phone });
    return { token: newAccessToken };
  } catch {
    throw new AppError('Invalid or expired refresh token', 401);
  }
};

module.exports = { sendOtp, verifyOtp, register, login, refresh };
