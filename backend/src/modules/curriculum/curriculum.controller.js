const { query } = require('../../config/db');
const redis     = require('../../config/redis');
const { CACHE } = require('../../config/constants');

const clearCurriculumCache = async () => {
  try {
    if (redis.status === 'ready') {
      const keys = await redis.keys('subjects:*');
      const keys2 = await redis.keys('chapters:*');
      const allKeys = [...keys, ...keys2];
      for (const key of allKeys) {
        await redis.del(key);
      }
    }
  } catch {
    // Ignore cache clearing errors
  }
};

const controller = {
  /* ──────────────────────────────────────────────────────────────────────
     GET /api/content/subjects?exam=NEET|JEE
     List all subjects for the given exam type.
  ────────────────────────────────────────────────────────────────────── */
  getSubjects: async (req, res, next) => {
    try {
      // Always respect target_exam — even Dropper students should only see
      // their exam's subjects (NEET → PHY/CHEM/BIO, JEE → PHY/CHEM/MATH)
      const exam = req.user?.target_exam || req.query.exam || null;
      const cacheKey = `subjects:${exam || 'ALL'}`;

      const cached = await redis.get(cacheKey);
      if (cached) return res.json({ success: true, data: JSON.parse(cached), fromCache: true });

      const { rows } = await query(
        `SELECT id, name, exam_type, icon_url
         FROM subjects
         WHERE ($1::text IS NULL OR exam_type::text = $1::text OR exam_type::text = 'BOTH')
         ORDER BY name`,
        [exam]
      );

      await redis.setex(cacheKey, CACHE.SUBJECTS, JSON.stringify(rows));
      res.json({ success: true, data: rows });
    } catch (err) { next(err); }
  },

  /* ──────────────────────────────────────────────────────────────────────
     GET /api/content/chapters/:subjectId
  ────────────────────────────────────────────────────────────────────── */
  getChapters: async (req, res, next) => {
    try {
      const { subjectId } = req.params;
      const userId = req.user?.id || null;
      const userClass = req.user?.class || 11;
      const cacheKey = `chapters:${subjectId}:${userClass}:${userId || 'anon'}`;

      const cached   = await redis.get(cacheKey);
      if (cached) return res.json({ success: true, data: JSON.parse(cached), fromCache: true });

      const classFilter = (userClass === 13) ? [11, 12] : [userClass];

      const { rows } = await query(
        `SELECT
           ch.id, ch.subject_id, ch.name, ch.order_index, ch.class_level,
           COUNT(DISTINCT t.id) AS total_topics,
           COALESCE(ROUND(AVG(sts.accuracy_percent) FILTER (WHERE sts.user_id = $2), 1), NULL) AS accuracy_percent,
           COALESCE(SUM(sts.total_attempts) FILTER (WHERE sts.user_id = $2), 0) AS total_attempts
         FROM chapters ch
         LEFT JOIN topics t ON t.chapter_id = ch.id
         LEFT JOIN student_topic_stats sts ON sts.topic_id = t.id
         WHERE ch.subject_id = $1 AND (ch.class_level = ANY($3::int[]) OR ch.class_level IS NULL)
         GROUP BY ch.id, ch.name, ch.order_index, ch.subject_id, ch.class_level
         ORDER BY ch.class_level ASC, ch.order_index ASC, ch.name ASC`,
        [subjectId, userId, classFilter]
      );

      const ttl = userId ? CACHE.DASHBOARD : CACHE.CHAPTERS;
      await redis.setex(cacheKey, ttl, JSON.stringify(rows));
      res.json({ success: true, data: rows });
    } catch (err) { next(err); }
  },

  /* ──────────────────────────────────────────────────────────────────────
     GET /api/content/topics/:chapterId
  ────────────────────────────────────────────────────────────────────── */
  getTopics: async (req, res, next) => {
    try {
      const { chapterId } = req.params;
      const userId = req.user?.id || null;

      const { rows } = await query(
        `SELECT
           t.id, t.chapter_id, t.name,
           COALESCE(sts.total_attempts, 0) AS total_attempts,
           COALESCE(sts.correct_attempts, 0) AS correct_attempts,
           COALESCE(sts.accuracy_percent, NULL) AS accuracy_percent,
           sts.last_attempted_at,
           (SELECT COUNT(*) FROM spaced_repetition_queue srq
            JOIN questions q ON q.id = srq.question_id
            WHERE srq.user_id = $2 AND q.topic_id = t.id AND srq.next_review_at <= NOW()) AS due_reviews
         FROM topics t
         LEFT JOIN student_topic_stats sts ON sts.topic_id = t.id AND sts.user_id = $2
         WHERE t.chapter_id = $1 ORDER BY t.name ASC`,
        [chapterId, userId]
      );
      res.json({ success: true, data: rows });
    } catch (err) { next(err); }
  },

  // Admin CRUD
  createSubject: async (req, res, next) => {
    try {
      const { name, exam_type, icon_url } = req.body;
      const { rows } = await query(
        `INSERT INTO subjects (name, exam_type, icon_url) VALUES ($1, $2, $3) RETURNING *`,
        [name, exam_type, icon_url]
      );
      await clearCurriculumCache();
      res.status(201).json({ success: true, data: rows[0] });
    } catch (err) { next(err); }
  },

  updateSubject: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, exam_type, icon_url } = req.body;
      const { rows } = await query(
        `UPDATE subjects SET name = $1, exam_type = $2, icon_url = $3 WHERE id = $4 RETURNING *`,
        [name, exam_type, icon_url, id]
      );
      await clearCurriculumCache();
      res.json({ success: true, data: rows[0] });
    } catch (err) { next(err); }
  },

  deleteSubject: async (req, res, next) => {
    try {
      const { id } = req.params;
      await query('DELETE FROM subjects WHERE id = $1', [id]);
      await clearCurriculumCache();
      res.json({ success: true, message: 'Subject deleted' });
    } catch (err) { next(err); }
  },

  createChapter: async (req, res, next) => {
    try {
      const { subject_id, name, order_index, class_level } = req.body;
      const { rows } = await query(
        `INSERT INTO chapters (subject_id, name, order_index, class_level) VALUES ($1, $2, $3, $4) RETURNING *`,
        [subject_id, name, order_index, class_level]
      );
      await clearCurriculumCache();
      res.status(201).json({ success: true, data: rows[0] });
    } catch (err) { next(err); }
  },

  updateChapter: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, order_index, class_level } = req.body;
      const { rows } = await query(
        `UPDATE chapters SET name = $1, order_index = $2, class_level = $3 WHERE id = $4 RETURNING *`,
        [name, order_index, class_level, id]
      );
      await clearCurriculumCache();
      res.json({ success: true, data: rows[0] });
    } catch (err) { next(err); }
  },

  deleteChapter: async (req, res, next) => {
    try {
      const { id } = req.params;
      await query('DELETE FROM chapters WHERE id = $1', [id]);
      await clearCurriculumCache();
      res.json({ success: true, message: 'Chapter deleted' });
    } catch (err) { next(err); }
  },

  createTopic: async (req, res, next) => {
    try {
      const { chapter_id, name } = req.body;
      const { rows } = await query(
        `INSERT INTO topics (chapter_id, name) VALUES ($1, $2) RETURNING *`,
        [chapter_id, name]
      );
      await clearCurriculumCache();
      res.status(201).json({ success: true, data: rows[0] });
    } catch (err) { next(err); }
  },

  updateTopic: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name } = req.body;
      const { rows } = await query(
        `UPDATE topics SET name = $1 WHERE id = $2 RETURNING *`,
        [name, id]
      );
      await clearCurriculumCache();
      res.json({ success: true, data: rows[0] });
    } catch (err) { next(err); }
  },

  deleteTopic: async (req, res, next) => {
    try {
      const { id } = req.params;
      await query('DELETE FROM topics WHERE id = $1', [id]);
      await clearCurriculumCache();
      res.json({ success: true, message: 'Topic deleted' });
    } catch (err) { next(err); }
  },

  getStudentPerformance: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const userClass = req.user.class || 11;
      // Dropper (class=13) sees both Class 11 and 12 content
      const classFilter = (userClass === 13) ? [11, 12] : [userClass];

      const { rows } = await query(
        `SELECT 
           s.name as subject_name, s.id as subject_id,
           COUNT(DISTINCT ch.id) as total_chapters, COUNT(DISTINCT t.id) as total_topics,
           COALESCE(AVG(sts.accuracy_percent), 0) as avg_accuracy, 
           COALESCE(SUM(sts.total_attempts), 0) as total_attempts,
           COALESCE((
             SELECT AVG(sa.time_taken_seconds)
             FROM student_attempts sa
             JOIN questions q ON q.id = sa.question_id
             JOIN topics tp ON tp.id = q.topic_id
             JOIN chapters c ON c.id = tp.chapter_id
             WHERE sa.user_id = $1 AND c.subject_id = s.id
           ), 0) as avg_time_taken
         FROM subjects s
         LEFT JOIN chapters ch ON ch.subject_id = s.id
           AND (ch.class_level = ANY($2::int[]) OR ch.class_level IS NULL)
         LEFT JOIN topics t ON t.chapter_id = ch.id
         LEFT JOIN student_topic_stats sts ON sts.topic_id = t.id AND sts.user_id = $1
         WHERE (s.exam_type = (SELECT target_exam FROM users WHERE id = $1) OR s.exam_type = 'BOTH')
         GROUP BY s.id, s.name ORDER BY s.name`,
        [userId, classFilter]
      );
      res.json({ success: true, data: rows });
    } catch (err) { next(err); }
  },

  getWeakTopics: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { rows } = await query(
        `SELECT 
           t.id, t.name as topic_name, ch.name as chapter_name, s.name as subject_name,
           sts.accuracy_percent, sts.total_attempts
         FROM topics t
         JOIN chapters ch ON ch.id = t.chapter_id
         JOIN subjects s ON s.id = ch.subject_id
         JOIN student_topic_stats sts ON sts.topic_id = t.id
         WHERE sts.user_id = $1 AND sts.accuracy_percent < 40 AND sts.total_attempts >= 3
         ORDER BY sts.accuracy_percent ASC LIMIT 5`,
        [userId]
      );
      res.json({ success: true, data: rows });
    } catch (err) { next(err); }
  },

  getFullHierarchy: async (req, res, next) => {
    try {
      const { rows } = await query(`
        SELECT 
          s.id as subject_id, s.name as subject_name, s.exam_type,
          c.id as chapter_id, c.name as chapter_name, c.class_level,
          t.id as topic_id, t.name as topic_name
        FROM subjects s
        LEFT JOIN chapters c ON c.subject_id = s.id
        LEFT JOIN topics t ON t.chapter_id = c.id
        ORDER BY s.name, c.order_index, t.name
      `);

      const hierarchy = [];
      rows.forEach(row => {
        let subject = hierarchy.find(s => s.id === row.subject_id);
        if (!subject) {
          subject = { id: row.subject_id, name: row.subject_name, exam_type: row.exam_type, chapters: [] };
          hierarchy.push(subject);
        }
        if (row.chapter_id) {
          let chapter = subject.chapters.find(c => c.id === row.chapter_id);
          if (!chapter) {
            chapter = { id: row.chapter_id, name: row.chapter_name, class_level: row.class_level, topics: [] };
            subject.chapters.push(chapter);
          }
          if (row.topic_id) {
            chapter.topics.push({ id: row.topic_id, name: row.topic_name });
          }
        }
      });
      res.json({ success: true, data: hierarchy });
    } catch (err) { next(err); }
  }
};

module.exports = controller;
