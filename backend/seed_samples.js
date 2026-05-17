require('dotenv').config();
const { query } = require('./src/config/db');

async function seed() {
  try {
    // 1. Get Subject IDs
    const chemRes = await query("SELECT id FROM subjects WHERE name = 'Chemistry'");
    const mathRes = await query("SELECT id FROM subjects WHERE name = 'Mathematics'");
    
    if (!chemRes.rows.length || !mathRes.rows.length) {
      console.error('Subjects not found. Please run seed_skeletons.js first.');
      process.exit(1);
    }
    
    const chemId = chemRes.rows[0].id;
    const mathId = mathRes.rows[0].id;

    // 2. Create Chapters
    const ch1Res = await query(
      "INSERT INTO chapters (subject_id, name) VALUES ($1, 'Atomic Structure') ON CONFLICT (subject_id, name) DO UPDATE SET name = EXCLUDED.name RETURNING id",
      [chemId]
    );
    const ch2Res = await query(
      "INSERT INTO chapters (subject_id, name) VALUES ($1, 'Sets and Relations') ON CONFLICT (subject_id, name) DO UPDATE SET name = EXCLUDED.name RETURNING id",
      [mathId]
    );
    
    const chemChapId = ch1Res.rows[0].id;
    const mathChapId = ch2Res.rows[0].id;

    // 3. Create Topics
    const t1Res = await query(
      "INSERT INTO topics (chapter_id, name) VALUES ($1, 'Bohr Model') ON CONFLICT (chapter_id, name) DO UPDATE SET name = EXCLUDED.name RETURNING id",
      [chemChapId]
    );
    const t2Res = await query(
      "INSERT INTO topics (chapter_id, name) VALUES ($1, 'Types of Sets') ON CONFLICT (chapter_id, name) DO UPDATE SET name = EXCLUDED.name RETURNING id",
      [mathChapId]
    );

    const chemTopicId = t1Res.rows[0].id;
    const mathTopicId = t2Res.rows[0].id;

    // 4. Seed Questions
    const questions = [
      // Chemistry
      [chemTopicId, 'What is the maximum number of electrons that can be accommodated in the M-shell?', '8', '18', '32', '10', 'B', 'medium', 'NCERT', 'M-shell corresponds to n=3. Max electrons = 2n^2 = 2(3)^2 = 18.'],
      [chemTopicId, 'Which subatomic particle was discovered by James Chadwick?', 'Electron', 'Proton', 'Neutron', 'Positron', 'C', 'easy', 'NCERT', 'James Chadwick discovered the neutron in 1932.'],
      
      // Math
      [mathTopicId, 'If A = {1, 2, 3} and B = {3, 4, 5}, what is A ∩ B?', '{1, 2, 3, 4, 5}', '{3}', '{1, 2, 4, 5}', '∅', 'B', 'easy', 'NCERT', 'Intersection (∩) means elements common to both sets. Only {3} is common.'],
      [mathTopicId, 'What is the power set of an empty set ∅?', '{∅}', '∅', '{{∅}}', '0', 'A', 'medium', 'NCERT', 'The power set of a set with n elements has 2^n elements. For n=0, 2^0 = 1. The power set is {∅}.']
    ];

    for (const q of questions) {
      await query(
        `INSERT INTO questions (topic_id, body, option_a, option_b, option_c, option_d, correct_option, difficulty, source, explanation_text)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT DO NOTHING`,
        q
      );
    }

    console.log('Sample questions seeded for Chemistry and Math.');
  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    process.exit(0);
  }
}

seed();
