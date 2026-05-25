

/**
 * 1. SM-2 Spaced Repetition Algorithm
 * 
 * @param {number} quality - Quality of response (0-5)
 * @param {number} repetitions - Current successful repetitions
 * @param {number} interval - Current interval in days
 * @param {number} easeFactor - Current ease factor
 * @returns {import('./types').SM2Result}
 */
const calculateNextReview = (quality, repetitions, interval, easeFactor) => {
  let newInterval;
  let newEaseFactor;
  let newRepetitions;

  if (quality >= 3) {
    if (repetitions === 0) {
      newInterval = 1;
    } else if (repetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * easeFactor);
    }
    newRepetitions = repetitions + 1;
  } else {
    newRepetitions = 0;
    newInterval = 1;
  }

  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEaseFactor < 1.3) newEaseFactor = 1.3;

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

  return {
    newInterval,
    newEaseFactor: parseFloat(newEaseFactor.toFixed(2)),
    newRepetitions,
    nextReviewDate
  };
};

/**
 * 2. Adaptive Question Selector
 * 
 * @param {string} userId 
 * @param {string} topicId 
 * @param {'practice'|'revision'} mode 
 * @param {Object} db - Database client/pool
 */
const selectNextQuestion = async (userId, topicId, mode, db) => {
  if (mode === 'revision') {
    const { rows } = await db.query(
      `SELECT q.*, srq.next_review_at 
       FROM spaced_repetition_queue srq
       JOIN questions q ON q.id = srq.question_id
       WHERE srq.user_id = $1 
       AND q.topic_id = $2
       AND srq.next_review_at <= NOW()
       ORDER BY (EXTRACT(EPOCH FROM (NOW() - srq.next_review_at)) / 86400) DESC
       LIMIT 1`,
      [userId, topicId]
    );
    return rows[0] || null;
  }

  // Practice Mode Logic
  // 1. Fetch accuracy
  const statsRes = await db.query(
    `SELECT accuracy_percent FROM student_topic_stats 
     WHERE user_id = $1 AND topic_id = $2`,
    [userId, topicId]
  );
  const accuracy = statsRes.rows[0]?.accuracy_percent || 0;

  // 2. Determine difficulty mix
  let difficultyWeights = [];
  if (accuracy < 40) {
    difficultyWeights = [{ diff: 'easy', weight: 1.0 }];
  } else if (accuracy <= 70) {
    difficultyWeights = [{ diff: 'easy', weight: 0.3 }, { diff: 'medium', weight: 0.7 }];
  } else {
    difficultyWeights = [{ diff: 'medium', weight: 0.4 }, { diff: 'hard', weight: 0.6 }];
  }

  // 3. Filter out questions attempted in last 24 hours
  // 4. Prioritize NCERT > PYQ > NEW
  // We use a weighted random or sequential check based on priority
  
  for (const { diff } of difficultyWeights) {
    const { rows } = await db.query(
      `SELECT q.* FROM questions q
       LEFT JOIN student_attempts sa ON sa.question_id = q.id AND sa.user_id = $1 AND sa.attempted_at > NOW() - INTERVAL '24 hours'
       WHERE q.topic_id = $2 
       AND q.difficulty = $3
       AND sa.id IS NULL
       AND q.is_active = TRUE
       ORDER BY 
         CASE q.source WHEN 'NCERT' THEN 1 WHEN 'PYQ' THEN 2 ELSE 3 END,
         RANDOM()
       LIMIT 1`,
      [userId, topicId, diff]
    );
    if (rows.length > 0) return rows[0];
  }

  // 5. If all exhausted, reset and pick lowest accuracy one
  const { rows: exhaustedRows } = await db.query(
    `SELECT q.* FROM questions q
     JOIN student_attempts sa ON sa.question_id = q.id AND sa.user_id = $1
     WHERE q.topic_id = $2
     AND q.is_active = TRUE
     GROUP BY q.id
     ORDER BY (COUNT(CASE WHEN sa.is_correct THEN 1 END)::float / COUNT(*)) ASC, RANDOM()
     LIMIT 1`,
    [userId, topicId]
  );
  
  return exhaustedRows[0] || null;
};

/**
 * 3. Topic Mastery Calculator
 * 
 * @param {string} userId 
 * @param {string} topicId 
 * @param {Object} db 
 * @returns {Promise<import('./types').TopicMastery>}
 */
const calculateTopicMastery = async (userId, topicId, db) => {
  const { rows } = await db.query(
    `SELECT is_correct, time_taken_seconds, attempted_at
     FROM student_attempts
     WHERE user_id = $1 AND question_id IN (SELECT id FROM questions WHERE topic_id = $2)
     ORDER BY attempted_at DESC`,
    [userId, topicId]
  );

  if (rows.length === 0) {
    return {
      masteryLevel: 0,
      masteryLabel: 'Beginner',
      recommendedAction: 'Start practicing easy questions to build your foundation.'
    };
  }

  let totalWeightedScore = 0;
  let totalWeight = 0;

  rows.forEach((attempt, index) => {
    const isRecent = index < 20;
    const weight = isRecent ? 1.5 : 1.0;
    
    let correctness = attempt.is_correct ? 1.0 : 0.0;
    
    // Penalties and Rewards
    if (attempt.is_correct) {
      if (attempt.time_taken_seconds > 90) correctness = 0.5;
      if (attempt.time_taken_seconds < 20) correctness = 1.2;
    }

    totalWeightedScore += correctness * weight;
    totalWeight += weight;
  });

  const masteryLevel = Math.min(100, Math.round((totalWeightedScore / totalWeight) * 100));
  
  let masteryLabel = 'Beginner';
  let recommendedAction = 'Practice easy questions first.';

  if (masteryLevel > 85) {
    masteryLabel = 'Mastered';
    recommendedAction = 'You are ready for the exam! Focus on maintaining speed.';
  } else if (masteryLevel > 70) {
    masteryLabel = 'Proficient';
    recommendedAction = 'Focus on hard questions and PYQs to reach mastery.';
  } else if (masteryLevel > 40) {
    masteryLabel = 'Developing';
    recommendedAction = 'Mix medium and easy questions to improve accuracy.';
  }

  return { masteryLevel, masteryLabel, recommendedAction };
};

/**
 * 4. Weak Chapter Identifier
 * 
 * @param {string} userId 
 * @param {string} subjectId 
 * @param {Object} db 
 * @returns {Promise<import('./types').WeakChapter[]>}
 */
const getWeakChapters = async (userId, subjectId, db) => {
  const { rows } = await db.query(
    `SELECT 
       ch.id as chapter_id, 
       ch.name,
       AVG(sts.accuracy_percent) as accuracy,
       COUNT(sts.topic_id) as topics_attempted,
       MAX(sts.last_attempted_at) as last_activity
     FROM chapters ch
     LEFT JOIN topics t ON t.chapter_id = ch.id
     LEFT JOIN student_topic_stats sts ON sts.topic_id = t.id AND sts.user_id = $1
     WHERE ch.subject_id = $2
     GROUP BY ch.id, ch.name
     ORDER BY 
       CASE WHEN AVG(sts.accuracy_percent) IS NULL THEN 1 ELSE 0 END DESC, -- Untouched first
       accuracy ASC,
       last_activity ASC
     LIMIT 3`,
    [userId, subjectId]
  );

  return rows.map((r, i) => ({
    chapterId: r.chapter_id,
    name: r.name,
    accuracy: Math.round(r.accuracy || 0),
    priority: i + 1,
    reason: r.accuracy === null ? 'Chapter has not been started yet.' : `Low accuracy of ${Math.round(r.accuracy)}%.`
  }));
};

/**
 * 5. Daily Study Recommendation
 * 
 * @param {string} userId 
 * @param {Object} db 
 */
const getDailyPlan = async (userId, db) => {
  // 1. Get streak and today's count
  const streakRes = await db.query(
    `SELECT COUNT(*) as count FROM student_attempts 
     WHERE user_id = $1 AND attempted_at >= CURRENT_DATE`,
    [userId]
  );
  
  // 2. Get revision due
  const revisionRes = await db.query(
    `SELECT q.topic_id, COUNT(*) as count
     FROM spaced_repetition_queue srq
     JOIN questions q ON q.id = srq.question_id
     WHERE srq.user_id = $1 AND srq.next_review_at <= NOW()
     GROUP BY q.topic_id
     LIMIT 5`,
    [userId]
  );

  // 3. Recommended topics (mix of weak and new)
  const weakRes = await db.query(
    `SELECT t.id, t.name FROM topics t
     JOIN chapters ch ON ch.id = t.chapter_id
     JOIN student_topic_stats sts ON sts.topic_id = t.id AND sts.user_id = $1
     WHERE sts.accuracy_percent < 50
     LIMIT 2`,
    [userId]
  );

  return {
    recommendedTopics: weakRes.rows,
    targetQuestions: 30,
    revisionItems: revisionRes.rows,
    todayProgress: streakRes.rows[0].count
  };
};

module.exports = {
  calculateNextReview,
  selectNextQuestion,
  calculateTopicMastery,
  getWeakChapters,
  getDailyPlan
};
