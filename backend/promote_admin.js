require('dotenv').config();
const { query } = require('./src/config/db');

async function promoteAdmin() {
  try {
    // First, list all users
    const { rows: users } = await query('SELECT id, email, name, role FROM users ORDER BY created_at ASC');
    console.log('\n📋 Current Users:');
    console.table(users);

    if (users.length === 0) {
      console.log('No users found. Please log in first via the admin panel.');
      process.exit(0);
    }

    // Promote ALL existing users to admin (for development)
    // In production, you would target a specific email
    const result = await query(
      `UPDATE users SET role = 'admin' WHERE role = 'student' RETURNING id, email, name, role`
    );

    if (result.rows.length > 0) {
      console.log('\n✅ Promoted to admin:');
      console.table(result.rows);
    } else {
      console.log('\n✅ All users already have admin role.');
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    process.exit(0);
  }
}

promoteAdmin();
