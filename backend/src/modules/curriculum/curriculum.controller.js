const { query } = require('../../config/db');
const redis     = require('../../config/redis');
const { CACHE } = require('../../config/constants');

/* ──────────────────────────────────────────────────────────────────────
   GET /api/content/subjects?exam=NEET|JEE
   List all subjects for the given exam type.
   Cached in Redis for 1 hour (curriculum changes rarely).
────────────────────────────────────────────────────────────────────── */
const getSubjects = async (req, res, next) => {
  try {
    const exam = req.query.exam; // optional filter
    const cacheKey = `subjects:${exam || 'ALL'}`;

    const cached = await redis.get(cacheKey);
    if (cached) return res.json({ success: true, data: JSON.parse(cached), fromCache: true });

    const { rows } = await query(
      `SELECT id, name, exam_type, icon_url
       FROM subjects
       WHERE ($1::text IS NULL OR exam_type = $1 OR exam_type = 'BOTH')
       ORDER BY name`,
      [exam || null]
    );

    await redis.setex(cacheKey, CACHE.SUBJECTS, JSON.stringify(rows));
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

/* ──────────────────────────────────────────────────────────────────────
   GET /api/content/chapters/:subjectId
   List chapters. If authenticated, includes student's accuracy per chapter.
────────────────────────────────────────────────────────────────────── */
const getChapters = async (req, res, next) => {
  try {
    const { subjectId } = req.params;
    const userId = req.user?.id || null;

    const cacheKey = `chapters:${subjectId}:${userId || 'anon'}`;
    const cached   = await redis.get(cacheKey);
    if (cached) return res.json({ success: true, data: JSON.parse(cached), fromCache: true });

    // When authenticated: aggregate accuracy across all topics in each chapter
    const { rows } = await query(
      `SELECT
         ch.id,
         ch.subject_id,
         ch.name,
         ch.order_index,
         COUNT(DISTINCT t.id)                            AS total_topics,
         COALESCE(
           ROUND(AVG(sts.accuracy_percent) FILTER (WHERE sts.user_id = $2), 1),
           NULL
         )                                               AS accuracy_percent,
         COALESCE(
           SUM(sts.total_attempts) FILTER (WHERE sts.user_id = $2),
           0
         )                                               AS total_attempts
       FROM chapters ch
       LEFT JOIN topics t            ON t.chapter_id = ch.id
       LEFT JOIN student_topic_stats sts ON sts.topic_id = t.id
       WHERE ch.subject_id = $1
       GROUP BY ch.id, ch.name, ch.order_index, ch.subject_id
       ORDER BY ch.order_index ASC, ch.name ASC`,
      [subjectId, userId]
    );

    // Cache for 1 hour (anon) or 60 s (personalised)
    const ttl = userId ? CACHE.DASHBOARD : CACHE.CHAPTERS;
    await redis.setex(cacheKey, ttl, JSON.stringify(rows));

    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

/* ──────────────────────────────────────────────────────────────────────
   GET /api/content/topics/:chapterId
   List topics. If authenticated, includes per-topic accuracy + SR due count.
────────────────────────────────────────────────────────────────────── */
const getTopics = async (req, res, next) => {
  try {
    const { chapterId } = req.params;
    const userId = req.user?.id || null;

    const { rows } = await query(
      `SELECT
         t.id,
         t.chapter_id,
         t.name,
         COALESCE(sts.total_attempts,   0)    AS total_attempts,
         COALESCE(sts.correct_attempts, 0)    AS correct_attempts,
         COALESCE(sts.accuracy_percent, NULL) AS accuracy_percent,
         sts.last_attempted_at,
         COALESCE(
           (SELECT COUNT(*) FROM spaced_repetition_queue srq
            JOIN questions q ON q.id = srq.question_id
            WHERE srq.user_id = $2 AND q.topic_id = t.id AND srq.next_review_at <= NOW()),
           0
         ) AS due_reviews
       FROM topics t
       LEFT JOIN student_topic_stats sts
              ON sts.topic_id = t.id AND sts.user_id = $2
       WHERE t.chapter_id = $1
       ORDER BY t.name ASC`,
      [chapterId, userId]
    );

    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

module.exports = { getSubjects, getChapters, getTopics };
