require('dotenv').config();
const { query } = require('./src/config/db');

async function seedTemplates() {
  try {
    // 1. Create Physics NEET Template
    const t1 = await query(
      `INSERT INTO exam_templates (title, exam_type, duration_minutes, total_questions, max_marks, is_published)
       VALUES ('NEET Physics Mini Mock #1', 'NEET', 30, 10, 40, TRUE)
       RETURNING id`
    );
    const t1Id = t1.rows[0].id;

    // Link 10 Physics questions
    const pQs = await query(`SELECT q.id FROM questions q JOIN topics t ON t.id = q.topic_id JOIN chapters c ON c.id = t.chapter_id JOIN subjects s ON s.id = c.subject_id WHERE s.name = 'Physics' LIMIT 10`);
    for (let i = 0; i < pQs.rows.length; i++) {
      await query(`INSERT INTO exam_template_questions (exam_template_id, question_id, order_index) VALUES ($1, $2, $3)`, [t1Id, pQs.rows[i].id, i]);
    }

    // 2. Create Math JEE Template
    const t2 = await query(
      `INSERT INTO exam_templates (title, exam_type, duration_minutes, total_questions, max_marks, is_published)
       VALUES ('JEE Math Mini Mock #1', 'JEE', 30, 10, 40, TRUE)
       RETURNING id`
    );
    const t2Id = t2.rows[0].id;

    // Link 10 Math questions
    const mQs = await query(`SELECT q.id FROM questions q JOIN topics t ON t.id = q.topic_id JOIN chapters c ON c.id = t.chapter_id JOIN subjects s ON s.id = c.subject_id WHERE s.name = 'Mathematics' LIMIT 10`);
    for (let i = 0; i < mQs.rows.length; i++) {
      await query(`INSERT INTO exam_template_questions (exam_template_id, question_id, order_index) VALUES ($1, $2, $3)`, [t2Id, mQs.rows[i].id, i]);
    }

    console.log('Mock Test Templates seeded successfully.');
  } catch (err) {
    console.error('Template seeding failed:', err);
  } finally {
    process.exit(0);
  }
}

seedTemplates();
