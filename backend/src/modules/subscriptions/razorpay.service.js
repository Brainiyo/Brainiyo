const Razorpay = require('razorpay');
const crypto   = require('crypto');
const { query } = require('../../config/db');
const { AppError } = require('../../middleware/errorHandler');

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const PLAN_PRICES = {
  pro: { amount: 19900, currency: 'INR', description: 'Brainiyo Pro — 1 Month' }, // ₹199
};

/**
 * Get available subscription plans
 */
const getPlans = () => [
  {
    plan: 'free',
    price: 0,
    currency: 'INR',
    features: ['20 questions/day', 'Basic analytics', 'Spaced repetition'],
  },
  {
    plan: 'pro',
    price: 199,
    currency: 'INR',
    features: ['Unlimited questions', 'Full analytics', 'Mock tests', 'Priority support'],
  },
];

/**
 * Create a Razorpay order
 */
const createOrder = async (userId, plan) => {
  if (!PLAN_PRICES[plan]) throw new AppError('Invalid plan', 400);

  const { amount, currency, description } = PLAN_PRICES[plan];

  const order = await razorpay.orders.create({
    amount,
    currency,
    notes: { userId, plan },
    receipt: `brainiyo_${userId}_${Date.now()}`,
  });

  // Persist the order reference
  await query(
    `INSERT INTO subscriptions (user_id, plan, razorpay_order_id, is_active)
     VALUES ($1, $2, $3, FALSE)
     ON CONFLICT DO NOTHING`,
    [userId, plan, order.id]
  );

  return { razorpay_order_id: order.id, amount, currency, description };
};

/**
 * Verify Razorpay payment signature and activate subscription
 */
const verifyPayment = async (userId, { razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
  // 1. Verify HMAC signature
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    throw new AppError('Payment verification failed — invalid signature', 400);
  }

  // 2. Activate subscription (expires in 30 days)
  const result = await query(
    `UPDATE subscriptions
     SET is_active = TRUE,
         razorpay_payment_id = $1,
         started_at  = NOW(),
         expires_at  = NOW() + INTERVAL '30 days'
     WHERE razorpay_order_id = $2 AND user_id = $3
     RETURNING *`,
    [razorpay_payment_id, razorpay_order_id, userId]
  );

  if (!result.rows.length) throw new AppError('Order not found', 404);

  return result.rows[0];
};

/**
 * Get current subscription for user
 */
const getMySubscription = async (userId) => {
  const result = await query(
    `SELECT plan, started_at, expires_at, is_active
     FROM subscriptions
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [userId]
  );
  return result.rows[0] || { plan: 'free', is_active: true };
};

module.exports = { getPlans, createOrder, verifyPayment, getMySubscription };
