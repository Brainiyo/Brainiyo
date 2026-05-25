const { z } = require('zod');

/**
 * Zod validation middleware factory.
 * Usage: validate({ body: schema }) or validate({ query: schema, params: schema })
 */
const validate = (schemas) => (req, res, next) => {
  try {
    if (schemas.body)   req.body   = schemas.body.parse(req.body);
    if (schemas.query)  req.query  = schemas.query.parse(req.query);
    if (schemas.params) req.params = schemas.params.parse(req.params);
    next();
  } catch (err) {
    // Let the global errorHandler format ZodError consistently
    next(err);
  }
};

// ── Shared schemas ─────────────────────────────────────────────────
const uuidSchema   = z.string().uuid();
const examSchema   = z.enum(['NEET', 'JEE']);
const optionSchema = z.enum(['A', 'B', 'C', 'D']);

module.exports = { validate, uuidSchema, examSchema, optionSchema, z };
