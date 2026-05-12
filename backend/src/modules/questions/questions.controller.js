const { query, getClient } = require('../../config/db');
const redis                = require('../../config/redis');
const { AppError }         = require('../../middleware/errorHandler');
const { qualityScore, applySM2 } = require('../../utils/sm2');
const { ADAPTIVE, PLANS, SM2 }   = require('../../config/constants');
const { selectNextQuestion }      = require('../adaptive-engine/adaptive.service');
const { recordDailyActivity }    = require('../retention/streak.service');

// ─── Helpers ────────────────────────────────────────────────────────

const seenKey   = (userId, topicId) => `seen:${userId}:${topicId}`;
const dailyKey  = (userId) =>
  `daily_q:${userId}:${new Date().toISOString().slice(0, 10)}`;

const targetDifficulty = (accuracy) => {
  if (accuracy >= ADAPTIVE.HARD_THRESHOLD)   return 'hard';
  if (accuracy >= ADAPTIVE.MEDIUM_THRESHOLD) return 'medium';
  return 'easy';
};

const difficultyFallbacks = {
  easy:   ['medium', 'hard'],
  medium: ['easy', 'hard'],
  hard:   ['medium', 'easy'],
};

/** Check / enforce daily question limit based on user's plan */
const checkDailyLimit = async (userId) => {
  const subRes = await query(
    `SELECT plan FROM subscriptions
     WHERE user_id = $1 AND is_active = TRUE ORDER BY created_at DESC LIMIT 1`,
    [userId]
  );
  const plan  = subRes.rows[0]?.plan || 'free';
  const limit = PLANS[plan].dailyQuestions;

  const count = parseInt(await redis.get(dailyKey(userId)) || '0', 10);
  return { plan, limit, count, exceeded: count >= limit };
};

/** Increment daily question counter with end-of-day expiry */
const incrementDaily = async (userId) => {
  const key = dailyKey(userId);
  await redis.incr(key);
  // Expire at midnight (seconds until next midnight)
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  await redis.expireat(key, Math.floor(midnight.getTime() / 1000));
};

// ─── Controllers ────────────────────────────────────────────────────

/* ──────────────────────────────────────────────────────────────────
   GET /api/questions/next?topicId=&mode=practice|revision

   • practice  — adaptive difficulty, excludes recently seen questions
   • revision  — serves from spaced_repetition_queue (next_review_at <= NOW)
   ────────────────────────────────────────────────────────────────── */
const getNext = async (req, res, next) => {
  try {
    const { topicId, mode = 'practice' } = req.query;
    const userId = req.user.id;

    // ── Daily limit gate ─────────────────────────────────────────
    const { exceeded, count, limit, plan } = await checkDailyLimit(userId);
    if (exceeded) {
      return next(
        new AppError(
          `Daily limit of ${limit} questions reached on your ${plan} plan.` +
          (plan === 'free' ? ' Upgrade to Pro for unlimited practice.' : ''),
          429
        )
      );
    }

    let question;

    if (mode === 'revision') {
      question = await selectNextQuestion(userId, topicId, 'revision', { query });
      if (!question) {
        return res.json({
          success: true,
          question: null,
          message: 'No revision cards due right now. Check back later!',
        });
      }
    } else {
      if (!topicId) return next(new AppError('topicId is required in practice mode', 400));
      
      question = await selectNextQuestion(userId, topicId, 'practice', { query });

      if (!question) {
        return res.json({
          success: true,
          question: null,
          message: 'You have practiced all available questions in this topic!',
        });
      }
    }

    await incrementDaily(userId);

    // NEVER send correct_option to the client before attempt
    const { correct_option, explanation_text, ...safeQuestion } = question; // eslint-disable-line

    res.json({
      success: true,
      question: safeQuestion,
      meta: { mode, daily_used: count + 1, daily_limit: limit, plan },
    });
  } catch (err) { next(err); }
};

/* ──────────────────────────────────────────────────────────────────
   POST /api/questions/attempt

   Body: { questionId, selectedOption, timeTakenSeconds }

   • Records student_attempts row
   • Trigger auto-updates student_topic_stats
   • Updates / inserts spaced_repetition_queue via SM-2
   • Returns correct_option + explanation
────────────────────────────────────────────────────────────────────*/
const submitAttempt = async (req, res, next) => {
  const client = await getClient();
  try {
    const { questionId, selectedOption, timeTakenSeconds } = req.body;
    const userId = req.user.id;

    // Fetch the question
    const qRes = await client.query(
      `SELECT id, topic_id, correct_option, explanation_text, difficulty
       FROM questions WHERE id = $1 AND is_active = TRUE`,
      [questionId]
    );
    if (!qRes.rows.length) throw new AppError('Question not found', 404);

    const { correct_option, explanation_text, difficulty, topic_id } = qRes.rows[0];
    const isCorrect = selectedOption != null && selectedOption === correct_option;

    await client.query('BEGIN');

    // 1. Insert attempt (DB trigger updates student_topic_stats automatically)
    const attemptRes = await client.query(
      `INSERT INTO student_attempts
         (user_id, question_id, selected_option, is_correct, time_taken_seconds)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, attempted_at`,
      [userId, questionId, selectedOption || null, isCorrect, timeTakenSeconds]
    );

    // 2. Update spaced repetition queue with SM-2
    const srRes = await client.query(
      `SELECT * FROM spaced_repetition_queue WHERE user_id = $1 AND question_id = $2`,
      [userId, questionId]
    );

    let srUpdate = null;

    if (srRes.rows.length) {
      // Already in queue — apply SM-2 update
      const card    = srRes.rows[0];
      const quality = qualityScore(isCorrect, timeTakenSeconds);
      const updated = applySM2(card, quality);

      await client.query(
        `UPDATE spaced_repetition_queue
         SET interval_days  = $1,
             ease_factor    = $2,
             repetitions    = $3,
             next_review_at = $4
         WHERE user_id = $5 AND question_id = $6`,
        [updated.interval_days, updated.ease_factor, updated.repetitions,
         updated.next_review_at, userId, questionId]
      );

      srUpdate = {
        next_review_at: updated.next_review_at,
        interval_days:  updated.interval_days,
        repetitions:    updated.repetitions,
      };
    } else if (!isCorrect) {
      // Wrong answer first time — add to SR queue with defaults
      await client.query(
        `INSERT INTO spaced_repetition_queue
           (user_id, question_id, next_review_at, interval_days, ease_factor, repetitions)
         VALUES ($1, $2, NOW() + INTERVAL '1 day', $3, $4, 0)
         ON CONFLICT (user_id, question_id) DO NOTHING`,
        [userId, questionId, SM2.DEFAULT_EASE_FACTOR !== undefined ? 1 : 1, SM2.DEFAULT_EASE_FACTOR]
      );
      srUpdate = { message: 'Added to spaced repetition queue for review tomorrow.' };
    }

    await client.query('COMMIT');

    // Record activity for streak (Async)
    recordDailyActivity(userId).catch(err => logger.error('Streak update failed:', err));

    // Invalidate dashboard cache for this user
    await redis.del(`dashboard:${userId}`);

    res.status(201).json({
      success: true,
      data: {
        attempt_id:       attemptRes.rows[0].id,
        attempted_at:     attemptRes.rows[0].attempted_at,
        is_correct:       isCorrect,
        correct_option,
        explanation:      explanation_text,
        difficulty,
        spaced_repetition: srUpdate,
      },
    });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    next(err);
  } finally {
    client.release();
  }
};

module.exports = { getNext, submitAttempt };
