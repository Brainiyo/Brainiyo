require('dotenv').config();
const { query } = require('./src/config/db');

async function checkUsers() {
  try {
    const { rows } = await query('SELECT id, email, role FROM users LIMIT 10');
    console.log(JSON.stringify(rows, null, 2));
    
    if (rows.length > 0) {
      // Set the first user to admin for testing
      await query("UPDATE users SET role = 'admin' WHERE id = $1", [rows[0].id]);
      console.log(`User ${rows[0].email} set to admin.`);
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

checkUsers();
