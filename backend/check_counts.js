require('dotenv').config();
const { pool } = require('./src/config/db');

async function checkData() {
  try {
    const students = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'student'");
    const revenue = await pool.query("SELECT COUNT(*) * 199 as sum FROM subscriptions WHERE is_active = TRUE AND plan = 'pro'");
    const subjects = await pool.query("SELECT COUNT(*) FROM subjects");
    const chapters = await pool.query("SELECT COUNT(*) FROM chapters");
    const topics = await pool.query("SELECT COUNT(*) FROM topics");
    const questions = await pool.query("SELECT COUNT(*) FROM questions");

    console.log({
      students: students.rows[0].count,
      revenue: revenue.rows[0].sum,
      subjects: subjects.rows[0].count,
      chapters: chapters.rows[0].count,
      topics: topics.rows[0].count,
      questions: questions.rows[0].count
    });
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkData();
