const { query } = require('../../config/db');

const analyticsController = {
  /**
   * GET /api/analytics/admin/summary
   */
  getSummary: async (req, res, next) => {
    try {
      // 1. Total Students
      const totalStudents = await query(`SELECT COUNT(*) FROM users WHERE role = 'student'`);
      
      // 2. Daily Active Users (Last 24h)
      // Using last_active_date for precision
      const dau = await query(`SELECT COUNT(*) FROM users WHERE last_active_date >= CURRENT_DATE`);
      
      // 3. Questions Attempted Total
      const totalAttempts = await query(`SELECT COUNT(*) FROM student_attempts`);
      
      // 4. Revenue (Mock for now or sum from subscriptions if implemented)
      // We assume each Pro subscription is ₹199 (19900 paise)
      const revenue = await query(`
        SELECT COUNT(*) * 199 as sum 
        FROM subscriptions 
        WHERE is_active = TRUE AND plan = 'pro'
      `);

      // 5. Growth Chart Data (Last 7 days)
      const growth = await query(`
        SELECT DATE_TRUNC('day', created_at) as date, COUNT(*) as count
        FROM users 
        WHERE created_at > NOW() - INTERVAL '7 days'
        GROUP BY 1 ORDER BY 1 ASC
      `);

      // 6. Popular Topics
      const popularTopics = await query(`
        SELECT t.name, COUNT(sa.id) as attempts
        FROM topics t
        JOIN questions q ON q.topic_id = t.id
        JOIN student_attempts sa ON sa.question_id = q.id
        GROUP BY t.id, t.name
        ORDER BY attempts DESC
        LIMIT 5
      `);

      res.json({
        success: true,
        data: {
          kpis: {
            totalStudents: parseInt(totalStudents.rows[0].count),
            dau: parseInt(dau.rows[0].count),
            totalAttempts: parseInt(totalAttempts.rows[0].count),
            revenue: parseFloat(revenue.rows[0].sum || 0)
          },
          growth: growth.rows,
          popularTopics: popularTopics.rows
        }
      });
    } catch (err) { 
      console.error("Admin Analytics Error:", err);
      next(err); 
    }
  }
};

module.exports = analyticsController;
