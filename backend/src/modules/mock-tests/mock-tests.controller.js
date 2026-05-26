const { query, getClient } = require('../../config/db');
const { AppError } = require('../../middleware/errorHandler');

module.exports = {
  // ─── ADMIN ENDPOINTS ───────────────────────────────────────────
  createTemplate: async (req, res, next) => {
    try {
      const { title, exam_type, duration_minutes, total_questions, publish_at, unpublish_at } = req.body;
      const max_marks = total_questions * 4; // Standard NEET/JEE format for max marks (assuming all 4-markers for simplicity in this phase)

      const { rows } = await query(
        `INSERT INTO exam_templates (title, exam_type, duration_minutes, total_questions, max_marks, publish_at, unpublish_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [title, exam_type, duration_minutes, total_questions, max_marks, publish_at || null, unpublish_at || null]
      );
      
      const template = rows[0];

      // Auto-generate questions from the bank for this exam type
      // We will pull random questions that belong to subjects mapped to this exam type.
      const questionsRes = await query(
        `SELECT q.id FROM questions q
         JOIN topics t ON t.id = q.topic_id
         JOIN chapters c ON c.id = t.chapter_id
         JOIN subjects s ON s.id = c.subject_id
         WHERE (s.exam_type = $1 OR s.exam_type = 'BOTH') AND q.is_active = TRUE
         ORDER BY RANDOM() LIMIT $2`,
        [exam_type, total_questions]
      );

      // Insert into linking table
      for (let i = 0; i < questionsRes.rows.length; i++) {
        await query(
          `INSERT INTO exam_template_questions (exam_template_id, question_id, order_index)
           VALUES ($1, $2, $3)`,
          [template.id, questionsRes.rows[i].id, i]
        );
      }

      res.status(201).json({ success: true, data: template, generated_questions: questionsRes.rows.length });
    } catch (err) { next(err); }
  },

  listTemplatesAdmin: async (req, res, next) => {
    try {
      const { rows } = await query(`
        SELECT et.*, 
               COUNT(mt.id) as attempt_count,
               COALESCE(AVG(mt.score), 0) as avg_score
        FROM exam_templates et
        LEFT JOIN mock_tests mt ON mt.exam_template_id = et.id
        GROUP BY et.id
        ORDER BY et.created_at DESC
      `);
      res.json({ success: true, data: rows });
    } catch (err) { next(err); }
  },

  publishTemplate: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { rows } = await query(
        `UPDATE exam_templates SET is_published = TRUE WHERE id = $1 RETURNING *`,
        [id]
      );
      res.json({ success: true, data: rows[0] });
    } catch (err) { next(err); }
  },

  unpublishTemplate: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { rows } = await query(
        `UPDATE exam_templates SET is_published = FALSE WHERE id = $1 RETURNING *`,
        [id]
      );
      res.json({ success: true, data: rows[0] });
    } catch (err) { next(err); }
  },

  updateTemplateSchedule: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { publish_at, unpublish_at } = req.body;
      const { rows } = await query(
        `UPDATE exam_templates SET publish_at = $1, unpublish_at = $2 WHERE id = $3 RETURNING *`,
        [publish_at || null, unpublish_at || null, id]
      );
      res.json({ success: true, data: rows[0] });
    } catch (err) { next(err); }
  },

  deleteTemplate: async (req, res, next) => {
    try {
      const { id } = req.params;
      await query(`DELETE FROM exam_templates WHERE id = $1`, [id]);
      res.json({ success: true, message: 'Template deleted' });
    } catch (err) { next(err); }
  },

  getTemplateDetails: async (req, res, next) => {
    try {
      const { id } = req.params;
      const templateRes = await query(`SELECT * FROM exam_templates WHERE id = $1`, [id]);
      if (templateRes.rows.length === 0) return next(new AppError('Template not found', 404));

      const questionsRes = await query(`
        SELECT q.*, s.name as subject_name, c.name as chapter_name, t.name as topic_name, etq.order_index
        FROM exam_template_questions etq
        JOIN questions q ON q.id = etq.question_id
        JOIN topics t ON t.id = q.topic_id
        JOIN chapters c ON c.id = t.chapter_id
        JOIN subjects s ON s.id = c.subject_id
        WHERE etq.exam_template_id = $1
        ORDER BY etq.order_index ASC
      `, [id]);

      res.json({
        success: true,
        data: {
          ...templateRes.rows[0],
          questions: questionsRes.rows
        }
      });
    } catch (err) { next(err); }
  },

  addQuestionsToTemplate: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { questionIds } = req.body; // Array of UUIDs

      // Get current max order_index
      const maxRes = await query(`SELECT MAX(order_index) FROM exam_template_questions WHERE exam_template_id = $1`, [id]);
      let nextOrder = (maxRes.rows[0].max || 0) + 1;

      for (const qId of questionIds) {
        await query(`
          INSERT INTO exam_template_questions (exam_template_id, question_id, order_index)
          VALUES ($1, $2, $3)
          ON CONFLICT DO NOTHING
        `, [id, qId, nextOrder++]);
      }

      // Update total_questions count and max_marks in template
      await query(`
        UPDATE exam_templates 
        SET total_questions = (SELECT COUNT(*) FROM exam_template_questions WHERE exam_template_id = $1),
            max_marks = (SELECT COUNT(*) FROM exam_template_questions WHERE exam_template_id = $1) * 4
        WHERE id = $1
      `, [id]);

      res.json({ success: true, message: 'Questions added' });
    } catch (err) { next(err); }
  },

  removeQuestionFromTemplate: async (req, res, next) => {
    try {
      const { id, questionId } = req.params;
      await query(`DELETE FROM exam_template_questions WHERE exam_template_id = $1 AND question_id = $2`, [id, questionId]);
      
      // Update total_questions count and max_marks in template
      await query(`
        UPDATE exam_templates 
        SET total_questions = (SELECT COUNT(*) FROM exam_template_questions WHERE exam_template_id = $1),
            max_marks = (SELECT COUNT(*) FROM exam_template_questions WHERE exam_template_id = $1) * 4
        WHERE id = $1
      `, [id]);

      res.json({ success: true, message: 'Question removed' });
    } catch (err) { next(err); }
  },

  bulkCreateQuestionsForTemplate: async (req, res, next) => {
    const client = await getClient();
    try {
      const { id } = req.params;
      const { questions } = req.body; // Array of question objects

      await client.query('BEGIN');

      // Verify template exists
      const templateRes = await client.query(`SELECT * FROM exam_templates WHERE id = $1`, [id]);
      if (templateRes.rows.length === 0) {
        throw new AppError('Template not found', 404);
      }

      // Get current max order_index
      const maxRes = await client.query(`SELECT MAX(order_index) FROM exam_template_questions WHERE exam_template_id = $1`, [id]);
      let nextOrder = (maxRes.rows[0].max || 0) + 1;
      const results = [];

      for (const q of questions) {
        const targetExam = q.examType === 'NEET' ? 'NEET' : 'JEE';
        let sRes = await client.query('SELECT id FROM subjects WHERE name = $1 AND exam_type = $2::exam_type', [q.subject, targetExam]);
        let sId = sRes.rows[0]?.id;
        if (!sId) {
          sRes = await client.query('INSERT INTO subjects (name, exam_type) VALUES ($1, $2::exam_type) RETURNING id', [q.subject, targetExam]);
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
        const isInteger = qType === 'INTEGER';
        const qRes = await client.query(
          `INSERT INTO questions (topic_id, body, option_a, option_b, option_c, option_d, correct_option, explanation_text, difficulty, source, image_url, q_type)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::difficulty_level, $10::question_source, $11, $12)
           RETURNING id`,
          [tId, q.body, isInteger ? null : q.option_a, isInteger ? null : q.option_b, isInteger ? null : q.option_c, isInteger ? null : q.option_d, q.correct_option, q.explanation_text, q.difficulty.toLowerCase(), 'Admin Dashboard', q.image_url || null, qType]
        );
        
        const questionId = qRes.rows[0].id;
        results.push(questionId);

        // Associate with template
        await client.query(`
          INSERT INTO exam_template_questions (exam_template_id, question_id, order_index)
          VALUES ($1, $2, $3)
          ON CONFLICT DO NOTHING
        `, [id, questionId, nextOrder++]);
      }

      // Update total_questions count and max_marks in template
      await client.query(`
        UPDATE exam_templates 
        SET total_questions = (SELECT COUNT(*) FROM exam_template_questions WHERE exam_template_id = $1),
            max_marks = (SELECT COUNT(*) FROM exam_template_questions WHERE exam_template_id = $1) * 4
        WHERE id = $1
      `, [id]);

      await client.query('COMMIT');
      res.status(201).json({ success: true, count: results.length });
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {});
      next(err);
    } finally {
      client.release();
    }
  },

  // ─── STUDENT ENDPOINTS ──────────────────────────────────────────

  listAvailableTemplates: async (req, res, next) => {
    try {
      const userExam = req.user.target_exam;
      const { rows } = await query(
        `SELECT et.*, 
                (SELECT COUNT(*) FROM mock_tests WHERE user_id = $1 AND exam_template_id = et.id) as student_attempts
         FROM exam_templates et
         WHERE (et.exam_type = $2 OR et.exam_type = 'BOTH')
           AND (
             et.is_published = TRUE OR 
             (et.publish_at IS NOT NULL AND et.publish_at <= NOW() AND (et.unpublish_at IS NULL OR et.unpublish_at > NOW()))
           )
         ORDER BY et.created_at DESC`,
        [req.user.id, userExam]
      );
      res.json({ success: true, data: rows });
    } catch (err) { next(err); }
  },

  startMockTest: async (req, res, next) => {
    try {
      const { templateId } = req.params;
      const userId = req.user.id;

      // Verify template exists and is available
      const templateRes = await query(`
        SELECT * FROM exam_templates 
        WHERE id = $1 
          AND (
            is_published = TRUE OR 
            (publish_at IS NOT NULL AND publish_at <= NOW() AND (unpublish_at IS NULL OR unpublish_at > NOW()))
          )
      `, [templateId]);
      if (templateRes.rows.length === 0) return next(new AppError('Test not found or unavailable', 404));
      
      const template = templateRes.rows[0];

      // Create new mock_test attempt
      const attemptRes = await query(
        `INSERT INTO mock_tests (user_id, exam_template_id, exam_type, total_questions)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [userId, template.id, template.exam_type, template.total_questions]
      );

      const attemptId = attemptRes.rows[0].id;

      // Fetch questions
      const questionsRes = await query(
        `SELECT q.id, q.body, q.option_a, q.option_b, q.option_c, q.option_d, q.q_type, etq.order_index
         FROM exam_template_questions etq
         JOIN questions q ON q.id = etq.question_id
         WHERE etq.exam_template_id = $1
         ORDER BY etq.order_index`,
        [template.id]
      );

      res.status(201).json({
        success: true,
        data: {
          attemptId,
          template,
          questions: questionsRes.rows
        }
      });
    } catch (err) { next(err); }
  },

  submitMockTest: async (req, res, next) => {
    const client = await getClient();
    try {
      const { attemptId } = req.params;
      const { answers } = req.body; // Array of { questionId, selectedOption }
      const userId = req.user.id;

      await client.query('BEGIN');

      // Verify attempt belongs to user and is not submitted
      const attemptRes = await client.query(`SELECT * FROM mock_tests WHERE id = $1 AND user_id = $2`, [attemptId, userId]);
      if (attemptRes.rows.length === 0) throw new AppError('Attempt not found', 404);
      if (attemptRes.rows[0].submitted_at) throw new AppError('Test already submitted', 400);

      const templateId = attemptRes.rows[0].exam_template_id;

      // Fetch correct answers for this template
      const correctRes = await client.query(
        `SELECT q.id, q.correct_option 
         FROM exam_template_questions etq
         JOIN questions q ON q.id = etq.question_id
         WHERE etq.exam_template_id = $1`,
        [templateId]
      );
      
      const correctAnswersMap = {};
      correctRes.rows.forEach(q => correctAnswersMap[q.id] = q.correct_option);

      let totalScore = 0;
      let correctCount = 0;
      let incorrectCount = 0;

      // Evaluate each answer
      for (const ans of answers) {
        if (!ans.questionId) continue;
        
        const correctOpt = correctAnswersMap[ans.questionId];
        const isCorrect = String(ans.selectedOption || '').trim().toLowerCase() === String(correctOpt || '').trim().toLowerCase();
        
        if (ans.selectedOption) {
          if (isCorrect) {
            totalScore += 4;
            correctCount++;
          } else {
            totalScore -= 1;
            incorrectCount++;
          }
        }

        // Insert into mock_test_answers
        await client.query(
          `INSERT INTO mock_test_answers (mock_test_id, question_id, selected_option, is_correct)
           VALUES ($1, $2, $3, $4)`,
          [attemptId, ans.questionId, ans.selectedOption || null, isCorrect]
        );
      }

      // Update mock_tests
      await client.query(
        `UPDATE mock_tests SET score = $1, submitted_at = NOW() WHERE id = $2`,
        [totalScore, attemptId]
      );

      // Award XP based on mock test score
      if (totalScore > 0) {
        await client.query(`UPDATE users SET xp_points = xp_points + $1 WHERE id = $2`, [totalScore, userId]);
      }

      // Fetch all questions of this mock test, along with the student's selected answer and the correct answer
      const questionsBreakdownRes = await client.query(
        `SELECT q.id, q.body, q.option_a, q.option_b, q.option_c, q.option_d, q.q_type, q.correct_option, q.explanation_text, q.image_url,
                mta.selected_option as user_answer, mta.is_correct
         FROM exam_template_questions etq
         JOIN questions q ON q.id = etq.question_id
         LEFT JOIN mock_test_answers mta ON mta.question_id = q.id AND mta.mock_test_id = $1
         WHERE etq.exam_template_id = $2
         ORDER BY etq.order_index`,
        [attemptId, templateId]
      );

      await client.query('COMMIT');

      res.json({
        success: true,
        data: {
          attemptId,
          score: totalScore,
          correct: correctCount,
          incorrect: incorrectCount,
          unattempted: correctRes.rows.length - correctCount - incorrectCount,
          questions: questionsBreakdownRes.rows
        }
      });
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {});
      next(err);
    } finally {
      client.release();
    }
  },

  listUpcomingTemplates: async (req, res, next) => {
    try {
      const userExam = req.user.target_exam;
      const { rows } = await query(
        `SELECT * FROM exam_templates
         WHERE (exam_type = $1 OR exam_type = 'BOTH')
           AND is_published = FALSE
           AND publish_at IS NOT NULL
           AND publish_at > NOW()
         ORDER BY publish_at ASC`,
        [userExam]
      );
      res.json({ success: true, data: rows });
    } catch (err) { next(err); }
  }
};
