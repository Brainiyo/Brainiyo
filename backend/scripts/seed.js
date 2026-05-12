require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('../src/config/db');
const logger = require('../src/utils/logger');

async function seedData() {
  const seedFile = path.join(__dirname, '../seeds/physics_seed.json');
  const questions = JSON.parse(fs.readFileSync(seedFile, 'utf8'));

  try {
    // 1. Ensure Subject exists
    const subjRes = await pool.query(
      `INSERT INTO subjects (name, exam_type) VALUES ('Physics', 'NEET') 
       ON CONFLICT (name, exam_type) DO UPDATE SET name = EXCLUDED.name RETURNING id`
    );
    const subjectId = subjRes.rows[0].id;

    // 2. Ensure Chapter exists
    const chapRes = await pool.query(
      `INSERT INTO chapters (subject_id, name) VALUES ($1, 'Laws of Motion') 
       ON CONFLICT (subject_id, name) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
      [subjectId]
    );
    const chapterId = chapRes.rows[0].id;

    logger.info(`Seeding ${questions.length} questions into Supabase...`);

    for (const q of questions) {
      // 3. Ensure Topic exists
      const topicRes = await pool.query(
        `INSERT INTO topics (chapter_id, name) VALUES ($1, $2) 
         ON CONFLICT (chapter_id, name) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
        [chapterId, q.topic]
      );
      const topicId = topicRes.rows[0].id;

      // 4. Insert Question
      await pool.query(
        `INSERT INTO questions (topic_id, body, option_a, option_b, option_c, option_d, correct_option, difficulty, source, explanation_text)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT DO NOTHING`,
        [
          topicId, 
          q.body, 
          q.option_a, 
          q.option_b, 
          q.option_c, 
          q.option_d, 
          q.correct_option.toUpperCase(), 
          q.difficulty, 
          q.source, 
          q.explanation
        ]
      );
    }

    logger.info('Seeding complete! Your Supabase database is now populated.');
    process.exit(0);
  } catch (err) {
    logger.error('Seeding failed:', err.stack);
    process.exit(1);
  }
}

seedData();
