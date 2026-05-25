const { query, getClient } = require('../../config/db');
const { AppError } = require('../../middleware/errorHandler');
const { getQualityScore, applySM2 } = require('../spaced-repetition/sm2');
const { SM2 } = require('../../config/constants');

/**
 * Record a student's attempt and update spaced repetition queue
 *
 * @param {string} userId
 * @param {string} questionId
 * @param {string|null} selectedOption  - 'A'|'B'|'C'|'D' or null (skipped)
 * @param {number} timeTakenSeconds
 */
const recordAttempt = async (userId, questionId, selectedOption, timeTakenSeconds) => {
  // 1. Fetch the question to determine correct answer
  const qResult = await query(
    `SELECT id, topic_id, correct_option, explanation_text, difficulty
     FROM questions WHERE id = $1 AND is_active = TRUE`,
    [questionId]
  );

  if (!qResult.rows.length) throw new AppError('Question not found', 404);

  const { correct_option, explanation_text, difficulty } = qResult.rows[0];
  const isCorrect = selectedOption !== null && selectedOption === correct_option;

  const client = await getClient();
  try {
    await client.query('BEGIN');

    // 2. Insert the attempt (trigger will update student_topic_stats automatically)
    const attemptResult = await client.query(
      `INSERT INTO student_attempts
         (user_id, question_id, selected_option, is_correct, time_taken_seconds)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, attempted_at`,
      [userId, questionId, selectedOption, isCorrect, timeTakenSeconds]
    );

    // 3. Update spaced repetition queue
    const srResult = await client.query(
      `SELECT * FROM spaced_repetition_queue
       WHERE user_id = $1 AND question_id = $2`,
      [userId, questionId]
    );

    let srUpdate = null;

    if (srResult.rows.length) {
      // Question already in SR queue — update with SM-2
      const card = srResult.rows[0];
      const quality = getQualityScore(isCorrect, timeTakenSeconds);
      const updated = applySM2(card, quality);

      await client.query(
        `UPDATE spaced_repetition_queue
         SET interval_days = $1, ease_factor = $2, repetitions = $3, next_review_at = $4
         WHERE user_id = $5 AND question_id = $6`,
        [updated.interval_days, updated.ease_factor, updated.repetitions, updated.next_review_at, userId, questionId]
      );

      srUpdate = { next_review_at: updated.next_review_at, interval_days: updated.interval_days };
    } else if (!isCorrect) {
      // Wrong answer for first time — add to SR queue
      await client.query(
        `INSERT INTO spaced_repetition_queue
           (user_id, question_id, next_review_at, interval_days, ease_factor, repetitions)
         VALUES ($1, $2, NOW(), $3, $4, 0)
         ON CONFLICT (user_id, question_id) DO NOTHING`,
        [userId, questionId, SM2.DEFAULT_INTERVAL_DAYS, SM2.DEFAULT_EASE_FACTOR]
      );

      srUpdate = { next_review_at: new Date(), interval_days: 1, message: 'Added to review queue' };
    }

    await client.query('COMMIT');

    return {
      attempt_id: attemptResult.rows[0].id,
      is_correct: isCorrect,
      correct_option,
      explanation: explanation_text,
      difficulty,
      sr_update: srUpdate,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Get recent attempts for a user (for history screen)
 */
const getAttemptHistory = async (userId, limit = 20, cursor = null) => {
  let sql = `
    SELECT sa.id, sa.question_id, sa.selected_option, sa.is_correct,
           sa.time_taken_seconds, sa.attempted_at,
           q.body, q.difficulty, q.topic_id,
           t.name AS topic_name
    FROM student_attempts sa
    JOIN questions q ON q.id = sa.question_id
    JOIN topics t    ON t.id = q.topic_id
    WHERE sa.user_id = $1
  `;
  const params = [userId];

  if (cursor) {
    params.push(cursor);
    sql += ` AND sa.attempted_at < $${params.length}`;
  }

  params.push(limit);
  sql += ` ORDER BY sa.attempted_at DESC LIMIT $${params.length}`;

  const result = await query(sql, params);
  return result.rows;
};

module.exports = { recordAttempt, getAttemptHistory };
