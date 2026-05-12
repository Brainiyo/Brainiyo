const { query } = require('../src/config/db');

async function setup() {
  try {
    await query(`
      INSERT INTO users (id, firebase_uid, name, email, class, target_exam) 
      VALUES ('demo-student-id', 'demo-firebase-uid', 'Demo Student', 'demo@brainiyo.com', 12, 'NEET') 
      ON CONFLICT DO NOTHING
    `);
    console.log('Demo student created successfully');
    process.exit(0);
  } catch (err) {
    console.error('Failed to create demo student:', err);
    process.exit(1);
  }
}

setup();
