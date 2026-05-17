require('dotenv').config();
const { query } = require('./src/config/db');

async function seedPerformanceData() {
  const userId = '202d4f1a-2410-4620-8397-8936b112e490'; // king500205@gmail.com
  
  try {
    console.log("--- Seeding Performance Data for Analytics ---");
    
    // Solve some physics questions (Laws of Motion - Topic 1)
    // 5 correct, 5 wrong
    const questions = await query('SELECT id FROM questions LIMIT 10');
    
    for (let i = 0; i < 5; i++) {
      await query(`
        INSERT INTO student_attempts (user_id, question_id, selected_option, is_correct, time_taken_seconds)
        VALUES ($1, $2, 'A', TRUE, 30)
      `, [userId, questions.rows[i].id]);
    }
    
    for (let i = 5; i < 10; i++) {
      await query(`
        INSERT INTO student_attempts (user_id, question_id, selected_option, is_correct, time_taken_seconds)
        VALUES ($1, $2, 'B', FALSE, 45)
      `, [userId, questions.rows[i].id]);
    }

    console.log("Seeding complete. Accuracy should be 50% for Topic 1.");

  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

seedPerformanceData();
