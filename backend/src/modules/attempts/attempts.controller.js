const attemptsService = require('./attempts.service');
const Joi = require('joi');
const { AppError } = require('../../middleware/errorHandler');

const attemptSchema = Joi.object({
  question_id:        Joi.string().uuid().required(),
  selected_option:    Joi.string().valid('A', 'B', 'C', 'D').allow(null).default(null),
  time_taken_seconds: Joi.number().integer().min(0).max(7200).required(),
});

const recordAttempt = async (req, res, next) => {
  try {
    const { error, value } = attemptSchema.validate(req.body);
    if (error) throw new AppError(error.details[0].message, 400);

    const result = await attemptsService.recordAttempt(
      req.user.id,
      value.question_id,
      value.selected_option,
      value.time_taken_seconds
    );
    res.status(201).json({ success: true, data: result });
  } catch (err) { next(err); }
};

const getHistory = async (req, res, next) => {
  try {
    const limit  = Math.min(parseInt(req.query.limit, 10) || 20, 50);
    const cursor = req.query.cursor || null;
    const rows   = await attemptsService.getAttemptHistory(req.user.id, limit, cursor);
    const nextCursor = rows.length === limit ? rows[rows.length - 1].attempted_at : null;
    res.json({ success: true, data: rows, nextCursor });
  } catch (err) { next(err); }
};

module.exports = { recordAttempt, getHistory };
