require('dotenv').config();
const { pool } = require('./src/config/db');

async function checkEnum() {
  try {
    const res = await pool.query(`
      SELECT enumlabel 
      FROM pg_enum 
      JOIN pg_type ON pg_type.oid = pg_enum.enumtypid 
      WHERE typname = 'question_source'
    `);
    console.log("Enum values for question_source:", res.rows.map(r => r.enumlabel));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkEnum();
