require('dotenv').config();
const { query } = require('./src/config/db');

async function checkColumns() {
  const tables = ['users', 'subscriptions', 'student_attempts'];
  for (const table of tables) {
    const res = await query(`SELECT column_name FROM information_schema.columns WHERE table_name = $1`, [table]);
    console.log(`Columns for ${table}:`, res.rows.map(r => r.column_name));
  }
  process.exit(0);
}

checkColumns();
