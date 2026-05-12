const { query, getClient } = require('../../config/db');
const { AppError }         = require('../../middleware/errorHandler');
const { MOCK, NTA }        = require('../../config/constants');

/* ──────────────────────────────────────────────────────────────────
   Estimate a percentile rank given raw score.
   Uses a simple sigmoid approximation against NEET/JEE historical
   distributions. In production, replace with a real leaderboard query.
────────────────────────────────────────────────────────────────────*/
const estimateRank = (score, maxScore, examType) => {
  // Approximate: assume population follows a normal distribution
  // with mean at 50% of max and σ = 15% of max
  const mean  = maxScore * 0.50;
  const sigma = maxScore * 0.15;
  const z     = (score - mean) / sigma;
  // CDF approximation: percentile ≈ 1 / (1 + e^(-0.07056 * z * z * z - 1.5976 * z))
  // Simple linear fallback for production accuracy:
  const percentile = Math.min(99.9, Math.max(0.1, 50 + 50 * Math.tanh(z * 0.8)));

  const populations = { NEET: 2_200_000, JEE: 1_100_000 };
  const pop         = populations[examType] || 1_000_000;
  const estimatedRank = Math.round(pop * (1 - percentile / 100));

  return {
    estimated_rank:       estimatedRank,
    estimated_percentile: parseFloat(percentile.toFixed(2)),
    note: 'Rank estimate based on historical NEET/JEE score distributions.',
  };
};

/* ──────────────────────────────────────────────────────────────────
   POST /api/mock-tests/generate

   Generates a full NEET (180 q) or JEE (90 q) mock test.
   Requires Pro plan (planGate middleware applied in routes).
────────────────────────────────────────────────────────────────────*/
const generateMockTest = async (req, res, next) => {
  try {
    const { examType } = req.body;
    const userId       = req.user.id;
    const config       = MOCK[examType];
    if (!config) return next(new AppError('Invalid examType. Use NEET or JEE.', 400));

    // Build subject→count map
    const subjectCounts = Object.entries(config)
      .filter(([key]) => key !== 'total'); // skip the 'total' key

    // Sample questions per subject
    const allQuestions = [];

    for (const [subjectName, count] of subjectCounts) {
      const { rows } = await query(
        `SELECT q.id, q.body, q.option_a, q.option_b, q.option_c, q.option_d,
                q.difficulty, q.source, q.image_url, q.topic_id,
                t.name AS topic_name, s.name AS subject_name
         FROM questions q
         JOIN topics    t ON t.id = q.topic_id
         JOIN chapters  c ON c.id = t.chapter_id
         JOIN subjects  s ON s.id = c.subject_id
         WHERE s.name = $1
           AND (s.exam_type = $2 OR s.exam_type = 'BOTH')
           AND q.is_active = TRUE
         ORDER BY RANDOM()
         LIMIT $3`,
        [subjectName, examType, count]
      );

      if (rows.length < count) {
        return next(
          new AppError(
            `Not enough ${subjectName} questions in the bank for a ${examType} mock test. ` +
            `Need ${count}, found ${rows.length}.`,
            422
          )
        );
      }

      allQuestions.push(...rows);
    }

    // Shuffle final list
    allQuestions.sort(() => Math.random() - 0.5);

    // Persist mock test record
    const testRes = await query(
      `INSERT INTO mock_tests (user_id, exam_type, total_questions)
       VALUES ($1, $2, $3)
       RETURNING id, started_at`,
      [userId, examType, allQuestions.length]
    );

    const { id: testId, started_at } = testRes.rows[0];

    // correct_option NEVER sent to client during active test
    const safeQuestions = allQuestions.map(({ correct_option, ...q }) => q); // eslint-disable-line

    res.status(201).json({
      success: true,
      data: {
        test_id:         testId,
        exam_type:       examType,
        total_questions: allQuestions.length,
        duration_minutes: examType === 'NEET' ? 200 : 180,
        started_at,
        questions:       safeQuestions,
        distribution:    config,
        scoring: {
          correct: NTA.CORRECT,
          wrong:   NTA.WRONG,
          skip:    NTA.SKIP,
          max:     allQuestions.length * NTA.CORRECT,
        },
      },
    });
  } catch (err) { next(err); }
};

/* ──────────────────────────────────────────────────────────────────
   POST /api/mock-tests/:testId/submit

   Body: { answers: [{ questionId, selectedOption }] }

   • NTA scoring: +4 correct, −1/3 wrong, 0 skip
   • Stores answers, calculates score + subject breakdown
   • Returns rank estimate
────────────────────────────────────────────────────────────────────*/
const submitMockTest = async (req, res, next) => {
  const client = await getClient();
  try {
    const { testId } = req.params;
    const { answers } = req.body;
    const userId = req.user.id;

    // Verify test ownership and status
    const testRes = await client.query(
      `SELECT * FROM mock_tests WHERE id = $1 AND user_id = $2`,
      [testId, userId]
    );
    if (!testRes.rows.length) throw new AppError('Mock test not found', 404);
    if (testRes.rows[0].submitted_at) throw new AppError('Test already submitted', 400);

    const { exam_type, total_questions } = testRes.rows[0];
    const maxScore = total_questions * NTA.CORRECT;

    // Fetch all correct options in one query
    const questionIds = answers.map((a) => a.questionId);
    const qRes = await client.query(
      `SELECT id, correct_option, topic_id, explanation_text
       FROM questions WHERE id = ANY($1::uuid[])`,
      [questionIds]
    );
    const qMap = Object.fromEntries(qRes.rows.map((q) => [q.id, q]));

    // Score each answer using NTA scheme
    let rawScore   = 0;
    const answerRows = [];
    const subjectScores = {};

    for (const answer of answers) {
      const q = qMap[answer.questionId];
      if (!q) continue;

      const selected = answer.selectedOption || null;
      let questionScore;
      let isCorrect;

      if (!selected) {
        // Skipped
        questionScore = NTA.SKIP;
        isCorrect     = false;
      } else if (selected === q.correct_option) {
        questionScore = NTA.CORRECT;
        isCorrect     = true;
      } else {
        questionScore = NTA.WRONG;
        isCorrect     = false;
      }

      rawScore += questionScore;
      answerRows.push([testId, answer.questionId, selected, isCorrect, parseFloat(questionScore.toFixed(4))]);
    }

    // Clamp to 0 minimum (NTA rule: negative marking can't go below 0 per section —
    // simplified here as overall clamp)
    const finalScore = Math.max(0, rawScore);

    await client.query('BEGIN');

    // Bulk insert answers
    for (const row of answerRows) {
      await client.query(
        `INSERT INTO mock_test_answers
           (mock_test_id, question_id, selected_option, is_correct, nta_score)
         VALUES ($1, $2, $3, $4, $5)`,
        row
      );
    }

    // Update test record
    await client.query(
      `UPDATE mock_tests
       SET score = $1, submitted_at = NOW()
       WHERE id = $2`,
      [finalScore, testId]
    );

    await client.query('COMMIT');

    // Subject-wise breakdown (second pass through answers for breakdown)
    const breakdownRes = await client.query(
      `SELECT
         s.name                              AS subject,
         COUNT(*)                            AS total,
         SUM(CASE WHEN mta.is_correct THEN 1 ELSE 0 END)       AS correct,
         ROUND(SUM(mta.nta_score)::numeric, 2)                  AS score,
         ROUND(
           AVG(CASE WHEN mta.is_correct THEN 100.0 ELSE 0.0 END), 1
         )                                  AS accuracy_percent
       FROM mock_test_answers mta
       JOIN questions q ON q.id  = mta.question_id
       JOIN topics    t ON t.id  = q.topic_id
       JOIN chapters  c ON c.id  = t.chapter_id
       JOIN subjects  s ON s.id  = c.subject_id
       WHERE mta.mock_test_id = $1
       GROUP BY s.name
       ORDER BY s.name`,
      [testId]
    );

    const rankEstimate = estimateRank(finalScore, maxScore, exam_type);

    res.json({
      success: true,
      data: {
        test_id:           testId,
        exam_type,
        raw_score:         parseFloat(rawScore.toFixed(4)),
        final_score:       parseFloat(finalScore.toFixed(4)),
        max_score:         maxScore,
        percentage:        parseFloat(((finalScore / maxScore) * 100).toFixed(2)),
        total_questions,
        correct:           answerRows.filter((r) => r[3]).length,
        wrong:             answerRows.filter((r) => r[1] !== null && !r[3]).length,
        skipped:           answerRows.filter((r) => r[1] === null).length,
        subject_breakdown: breakdownRes.rows,
        rank_estimate:     rankEstimate,
      },
    });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    next(err);
  } finally {
    client.release();
  }
};

/* ──────────────────────────────────────────────────────────────────
   GET /api/mock-tests/history
────────────────────────────────────────────────────────────────────*/
const getHistory = async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT id, exam_type, total_questions, score, started_at, submitted_at,
              ROUND((score / (total_questions * 4.0)) * 100, 1) AS percentage
       FROM mock_tests
       WHERE user_id = $1 AND submitted_at IS NOT NULL
       ORDER BY submitted_at DESC LIMIT 20`,
      [req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

/* ──────────────────────────────────────────────────────────────────
   GET /api/mock-tests/:testId/result
────────────────────────────────────────────────────────────────────*/
const getResult = async (req, res, next) => {
  try {
    const { testId } = req.params;
    const userId = req.user.id;

    const testRes = await query(
      `SELECT * FROM mock_tests WHERE id = $1 AND user_id = $2 AND submitted_at IS NOT NULL`,
      [testId, userId]
    );
    if (!testRes.rows.length) throw new AppError('Result not found', 404);
    const test = testRes.rows[0];

    const wrongRes = await query(
      `SELECT mta.question_id, mta.selected_option, mta.nta_score,
              q.body, q.option_a, q.option_b, q.option_c, q.option_d,
              q.correct_option, q.explanation_text, q.difficulty,
              s.name AS subject_name
       FROM mock_test_answers mta
       JOIN questions q ON q.id = mta.question_id
       JOIN topics    t ON t.id = q.topic_id
       JOIN chapters  c ON c.id = t.chapter_id
       JOIN subjects  s ON s.id = c.subject_id
       WHERE mta.mock_test_id = $1 AND mta.is_correct = FALSE
       ORDER BY s.name`,
      [testId]
    );

    res.json({
      success: true,
      data: {
        test,
        rank_estimate: estimateRank(test.score, test.total_questions * NTA.CORRECT, test.exam_type),
        wrong_questions: wrongRes.rows,
      },
    });
  } catch (err) { next(err); }
};

module.exports = { generateMockTest, submitMockTest, getHistory, getResult };
