const { SM2 } = require('../../config/constants');

/**
 * Convert attempt result to SM-2 quality score (0–5)
 *
 * @param {boolean} isCorrect
 * @param {number}  timeTakenSeconds
 * @returns {number} quality 0–5
 */
const getQualityScore = (isCorrect, timeTakenSeconds) => {
  if (!isCorrect) {
    // Wrong answer — check if they at least knew the concept
    if (timeTakenSeconds > 60) return 1; // spent time but still wrong
    return 0; // gave up quickly / guessed
  }
  // Correct answers graded by speed
  if (timeTakenSeconds < 30)  return 5; // fast + correct
  if (timeTakenSeconds < 90)  return 4; // normal pace
  return 3;                             // slow but correct
};

/**
 * Apply SM-2 algorithm and return updated card values
 *
 * @param {object} card - current card state
 * @param {number} quality - 0 to 5
 * @returns {object} updated card state
 */
const applySM2 = (card, quality) => {
  let { interval_days, ease_factor, repetitions } = card;

  interval_days  = parseFloat(interval_days);
  ease_factor    = parseFloat(ease_factor);
  repetitions    = parseInt(repetitions, 10);

  if (quality >= 3) {
    // Successful recall
    if (repetitions === 0)      interval_days = 1;
    else if (repetitions === 1) interval_days = 6;
    else                        interval_days = Math.round(interval_days * ease_factor);

    repetitions += 1;
  } else {
    // Failed recall — reset streak
    repetitions   = 0;
    interval_days = 1;
  }

  // Update ease factor using SM-2 formula, clamp to minimum
  const newEF = ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  ease_factor = Math.max(SM2.MIN_EASE_FACTOR, parseFloat(newEF.toFixed(2)));

  // Calculate next review timestamp
  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + interval_days);

  return {
    interval_days: parseFloat(interval_days.toFixed(2)),
    ease_factor,
    repetitions,
    next_review_at: nextReviewAt,
  };
};

module.exports = { getQualityScore, applySM2 };
