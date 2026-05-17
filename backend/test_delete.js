require('dotenv').config();
const { pool } = require('./src/config/db');

async function testDelete() {
  try {
    // Get the first question ID that has 'Admin Dashboard' source
    const res = await pool.query("SELECT id FROM questions WHERE source = 'Admin Dashboard' LIMIT 1");
    if (res.rows.length === 0) {
      console.log("No 'Admin Dashboard' questions found");
      return;
    }
    const id = res.rows[0].id;
    console.log(`Deleting question ID: ${id}`);
    const delRes = await pool.query("UPDATE questions SET is_active = FALSE WHERE id = $1 RETURNING *", [id]);
    console.log("Deleted:", delRes.rows[0]);
  } catch (err) {
    console.error("ERROR:", err.message);
  } finally {
    await pool.end();
  }
}

testDelete();
