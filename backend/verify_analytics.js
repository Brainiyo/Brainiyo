require('dotenv').config();
const { query } = require('./src/config/db');

async function verifyAnalyticsAPI() {
  const userId = '202d4f1a-2410-4620-8397-8936b112e490';
  
  try {
    console.log("--- Verifying Student Performance API Data ---");
    
    // 1. Subject Mastery Stats
    const { rows: performance } = await query(
      `SELECT 
         s.name as subject_name,
         COALESCE(AVG(sts.accuracy_percent), 0) as avg_accuracy,
         SUM(sts.total_attempts) as total_attempts
       FROM subjects s
       LEFT JOIN chapters ch ON ch.subject_id = s.id
       LEFT JOIN topics t ON t.chapter_id = ch.id
       LEFT JOIN student_topic_stats sts ON sts.topic_id = t.id AND sts.user_id = $1
       WHERE (s.exam_type = (SELECT target_exam FROM users WHERE id = $1) OR s.exam_type = 'BOTH')
       GROUP BY s.id, s.name`,
      [userId]
    );
    console.log("Subject Mastery:");
    console.table(performance);

    // 2. Weak Topics
    const { rows: weakTopics } = await query(
      `SELECT 
         t.name as topic_name, 
         sts.accuracy_percent, 
         sts.total_attempts
       FROM topics t
       JOIN student_topic_stats sts ON sts.topic_id = t.id
       WHERE sts.user_id = $1 
         AND sts.accuracy_percent < 60 -- adjusted for verification
       LIMIT 5`,
      [userId]
    );
    console.log("Weak Topics:");
    console.table(weakTopics);

  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

verifyAnalyticsAPI();
