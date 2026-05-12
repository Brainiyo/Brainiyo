/**
 * @typedef {Object} SM2Result
 * @property {number} newInterval - The new interval in days
 * @property {number} newEaseFactor - The new ease factor (minimum 1.3)
 * @property {number} newRepetitions - The number of successful repetitions
 * @property {Date} nextReviewDate - The calculated next review date
 */

/**
 * @typedef {Object} TopicMastery
 * @property {number} masteryLevel - Score from 0 to 100
 * @property {string} masteryLabel - "Beginner" | "Developing" | "Proficient" | "Mastered"
 * @property {string} recommendedAction - Advice for the student
 */

/**
 * @typedef {Object} WeakChapter
 * @property {string} chapterId - The UUID of the chapter
 * @property {string} name - The name of the chapter
 * @property {number} accuracy - The weighted accuracy percentage
 * @property {number} priority - Ranking of weakness (1 is weakest)
 * @property {string} reason - Why this chapter is flagged
 */

/**
 * @typedef {Object} DailyPlan
 * @property {string[]} recommendedTopics - List of topic IDs
 * @property {number} targetQuestions - Recommended question goal for today
 * @property {Object[]} revisionItems - Questions due for revision
 */

module.exports = {};
