require('dotenv').config();
const { pool } = require('./src/config/db');

async function testInsert() {
  try {
    const res = await pool.query(`
      INSERT INTO questions (topic_id, body, option_a, option_b, option_c, option_d, correct_option, difficulty, source)
      VALUES (1, 'Test enum insertion', 'A', 'B', 'C', 'D', 'A', 'easy', 'Admin Dashboard')
      RETURNING *
    `);
    console.log("Inserted question with 'Admin Dashboard' source:", res.rows[0]);
  } catch (err) {
    console.error("INSERT ERROR:", err.message);
  } finally {
    await pool.end();
  }
}

testInsert();
