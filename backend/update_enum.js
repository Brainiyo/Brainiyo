require('dotenv').config();
const { pool } = require('./src/config/db');

async function updateEnum() {
  try {
    // ALTER TYPE ADD VALUE cannot run in a transaction in some Postgres versions,
    // and pg-pool might use transactions or something.
    // We'll just run it directly.
    await pool.query("ALTER TYPE question_source ADD VALUE IF NOT EXISTS 'Admin Dashboard'");
    console.log("Enum 'question_source' updated with 'Admin Dashboard'");
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

updateEnum();
