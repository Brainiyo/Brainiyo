require('dotenv').config();
const { query } = require('./src/config/db');

async function seedMoreMath() {
  try {
    const mathRes = await query("SELECT id FROM subjects WHERE name = 'Mathematics'");
    const mathId = mathRes.rows[0].id;

    const chRes = await query(
      "INSERT INTO chapters (subject_id, name) VALUES ($1, 'Calculus') ON CONFLICT (subject_id, name) DO UPDATE SET name = EXCLUDED.name RETURNING id",
      [mathId]
    );
    const chapId = chRes.rows[0].id;

    const tRes = await query(
      "INSERT INTO topics (chapter_id, name) VALUES ($1, 'Limits') ON CONFLICT (chapter_id, name) DO UPDATE SET name = EXCLUDED.name RETURNING id",
      [chapId]
    );
    const topicId = tRes.rows[0].id;

    const questions = [
      [topicId, 'What is the limit of sin(x)/x as x approaches 0?', '0', '1', '∞', 'Undefined', 'B', 'easy', 'NCERT', 'Standard limit: lim(x->0) sin(x)/x = 1.'],
      [topicId, 'Evaluate lim(x->1) (x^2 - 1)/(x - 1).', '1', '2', '0', 'Undefined', 'B', 'medium', 'NCERT', 'Factorize: (x-1)(x+1)/(x-1) = x+1. Plug x=1 -> 2.'],
      [topicId, 'What is the limit of cos(x) as x approaches 0?', '0', '1', '-1', '∞', 'B', 'easy', 'NCERT', 'cos(0) = 1.'],
      [topicId, 'Evaluate lim(x->∞) (1/x).', '∞', '1', '0', 'Undefined', 'C', 'easy', 'NCERT', 'As x grows infinitely large, 1/x approaches 0.'],
      [topicId, 'What is the derivative of e^x?', 'e^x', 'x*e^(x-1)', 'ln(x)', '1/x', 'A', 'easy', 'NCERT', 'The derivative of e^x is itself.'],
      [topicId, 'Evaluate lim(x->0) (e^x - 1)/x.', '0', '1', 'e', 'ln(1)', 'B', 'medium', 'NCERT', 'Standard exponential limit = 1.'],
      [topicId, 'What is the limit of (1 + 1/x)^x as x approaches ∞?', '1', 'e', '0', '∞', 'B', 'hard', 'NCERT', 'Definition of Euler number e.'],
      [topicId, 'Evaluate lim(x->2) (x^2 - 4)/(x + 2).', '0', '4', '2', '-2', 'A', 'easy', 'NCERT', 'Plug x=2 -> (4-4)/(2+2) = 0/4 = 0.']
    ];

    for (const q of questions) {
      await query(
        `INSERT INTO questions (topic_id, body, option_a, option_b, option_c, option_d, correct_option, difficulty, source, explanation_text)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT DO NOTHING`,
        q
      );
    }
    console.log('Added 8 more Math questions.');
  } catch (err) {
    console.error('Math seeding failed:', err);
  } finally {
    process.exit(0);
  }
}

seedMoreMath();
