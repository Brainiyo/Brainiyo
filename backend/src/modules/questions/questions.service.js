const { query } = require('../../config/db');
const redis = require('../../config/redis');
const { AppError } = require('../../middleware/errorHandler');
const { getTargetDifficulty, getDifficultyFallbacks } = require('./adaptive');
const { ADAPTIVE, PLANS } = require('../../config/constants');

/**
 * Build Redis key for seen questions cache
 */
const seenKey = (userId, topicId) => `seen:${userId}:${topicId}`;

/**
 * Get list of recently seen question IDs (excluded from next selection)
 */
const getSeenIds = async (userId, topicId) => {
  const ids = await redis.lrange(seenKey(userId, topicId), 0, ADAPTIVE.SEEN_QUESTION_CACHE_SIZE - 1);
  return ids;
};

/**
 * Mark a question as seen
 */
const markSeen = async (userId, topicId, questionId) => {
  const key = seenKey(userId, topicId);
  await redis.lpush(key, questionId);
  await redis.ltrim(key, 0, ADAPTIVE.SEEN_QUESTION_CACHE_SIZE - 1);
  await redis.expire(key, ADAPTIVE.SEEN_QUESTION_CACHE_TTL);
};

/**
 * Check if student has hit their daily question limit
 */
const checkDailyLimit = async (userId) => {
  const subResult = await query(
    `SELECT plan FROM subscriptions
     WHERE user_id = $1 AND is_active = TRUE
     ORDER BY created_at DESC LIMIT 1`,
    [userId]
  );

  const plan = subResult.rows[0]?.plan || 'free';
  const limit = PLANS[plan].dailyQuestionLimit;

  const countKey = `daily_q:${userId}:${new Date().toISOString().slice(0, 10)}`;
  const count = parseInt(await redis.get(countKey) || '0', 10);

  return { plan, limit, count, exceeded: count >= limit };
};

/**
 * Increment daily question counter
 */
const incrementDailyCount = async (userId) => {
  const countKey = `daily_q:${userId}:${new Date().toISOString().slice(0, 10)}`;
  await redis.incr(countKey);
  await redis.expire(countKey, 86400); // expire at end of day
};

/**
 * Fetch next question adaptively for a given topic
 */
const getNextQuestion = async (userId, topicId) => {
  // 1. Check daily limit
  const { exceeded, count, limit, plan } = await checkDailyLimit(userId);
  if (exceeded) {
    throw new AppError(
      `Daily limit of ${limit} questions reached. Upgrade to Pro for unlimited practice.`,
      429
    );
  }

  // 2. Get student's accuracy for this topic
  const statsResult = await query(
    `SELECT accuracy_percent FROM student_topic_stats
     WHERE user_id = $1 AND topic_id = $2`,
    [userId, topicId]
  );
  const accuracy = parseFloat(statsResult.rows[0]?.accuracy_percent || 0);

  // 3. Determine target difficulty
  const targetDifficulty = getTargetDifficulty(accuracy);
  const fallbacks = getDifficultyFallbacks(targetDifficulty);
  const difficultyOrder = [targetDifficulty, ...fallbacks];

  // 4. Get recently seen question IDs to exclude
  const excludedIds = await getSeenIds(userId, topicId);

  // 5. Try each difficulty level until a question is found
  let question = null;
  for (const difficulty of difficultyOrder) {
    const excludeClause = excludedIds.length
      ? `AND id != ALL($3::uuid[])`
      : '';

    const params = excludedIds.length
      ? [topicId, difficulty, excludedIds]
      : [topicId, difficulty];

    const result = await query(
      `SELECT id, topic_id, body, option_a, option_b, option_c, option_d,
              difficulty, source, image_url
       FROM questions
       WHERE topic_id = $1
         AND difficulty = $2
         AND is_active = TRUE
         ${excludeClause}
       ORDER BY RANDOM()
       LIMIT 1`,
      params
    );

    if (result.rows.length) {
      question = result.rows[0];
      break;
    }
  }

  if (!question) {
    return { question: null, message: 'You have mastered this topic! Try another.' };
  }

  // 6. Mark as seen and increment daily counter
  await markSeen(userId, topicId, question.id);
  await incrementDailyCount(userId);

  // NOTE: correct_option is intentionally excluded from response
  return {
    question,
    meta: {
      daily_used: count + 1,
      daily_limit: limit,
      plan,
      target_difficulty: targetDifficulty,
      student_accuracy: accuracy,
    },
  };
};

/**
 * Get due spaced repetition review questions
 */
const getReviewQuestions = async (userId, limit = 20) => {
  const result = await query(
    `SELECT q.id, q.body, q.option_a, q.option_b, q.option_c, q.option_d,
            q.difficulty, q.source, q.image_url,
            srq.next_review_at, srq.repetitions, srq.ease_factor
     FROM spaced_repetition_queue srq
     JOIN questions q ON q.id = srq.question_id
     WHERE srq.user_id = $1
       AND srq.next_review_at <= NOW()
       AND q.is_active = TRUE
     ORDER BY srq.next_review_at ASC
     LIMIT $2`,
    [userId, limit]
  );

  return result.rows;
};

module.exports = { getNextQuestion, getReviewQuestions };
