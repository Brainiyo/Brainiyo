const { calculateNextReview } = require('../modules/adaptive-engine/adaptive.service');

/**
 * Map (isCorrect, timeTakenSeconds) → SM-2 quality score 0–5
 * 
 * 5 = perfect recall, very fast   (correct + <20 s)
 * 4 = correct recall, normal pace (correct + 20–90 s)
 * 3 = incorrect but remembered after seeing answer (slow incorrect)
 * 2 = incorrect but remembered after seeing answer (fast incorrect)
 * 1 = wrong + spent meaningful time
 * 0 = wrong/skipped quickly
 *
 * @param {boolean} isCorrect
 * @param {number}  timeTakenSeconds
 * @returns {0|1|2|3|4|5}
 */
const qualityScore = (isCorrect, timeTakenSeconds) => {
  if (isCorrect) {
    return timeTakenSeconds < 20 ? 5 : 4;
  }
  // Incorrect cases
  if (timeTakenSeconds > 90) return 1;
  if (timeTakenSeconds > 60) return 2;
  if (timeTakenSeconds > 30) return 3;
  return 0;
};

/**
 * Apply the SM-2 algorithm to a flashcard and return updated state.
 *
 * @param {{ interval_days: number, ease_factor: number, repetitions: number }} card
 * @param {number} quality  0–5
 * @returns {{ interval_days: number, ease_factor: number, repetitions: number, next_review_at: Date }}
 */
const applySM2 = (card, quality) => {
  const result = calculateNextReview(
    quality,
    card.repetitions,
    card.interval_days,
    card.ease_factor
  );

  return {
    interval_days: result.newInterval,
    ease_factor: result.newEaseFactor,
    repetitions: result.newRepetitions,
    next_review_at: result.nextReviewDate
  };
};

module.exports = { qualityScore, applySM2 };
