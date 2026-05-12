const { query, getClient } = require('../../config/db');
const { AppError } = require('../../middleware/errorHandler');
const { MOCK_TEST } = require('../../config/constants');

/**
 * Sample questions for a mock test (balanced across subjects)
 */
const sampleMockQuestions = async (examType) => {
  const config = MOCK_TEST[examType];
  if (!config) throw new AppError('Invalid exam type', 400);

  const questions = [];

  // Map subject names to their question counts
  const subjectMap = examType === 'NEET'
    ? [
        { name: 'Physics',   count: config.physics },
        { name: 'Chemistry', count: config.chemistry },
        { name: 'Biology',   count: config.biology },
      ]
    : [
        { name: 'Physics',     count: config.physics },
        { name: 'Chemistry',   count: config.chemistry },
        { name: 'Mathematics', count: config.mathematics },
      ];

  for (const subject of subjectMap) {
    const result = await query(
      `SELECT q.id, q.body, q.option_a, q.option_b, q.option_c, q.option_d,
              q.difficulty, q.topic_id, t.name AS topic_name,
              s.name AS subject_name
       FROM questions q
       JOIN topics t    ON t.id = q.topic_id
       JOIN chapters ch ON ch.id = t.chapter_id
       JOIN subjects s  ON s.id = ch.subject_id
       WHERE s.name = $1
         AND (s.exam_type = $2 OR s.exam_type = 'BOTH')
         AND q.is_active = TRUE
       ORDER BY RANDOM()
       LIMIT $3`,
      [subject.name, examType, subject.count]
    );
    questions.push(...result.rows);
  }

  return questions;
};

/**
 * Start a new mock test
 */
const startMockTest = async (userId, examType) => {
  const questions = await sampleMockQuestions(examType);
  if (questions.length === 0) throw new AppError('Not enough questions available for this exam type', 404);

  const result = await query(
    `INSERT INTO mock_tests (user_id, exam_type, total_questions)
     VALUES ($1, $2, $3) RETURNING id, started_at`,
    [userId, examType, questions.length]
  );

  const mockTest = result.rows[0];

  // Strip correct_option — never sent to client during active test
  return { mock_test_id: mockTest.id, started_at: mockTest.started_at, questions };
};

/**
 * Submit a mock test and calculate score
 */
const submitMockTest = async (userId, mockTestId, answers) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    // Verify test belongs to this user and is not already submitted
    const testRes = await client.query(
      `SELECT * FROM mock_tests WHERE id = $1 AND user_id = $2`,
      [mockTestId, userId]
    );
    if (!testRes.rows.length) throw new AppError('Mock test not found', 404);
    if (testRes.rows[0].submitted_at) throw new AppError('Test already submitted', 400);

    // Fetch correct options for all submitted question IDs
    const questionIds = answers.map((a) => a.question_id);
    const qRes = await client.query(
      `SELECT id, correct_option, topic_id FROM questions WHERE id = ANY($1::uuid[])`,
      [questionIds]
    );
    const correctMap = Object.fromEntries(qRes.rows.map((q) => [q.id, q.correct_option]));

    let score = 0;
    const answerRows = answers.map((a) => {
      const isCorrect = a.selected_option && a.selected_option === correctMap[a.question_id];
      if (isCorrect) score++;
      return [mockTestId, a.question_id, a.selected_option || null, isCorrect];
    });

    // Bulk insert answers
    for (const row of answerRows) {
      await client.query(
        `INSERT INTO mock_test_answers (mock_test_id, question_id, selected_option, is_correct)
         VALUES ($1, $2, $3, $4)`,
        row
      );
    }

    // Mark test submitted with score
    await client.query(
      `UPDATE mock_tests SET score = $1, submitted_at = NOW() WHERE id = $2`,
      [score, mockTestId]
    );

    await client.query('COMMIT');

    return { mock_test_id: mockTestId, score, total: answers.length };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Get detailed result for a completed mock test
 */
const getMockTestResult = async (userId, mockTestId) => {
  const testRes = await query(
    `SELECT * FROM mock_tests WHERE id = $1 AND user_id = $2`,
    [mockTestId, userId]
  );
  if (!testRes.rows.length) throw new AppError('Mock test not found', 404);

  const answersRes = await query(
    `SELECT mta.question_id, mta.selected_option, mta.is_correct,
            q.body, q.correct_option, q.explanation_text, q.difficulty,
            s.name AS subject_name
     FROM mock_test_answers mta
     JOIN questions q ON q.id = mta.question_id
     JOIN topics t    ON t.id = q.topic_id
     JOIN chapters ch ON ch.id = t.chapter_id
     JOIN subjects s  ON s.id = ch.subject_id
     WHERE mta.mock_test_id = $1`,
    [mockTestId]
  );

  const subjectBreakdown = answersRes.rows.reduce((acc, row) => {
    if (!acc[row.subject_name]) acc[row.subject_name] = { total: 0, correct: 0 };
    acc[row.subject_name].total++;
    if (row.is_correct) acc[row.subject_name].correct++;
    return acc;
  }, {});

  return {
    test:              testRes.rows[0],
    subject_breakdown: subjectBreakdown,
    wrong_questions:   answersRes.rows.filter((r) => !r.is_correct),
  };
};

/**
 * Get mock test history for a user
 */
const getMockTestHistory = async (userId) => {
  const result = await query(
    `SELECT id, exam_type, total_questions, score, started_at, submitted_at
     FROM mock_tests
     WHERE user_id = $1 AND submitted_at IS NOT NULL
     ORDER BY submitted_at DESC
     LIMIT 20`,
    [userId]
  );
  return result.rows;
};

module.exports = { startMockTest, submitMockTest, getMockTestResult, getMockTestHistory };
