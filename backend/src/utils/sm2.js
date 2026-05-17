/**
 * SM-2 Algorithm Implementation
 * @param {number} quality - 0-5 (0: total failure, 5: perfect response)
 * @param {number} repetitions - previous repetitions
 * @param {number} easeFactor - previous ease factor
 * @param {number} interval - previous interval in days
 * @returns {object} { repetitions, easeFactor, interval, nextReviewDate }
 */
function calculateSM2(quality, repetitions, easeFactor, interval) {
  let nextRepetitions;
  let nextEaseFactor;
  let nextInterval;

  if (quality >= 3) {
    // Correct response
    if (repetitions === 0) {
      nextInterval = 1;
    } else if (repetitions === 1) {
      nextInterval = 6;
    } else {
      nextInterval = Math.round(interval * easeFactor);
    }
    nextRepetitions = repetitions + 1;
  } else {
    // Incorrect response
    nextRepetitions = 0;
    nextInterval = 1;
  }

  // Calculate next Ease Factor (EF)
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  nextEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (nextEaseFactor < 1.3) nextEaseFactor = 1.3;

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + nextInterval);

  return {
    repetitions: nextRepetitions,
    easeFactor: nextEaseFactor,
    interval: nextInterval,
    nextReviewDate
  };
}

module.exports = { calculateSM2 };
