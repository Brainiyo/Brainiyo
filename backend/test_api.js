const { query } = require('./src/config/db');
const jwt = require('jsonwebtoken');

async function test() {
  try {
    const { rows } = await query("SELECT id, email, role FROM users WHERE target_exam='JEE' LIMIT 1");
    if (rows.length === 0) return console.log('No JEE user found');
    const token = jwt.sign({ userId: rows[0].id, role: rows[0].role }, process.env.JWT_SECRET);
    const res = await fetch('http://localhost:5002/api/content/subjects', { headers: { Authorization: 'Bearer ' + token } });
    console.log(await res.json());
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
test();
