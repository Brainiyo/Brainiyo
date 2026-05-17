require('dotenv').config();
const { query } = require('./src/config/db');

async function countQuestions() {
  try {
    const res = await query(`
      SELECT s.name as subject, COUNT(q.id) as count
      FROM questions q
      JOIN topics t ON t.id = q.topic_id
      JOIN chapters c ON c.id = t.chapter_id
      JOIN subjects s ON s.id = c.subject_id
      GROUP BY s.name
    `);
    console.log('Question counts by subject:', res.rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}

countQuestions();
