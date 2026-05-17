require('dotenv').config();
const { pool } = require('./src/config/db');
const { signToken } = require('./src/utils/jwt');

async function getStudentToken() {
  try {
    const res = await pool.query("SELECT id, name, firebase_uid FROM users WHERE name = 'Demo Student' LIMIT 1");
    if (res.rows.length === 0) {
      console.log("No students found");
      return;
    }
    const user = res.rows[0];
    const token = signToken({ userId: user.id, uid: user.firebase_uid });
    console.log("TOKEN_START");
    console.log(token);
    console.log("TOKEN_END");
    console.log("User:", user.name);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

getStudentToken();
