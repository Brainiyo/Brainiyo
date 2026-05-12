const crypto   = require('crypto');
const Razorpay = require('razorpay');
const { query } = require('../../config/db');
const { AppError } = require('../../middleware/errorHandler');

let razorpay;
const getRazorpay = () => {
  if (!razorpay) {
    razorpay = new Razorpay({
      key_id:     process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpay;
};

const PLAN_CONFIG = {
  pro_monthly: {
    amount:      19900,  // ₹199 in paise
    currency:    'INR',
    description: 'Brainiyo Pro — 1 Month',
    days:        30,
  },
  pro_yearly: {
    amount:      149900, // ₹1499 in paise
    currency:    'INR',
    description: 'Brainiyo Pro — 1 Year',
    days:        365,
  },
};

/* ──────────────────────────────────────────────────────────────────
   POST /api/subscriptions/create-order
   Body: { planKey: 'pro_monthly' | 'pro_yearly' }
────────────────────────────────────────────────────────────────────*/
const createOrder = async (req, res, next) => {
  try {
    const { planKey } = req.body;
    const config = PLAN_CONFIG[planKey];
    if (!config) return next(new AppError(`Invalid plan: ${planKey}`, 400));

    const receipt = `b_${req.user.id.split('-')[0]}_${Date.now()}`;

    const order = await getRazorpay().orders.create({
      amount:   config.amount,
      currency: config.currency,
      receipt,
      notes: { userId: req.user.id, planKey },
    });

    // Persist pending subscription (is_active = FALSE until payment verified)
    await query(
      `INSERT INTO subscriptions (user_id, plan, razorpay_order_id, is_active)
       VALUES ($1, 'pro', $2, FALSE)
       ON CONFLICT DO NOTHING`,
      [req.user.id, order.id]
    );

    res.status(201).json({
      success: true,
      data: {
        order_id:    order.id,
        amount:      config.amount,
        currency:    config.currency,
        description: config.description,
        key_id:      process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (err) { next(err); }
};

/* ──────────────────────────────────────────────────────────────────
   POST /api/subscriptions/verify-payment
   Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }

   Verifies HMAC-SHA256 signature, activates Pro subscription.
────────────────────────────────────────────────────────────────────*/
const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // 1. HMAC verification — critical security step
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSig !== razorpay_signature) {
      return next(new AppError('Payment signature verification failed', 400));
    }

    // 2. Determine subscription duration from the order notes
    const order = await getRazorpay().orders.fetch(razorpay_order_id);
    const planKey = order.notes?.planKey || 'pro_monthly';
    const days    = PLAN_CONFIG[planKey]?.days || 30;

    // 3. Activate subscription
    const result = await query(
      `UPDATE subscriptions
       SET is_active           = TRUE,
           razorpay_payment_id = $1,
           started_at          = NOW(),
           expires_at          = NOW() + ($2 || ' days')::INTERVAL
       WHERE razorpay_order_id = $3 AND user_id = $4
       RETURNING *`,
      [razorpay_payment_id, days, razorpay_order_id, req.user.id]
    );

    if (!result.rows.length) {
      return next(new AppError('Order not found or already processed', 404));
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
};

/* ──────────────────────────────────────────────────────────────────
   POST /api/subscriptions/webhook
   Razorpay server-to-server event (payment.captured, etc.)
   Registered in Razorpay dashboard as webhook URL.
────────────────────────────────────────────────────────────────────*/
const handleWebhook = async (req, res, next) => {
  try {
    const sig  = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);

    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || '')
      .update(body)
      .digest('hex');

    if (sig !== expected) return res.status(400).send('Invalid signature');

    const event = req.body.event;
    if (event === 'payment.captured') {
      // Idempotent: update if not already active
      const { order_id, id: payment_id } = req.body.payload.payment.entity;
      await query(
        `UPDATE subscriptions
         SET is_active = TRUE, razorpay_payment_id = $1
         WHERE razorpay_order_id = $2 AND is_active = FALSE`,
        [payment_id, order_id]
      );
    }

    res.json({ success: true });
  } catch (err) { next(err); }
};

/* ──────────────────────────────────────────────────────────────────
   GET /api/subscriptions/status
────────────────────────────────────────────────────────────────────*/
const getStatus = async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT plan, started_at, expires_at, is_active
       FROM subscriptions
       WHERE user_id = $1
       ORDER BY created_at DESC LIMIT 1`,
      [req.user.id]
    );

    const sub = rows[0] || { plan: 'free', is_active: true };

    // Auto-expire check
    const isExpired = sub.expires_at && new Date(sub.expires_at) < new Date();
    const effectivePlan = isExpired ? 'free' : sub.plan;

    res.json({
      success: true,
      data: {
        plan:       effectivePlan,
        is_active:  !isExpired && sub.is_active,
        started_at: sub.started_at,
        expires_at: sub.expires_at,
        is_expired: isExpired,
      },
    });
  } catch (err) { next(err); }
};

module.exports = { createOrder, verifyPayment, handleWebhook, getStatus };
