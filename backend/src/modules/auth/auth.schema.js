const Joi = require('joi');

const phoneSchema = Joi.string()
  .pattern(/^[6-9]\d{9}$/)
  .required()
  .messages({ 'string.pattern.base': 'Enter a valid 10-digit Indian mobile number' });

const sendOtpSchema = {
  body: Joi.object({ phone: phoneSchema }),
};

const verifyOtpSchema = {
  body: Joi.object({
    phone: phoneSchema,
    otp: Joi.string().length(6).pattern(/^\d+$/).required(),
  }),
};

const registerSchema = {
  body: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    phone: phoneSchema,
    email: Joi.string().email().optional().allow('', null),
    class: Joi.number().valid(11, 12, 13).required(),
    target_exam: Joi.string().valid('NEET', 'JEE').required(),
    password: Joi.string().min(6).max(100).required(),
  }),
};

const loginSchema = {
  body: Joi.object({
    phone: phoneSchema,
    password: Joi.string().required(),
  }),
};

const refreshSchema = {
  body: Joi.object({
    refreshToken: Joi.string().required(),
  }),
};

module.exports = { sendOtpSchema, verifyOtpSchema, registerSchema, loginSchema, refreshSchema };
