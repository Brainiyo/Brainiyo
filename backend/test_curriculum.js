require('dotenv').config();
const { query } = require('./src/config/db');

async function testCurriculum() {
  try {
    console.log("--- Testing Curriculum API Logic ---");
    
    // 1. Check Subjects
    const subjects = await query('SELECT * FROM subjects');
    console.log(`Subjects found: ${subjects.rows.length}`);
    console.table(subjects.rows);

    if (subjects.rows.length > 0) {
      const subId = subjects.rows[0].id;
      // 2. Check Chapters
      const chapters = await query('SELECT * FROM chapters WHERE subject_id = $1', [subId]);
      console.log(`Chapters for subject ${subId}: ${chapters.rows.length}`);
      console.table(chapters.rows);
    }

    // 3. Check Questions
    const questions = await query(`
      SELECT q.id, q.body, s.name as subject, c.name as chapter 
      FROM questions q
      JOIN topics t ON t.id = q.topic_id
      JOIN chapters c ON c.id = t.chapter_id
      JOIN subjects s ON s.id = c.subject_id
      LIMIT 5
    `);
    console.log(`Questions linked to curriculum: ${questions.rows.length}`);
    console.table(questions.rows);

  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

testCurriculum();
