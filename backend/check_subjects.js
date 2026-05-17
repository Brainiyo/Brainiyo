require('dotenv').config();
const { query } = require('./src/config/db');

async function check() {
  try {
    const res = await query('SELECT COUNT(*) FROM subjects');
    console.log('Subject Count:', res.rows[0].count);
    
    if (res.rows[0].count > 0) {
      const subjects = await query('SELECT name, exam_type FROM subjects LIMIT 5');
      console.log('Sample Subjects:', subjects.rows);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}

check();
