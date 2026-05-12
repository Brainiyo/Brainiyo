const express  = require('express');
const router   = express.Router();
const ctrl     = require('./subscription.controller');
const { authMiddleware } = require('../../middleware/auth');
const { validate, z }    = require('../../middleware/validate');

const createOrderSchema = {
  body: z.object({ planKey: z.enum(['pro_monthly', 'pro_yearly']) }),
};

const verifySchema = {
  body: z.object({
    razorpay_order_id:   z.string().min(1),
    razorpay_payment_id: z.string().min(1),
    razorpay_signature:  z.string().min(1),
  }),
};

router.post('/create-order',    authMiddleware, validate(createOrderSchema), ctrl.createOrder);
router.post('/verify-payment',  authMiddleware, validate(verifySchema),      ctrl.verifyPayment);
router.post('/webhook',         ctrl.handleWebhook);   // No JWT — Razorpay server-side
router.get('/status',           authMiddleware,         ctrl.getStatus);

module.exports = router;
