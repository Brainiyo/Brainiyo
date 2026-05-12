const { ADAPTIVE } = require('../../config/constants');

/**
 * Map student accuracy to a target difficulty level
 * @param {number} accuracyPercent - 0 to 100
 * @returns {'easy'|'medium'|'hard'}
 */
const getTargetDifficulty = (accuracyPercent) => {
  if (accuracyPercent >= ADAPTIVE.HARD_THRESHOLD)   return 'hard';
  if (accuracyPercent >= ADAPTIVE.MEDIUM_THRESHOLD) return 'medium';
  return 'easy';
};

/**
 * Get difficulty fallback order when no question at target level found
 * @param {'easy'|'medium'|'hard'} target
 * @returns {Array<string>} ordered fallback difficulties
 */
const getDifficultyFallbacks = (target) => {
  const fallbacks = {
    easy:   ['medium', 'hard'],
    medium: ['easy', 'hard'],
    hard:   ['medium', 'easy'],
  };
  return fallbacks[target] || ['medium'];
};

module.exports = { getTargetDifficulty, getDifficultyFallbacks };
