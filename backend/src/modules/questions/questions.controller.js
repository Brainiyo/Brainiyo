const { query, getClient } = require('../../config/db');
const { AppError } = require('../../middleware/errorHandler');
const { calculateSM2 } = require('../../utils/sm2');
const { recordDailyActivity } = require('../retention/streak.service');
const logger = require('../../utils/logger');

const questionsController = {
  getNext: async (req, res, next) => {
    try {
      const { topicId, mode = 'practice' } = req.query;
      const userId = req.user.id;

      let result;
      if (mode === 'revision') {
        // Get from spaced repetition queue
        result = await query(
          `SELECT q.* FROM spaced_repetition_queue sr
           JOIN questions q ON q.id = sr.question_id
           WHERE sr.user_id = $1 AND sr.next_review_at <= NOW()
           ORDER BY sr.next_review_at ASC LIMIT 1`,
          [userId]
        );
      } else {
        // Get a question student hasn't done yet, or random
        result = await query(
          `SELECT q.* FROM questions q
           LEFT JOIN student_attempts sa ON sa.question_id = q.id AND sa.user_id = $1
           WHERE q.topic_id = $2 AND q.is_active = TRUE AND sa.id IS NULL
           ORDER BY RANDOM() LIMIT 1`,
          [userId, topicId]
        );

        if (result.rows.length === 0) {
          // If all done, just get a random one from this topic
          result = await query(
            `SELECT * FROM questions WHERE topic_id = $1 AND is_active = TRUE ORDER BY RANDOM() LIMIT 1`,
            [topicId]
          );
        }
      }

      if (result.rows.length === 0) {
        return res.json({ success: true, question: null, message: 'No more questions available' });
      }

      res.json({ success: true, question: result.rows[0] });
    } catch (err) { next(err); }
  },

  submitAttempt: async (req, res, next) => {
    const client = await getClient();
    try {
      const userId = req.user.id;
      const { questionId, selectedOption, timeTakenSeconds = 0 } = req.body;

      await client.query('BEGIN');

      // 1. Fetch question details to verify answer
      const qRes = await client.query(
        'SELECT correct_option, explanation_text FROM questions WHERE id = $1',
        [questionId]
      );
      if (!qRes.rows.length) throw new AppError('Question not found', 404);
      
      const { correct_option, explanation_text } = qRes.rows[0];
      const isCorrect = String(selectedOption || '').trim().toLowerCase() === String(correct_option || '').trim().toLowerCase();
      const quality = isCorrect ? 5 : 0; // Simplified quality mapping

      // 2. Record Attempt (Trigger updates student_topic_stats)
      await client.query(
        `INSERT INTO student_attempts (user_id, question_id, selected_option, is_correct, time_taken_seconds)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, questionId, selectedOption, isCorrect, timeTakenSeconds]
      );

      // Award XP points: +10 XP if correct, +2 XP if incorrect to reward efforts
      const xpGained = isCorrect ? 10 : 2;
      await client.query(
        `UPDATE users SET xp_points = xp_points + $1 WHERE id = $2`,
        [xpGained, userId]
      );

      // 3. Update Spaced Repetition Queue
      // Get existing SR state
      const srRes = await client.query(
        'SELECT repetitions, ease_factor, interval_days FROM spaced_repetition_queue WHERE user_id = $1 AND question_id = $2',
        [userId, questionId]
      );

      const prev = srRes.rows[0] || { repetitions: 0, ease_factor: 2.5, interval_days: 0 };
      const { repetitions, easeFactor, interval, nextReviewDate } = calculateSM2(
        quality, 
        prev.repetitions, 
        parseFloat(prev.ease_factor), 
        parseFloat(prev.interval_days)
      );

      await client.query(
        `INSERT INTO spaced_repetition_queue (user_id, question_id, next_review_at, interval_days, ease_factor, repetitions)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (user_id, question_id) DO UPDATE SET
            next_review_at = EXCLUDED.next_review_at,
            interval_days  = EXCLUDED.interval_days,
            ease_factor    = EXCLUDED.ease_factor,
            repetitions    = EXCLUDED.repetitions`,
        [userId, questionId, nextReviewDate, interval, easeFactor, repetitions]
      );

      await client.query('COMMIT');

      // 4. Record Daily Activity (Async, don't block response)
      recordDailyActivity(userId).catch(err => logger.error('Streak update failed', err));

      res.json({ 
        success: true, 
        data: {
          is_correct: isCorrect,
          correct_option,
          explanation: explanation_text,
          next_review: nextReviewDate
        }
      });
    } catch (err) { 
      await client.query('ROLLBACK').catch(() => {});
      next(err); 
    } finally {
      client.release();
    }
  },

  getRevisionDue: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { rows: dueCount } = await query(
        `SELECT COUNT(*) FROM spaced_repetition_queue WHERE user_id = $1 AND next_review_at <= NOW()`,
        [userId]
      );

      const { rows: questions } = await query(
        `SELECT q.*, s.name as subject_name, c.name as chapter_name, t.name as topic_name
         FROM spaced_repetition_queue sr
         JOIN questions q ON q.id = sr.question_id
         JOIN topics t ON t.id = q.topic_id
         JOIN chapters c ON c.id = t.chapter_id
         JOIN subjects s ON s.id = c.subject_id
         WHERE sr.user_id = $1 AND sr.next_review_at <= NOW()
         ORDER BY sr.next_review_at ASC
         LIMIT 20`,
        [userId]
      );

      res.json({
        success: true,
        count: parseInt(dueCount[0].count),
        questions
      });
    } catch (err) { next(err); }
  },

  listQuestions: async (req, res, next) => {
    try {
      const { subjectId, chapterId, topicId, difficulty, search, page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      let whereClauses = ['q.is_active = TRUE'];
      let params = [];

      if (subjectId) {
        params.push(subjectId);
        whereClauses.push(`s.id = $${params.length}`);
      }
      if (chapterId) {
        params.push(chapterId);
        whereClauses.push(`c.id = $${params.length}`);
      }
      if (topicId) {
        params.push(topicId);
        whereClauses.push(`q.topic_id = $${params.length}`);
      }
      if (difficulty) {
        params.push(difficulty.toLowerCase());
        whereClauses.push(`q.difficulty = $${params.length}`);
      }
      if (search) {
        params.push(`%${search}%`);
        whereClauses.push(`(q.body ILIKE $${params.length} OR q.explanation_text ILIKE $${params.length})`);
      }

      const where = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

      const { rows } = await query(
        `SELECT q.*, s.name as subject_name, c.name as chapter_name, t.name as topic_name
         FROM questions q
         JOIN topics t ON t.id = q.topic_id
         JOIN chapters c ON c.id = t.chapter_id
         JOIN subjects s ON s.id = c.subject_id
         ${where}
         ORDER BY q.created_at DESC
         LIMIT ${parseInt(limit)} OFFSET ${offset}`,
        params
      );

      const countRes = await query(
        `SELECT COUNT(*) FROM questions q
         JOIN topics t ON t.id = q.topic_id
         JOIN chapters c ON c.id = t.chapter_id
         JOIN subjects s ON s.id = c.subject_id
         ${where}`,
        params
      );

      res.json({
        success: true,
        data: rows,
        pagination: {
          total: parseInt(countRes.rows[0].count),
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (err) { next(err); }
  },

  createQuestion: async (req, res, next) => {
    try {
      const { topic_id, body, option_a, option_b, option_c, option_d, correct_option, explanation_text, difficulty, source, image_url, q_type = 'MCQ' } = req.body;
      const isInteger = q_type === 'INTEGER';
      const { rows } = await query(
        `INSERT INTO questions (topic_id, body, option_a, option_b, option_c, option_d, correct_option, explanation_text, difficulty, source, image_url, q_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::difficulty_level, $10::question_source, $11, $12)
         RETURNING *`,
        [
          topic_id, 
          body, 
          isInteger ? null : option_a, 
          isInteger ? null : option_b, 
          isInteger ? null : option_c, 
          isInteger ? null : option_d, 
          correct_option, 
          explanation_text, 
          difficulty.toLowerCase(), 
          source, 
          image_url,
          q_type
        ]
      );
      res.status(201).json({ success: true, data: rows[0] });
    } catch (err) { next(err); }
  },

  updateQuestion: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { topic_id, body, option_a, option_b, option_c, option_d, correct_option, explanation_text, difficulty, source, is_active, q_type } = req.body;
      const isInteger = q_type === 'INTEGER';
      const { rows } = await query(
        `UPDATE questions 
         SET topic_id = $1, body = $2, 
             option_a = $3, option_b = $4, option_c = $5, option_d = $6, 
             correct_option = $7, explanation_text = $8, difficulty = $9::difficulty_level, 
             source = $10::question_source, is_active = $11, q_type = $12
         WHERE id = $13 
         RETURNING *`,
        [
          topic_id, 
          body, 
          isInteger ? null : option_a, 
          isInteger ? null : option_b, 
          isInteger ? null : option_c, 
          isInteger ? null : option_d, 
          correct_option, 
          explanation_text, 
          difficulty.toLowerCase(), 
          source, 
          is_active, 
          q_type || 'MCQ',
          id
        ]
      );
      res.json({ success: true, data: rows[0] });
    } catch (err) { next(err); }
  },

  deleteQuestion: async (req, res, next) => {
    try {
      const { id } = req.params;
      await query('UPDATE questions SET is_active = FALSE WHERE id = $1', [id]);
      res.json({ success: true, message: 'Question deleted' });
    } catch (err) { next(err); }
  },

  bulkCreateQuestions: async (req, res, next) => {
    const client = await getClient();
    try {
      const { questions } = req.body;
      await client.query('BEGIN');
      const results = [];
      
      for (const q of questions) {
        let sRes = await client.query('SELECT id FROM subjects WHERE name = $1', [q.subject]);
        let sId = sRes.rows[0]?.id;
        if (!sId) {
          sRes = await client.query('INSERT INTO subjects (name, exam_type) VALUES ($1, $2::exam_type) RETURNING id', [q.subject, q.examType === 'NEET' ? 'NEET' : 'JEE']);
          sId = sRes.rows[0].id;
        }

        let cRes = await client.query('SELECT id FROM chapters WHERE name = $1 AND subject_id = $2', [q.chapter, sId]);
        let cId = cRes.rows[0]?.id;
        if (!cId) {
          cRes = await client.query('INSERT INTO chapters (name, subject_id, class_level) VALUES ($1, $2, $3) RETURNING id', [q.chapter, sId, 11]);
          cId = cRes.rows[0].id;
        }

        let tRes = await client.query('SELECT id FROM topics WHERE name = $1 AND chapter_id = $2', [q.topic, cId]);
        let tId = tRes.rows[0]?.id;
        if (!tId) {
          tRes = await client.query('INSERT INTO topics (name, chapter_id) VALUES ($1, $2) RETURNING id', [q.topic, cId]);
          tId = tRes.rows[0].id;
        }

        const qType = q.q_type || 'MCQ';
        const qRes = await client.query(
          `INSERT INTO questions (topic_id, body, option_a, option_b, option_c, option_d, correct_option, explanation_text, difficulty, source, q_type)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::difficulty_level, $10::question_source, $11)
           RETURNING id`,
          [tId, q.body, qType === 'INTEGER' ? null : q.option_a, qType === 'INTEGER' ? null : q.option_b, qType === 'INTEGER' ? null : q.option_c, qType === 'INTEGER' ? null : q.option_d, q.correct_option, q.explanation_text, q.difficulty.toLowerCase(), 'Admin Dashboard', qType]
        );
        results.push(qRes.rows[0].id);
      }

      await client.query('COMMIT');
      res.status(201).json({ success: true, count: results.length });
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {});
      next(err);
    } finally {
      client.release();
    }
  }
};

module.exports = questionsController;
