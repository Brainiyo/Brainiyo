const { query } = require('../../config/db');
const redis = require('../../config/redis');

const CACHE_TTL = 3600; // 1 hour — curriculum changes rarely

/**
 * Get all subjects filtered by exam type
 */
const getSubjects = async (examType) => {
  const cacheKey = `subjects:${examType || 'ALL'}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const sql = examType
    ? `SELECT id, name, exam_type, icon_url FROM subjects WHERE exam_type = $1 OR exam_type = 'BOTH' ORDER BY name`
    : `SELECT id, name, exam_type, icon_url FROM subjects ORDER BY name`;

  const result = await query(sql, examType ? [examType] : []);
  await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result.rows));
  return result.rows;
};

/**
 * Get chapters for a subject
 */
const getChapters = async (subjectId) => {
  const cacheKey = `chapters:${subjectId}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const result = await query(
    `SELECT id, subject_id, name, order_index
     FROM chapters WHERE subject_id = $1
     ORDER BY order_index ASC, name ASC`,
    [subjectId]
  );

  await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result.rows));
  return result.rows;
};

/**
 * Get topics for a chapter — also joins student stats if userId provided
 */
const getTopics = async (chapterId, userId = null) => {
  let result;

  if (userId) {
    // Join with student stats to show progress
    result = await query(
      `SELECT t.id, t.chapter_id, t.name,
              COALESCE(s.accuracy_percent, 0)   AS accuracy_percent,
              COALESCE(s.total_attempts, 0)     AS total_attempts,
              s.last_attempted_at
       FROM topics t
       LEFT JOIN student_topic_stats s
              ON s.topic_id = t.id AND s.user_id = $2
       WHERE t.chapter_id = $1
       ORDER BY t.name ASC`,
      [chapterId, userId]
    );
  } else {
    result = await query(
      `SELECT id, chapter_id, name FROM topics WHERE chapter_id = $1 ORDER BY name ASC`,
      [chapterId]
    );
  }

  return result.rows;
};

module.exports = { getSubjects, getChapters, getTopics };
