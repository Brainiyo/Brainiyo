const { query } = require('../../config/db');
const redis     = require('../../config/redis');
const { CACHE } = require('../../config/constants');

/* ──────────────────────────────────────────────────────────────────
   GET /api/analytics/dashboard

   Returns:
   - weak_chapters       : bottom 3 chapters by average accuracy (≥5 attempts)
   - streak              : current consecutive-day streak
   - today_attempted     : questions attempted today
   - overall_accuracy    : lifetime accuracy %
   - subject_breakdown   : per-subject accuracy + attempt count
────────────────────────────────────────────────────────────────────*/
const getDashboard = async (req, res, next) => {
  try {
    const userId   = req.user.id;
    const cacheKey = `dashboard:${userId}`;

    const cached = await redis.get(cacheKey);
    if (cached) return res.json({ success: true, data: JSON.parse(cached), fromCache: true });

    const [weakRes, streakRes, todayRes, overallRes, subjectRes] = await Promise.all([

      // Bottom 3 chapters by avg accuracy (min 5 attempts total)
      query(
        `SELECT
           ch.id   AS chapter_id,
           ch.name AS chapter_name,
           s.name  AS subject_name,
           ROUND(AVG(sts.accuracy_percent), 1) AS accuracy_percent,
           SUM(sts.total_attempts)             AS total_attempts
         FROM student_topic_stats sts
         JOIN topics    t  ON t.id  = sts.topic_id
         JOIN chapters  ch ON ch.id = t.chapter_id
         JOIN subjects  s  ON s.id  = ch.subject_id
         WHERE sts.user_id = $1
         GROUP BY ch.id, ch.name, s.name
         HAVING SUM(sts.total_attempts) >= 5
         ORDER BY accuracy_percent ASC
         LIMIT 3`,
        [userId]
      ),

      // Daily streak: consecutive days ending today with at least 1 attempt
      query(
        `WITH daily AS (
           SELECT DATE(attempted_at AT TIME ZONE 'Asia/Kolkata') AS day
           FROM student_attempts
           WHERE user_id = $1
           GROUP BY 1
         ),
         numbered AS (
           SELECT day, ROW_NUMBER() OVER (ORDER BY day DESC) AS rn FROM daily
         )
         SELECT COUNT(*) AS streak
         FROM numbered
         WHERE day = CURRENT_DATE - (rn - 1) * INTERVAL '1 day'`,
        [userId]
      ),

      // Today's attempt count (IST)
      query(
        `SELECT COUNT(*) AS count
         FROM student_attempts
         WHERE user_id = $1
           AND attempted_at >= DATE_TRUNC('day', NOW() AT TIME ZONE 'Asia/Kolkata')
                               AT TIME ZONE 'Asia/Kolkata'`,
        [userId]
      ),

      // Overall accuracy
      query(
        `SELECT
           SUM(total_attempts)    AS total,
           SUM(correct_attempts)  AS correct,
           CASE WHEN SUM(total_attempts) > 0
                THEN ROUND(SUM(correct_attempts)::numeric / SUM(total_attempts) * 100, 1)
                ELSE 0
           END AS accuracy_percent
         FROM student_topic_stats WHERE user_id = $1`,
        [userId]
      ),

      // Subject-wise breakdown
      query(
        `SELECT
           s.name  AS subject,
           s.id    AS subject_id,
           ROUND(AVG(sts.accuracy_percent), 1) AS accuracy_percent,
           SUM(sts.total_attempts)             AS total_attempts,
           SUM(sts.correct_attempts)           AS correct_attempts
         FROM student_topic_stats sts
         JOIN topics   t ON t.id  = sts.topic_id
         JOIN chapters c ON c.id  = t.chapter_id
         JOIN subjects s ON s.id  = c.subject_id
         WHERE sts.user_id = $1
         GROUP BY s.id, s.name
         ORDER BY s.name`,
        [userId]
      ),
    ]);

    const data = {
      weak_chapters:    weakRes.rows,
      streak:           parseInt(streakRes.rows[0]?.streak || 0, 10),
      today_attempted:  parseInt(todayRes.rows[0]?.count   || 0, 10),
      overall_accuracy: parseFloat(overallRes.rows[0]?.accuracy_percent || 0),
      total_attempted:  parseInt(overallRes.rows[0]?.total  || 0, 10),
      subject_breakdown: subjectRes.rows,
    };

    await redis.setex(cacheKey, CACHE.DASHBOARD, JSON.stringify(data));
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

/* ──────────────────────────────────────────────────────────────────
   GET /api/analytics/chapter-heatmap

   Returns every chapter with its average accuracy % for the student.
   Frontend renders this as a colour-coded heatmap grid.
────────────────────────────────────────────────────────────────────*/
const getChapterHeatmap = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const { rows } = await query(
      `SELECT
         ch.id                                         AS chapter_id,
         ch.name                                       AS chapter_name,
         s.name                                        AS subject_name,
         s.id                                          AS subject_id,
         ch.order_index,
         ROUND(AVG(sts.accuracy_percent), 1)           AS accuracy_percent,
         COALESCE(SUM(sts.total_attempts), 0)          AS total_attempts,
         COALESCE(SUM(sts.correct_attempts), 0)        AS correct_attempts,
         COUNT(DISTINCT t.id)                          AS total_topics,
         COUNT(DISTINCT CASE WHEN sts.total_attempts > 0 THEN t.id END) AS attempted_topics
       FROM chapters ch
       JOIN subjects  s  ON s.id  = ch.subject_id
       JOIN topics    t  ON t.chapter_id = ch.id
       LEFT JOIN student_topic_stats sts
              ON sts.topic_id = t.id AND sts.user_id = $1
       GROUP BY ch.id, ch.name, s.id, s.name, ch.order_index
       ORDER BY s.name ASC, ch.order_index ASC`,
      [userId]
    );

    // Tag each chapter with a heatmap intensity level 0–4
    const tagged = rows.map((r) => ({
      ...r,
      heat: r.total_attempts === 0 ? 0
          : r.accuracy_percent >= 80 ? 4
          : r.accuracy_percent >= 60 ? 3
          : r.accuracy_percent >= 40 ? 2
          : 1,
    }));

    res.json({ success: true, data: tagged });
  } catch (err) { next(err); }
};

/* ──────────────────────────────────────────────────────────────────
   GET /api/analytics/public-stats

   Returns aggregate platform-wide stats for landing page.
────────────────────────────────────────────────────────────────────*/
const getPublicStats = async (req, res, next) => {
  try {
    const cacheKey = 'public_stats';
    const cached = await redis.get(cacheKey);
    if (cached) return res.json({ success: true, data: JSON.parse(cached) });

    const [userCount, attemptCount, questionCount] = await Promise.all([
      query('SELECT COUNT(*) FROM users'),
      query('SELECT COUNT(*) FROM student_attempts'),
      query('SELECT COUNT(*) FROM questions'),
    ]);

    const data = {
      total_students:  parseInt(userCount.rows[0].count, 10),
      total_attempts:  parseInt(attemptCount.rows[0].count, 10),
      total_questions: parseInt(questionCount.rows[0].count, 10),
    };

    await redis.setex(cacheKey, 3600, JSON.stringify(data)); // Cache for 1 hour
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

/* ──────────────────────────────────────────────────────────────────
   GET /api/analytics/leaderboard

   Returns the top 50 students for the user's exam type based on XP.
────────────────────────────────────────────────────────────────────*/
const getLeaderboard = async (req, res, next) => {
  try {
    const userExam = req.user.target_exam;
    
    const { rows } = await query(
      `SELECT id, name, xp_points FROM users WHERE target_exam = $1`,
      [userExam]
    );

    let leaderboard = rows.map(r => ({ ...r, is_current_user: r.id === req.user.id }));

    // If there aren't many active users, blend in high-quality competitive mock peers
    if (leaderboard.length < 15) {
      const mockPeers = [
        { name: 'Arnav Sharma', xp_points: 1540 },
        { name: 'Priya Patel', xp_points: 1210 },
        { name: 'Rohan Deshmukh', xp_points: 980 },
        { name: 'Ananya Iyer', xp_points: 840 },
        { name: 'Kabir Verma', xp_points: 620 },
        { name: 'Sneha Reddy', xp_points: 450 },
        { name: 'Ishaan Gupta', xp_points: 310 },
        { name: 'Diya Mehta', xp_points: 190 },
        { name: 'Aditya Rao', xp_points: 90 },
        { name: 'Tanvi Sen', xp_points: 40 },
      ];

      mockPeers.forEach((peer, i) => {
        if (!leaderboard.some(u => u.name.toLowerCase() === peer.name.toLowerCase())) {
          leaderboard.push({
            id: `mock-peer-${i}`,
            name: peer.name,
            xp_points: peer.xp_points,
            is_current_user: false
          });
        }
      });
    }

    // Sort by XP descending
    leaderboard.sort((a, b) => b.xp_points - a.xp_points);

    // Dynamic Dense Rank calculation
    let currentRank = 1;
    let prevXp = null;
    leaderboard.forEach((user) => {
      if (prevXp !== null && user.xp_points < prevXp) {
        currentRank++;
      }
      user.rank = currentRank;
      prevXp = user.xp_points;
    });

    const currentUserRank = leaderboard.find(r => r.id === req.user.id);

    res.json({ 
      success: true, 
      data: {
        leaderboard: leaderboard.slice(0, 50),
        current_user: currentUserRank
      }
    });
  } catch (err) { next(err); }
};

const getAdminOverview = async (req, res, next) => {
  try {
    const [statsRes, signupRes, subjectRes] = await Promise.all([
      query(`
        SELECT 
          (SELECT COUNT(*) FROM users) as total_students,
          (SELECT COUNT(*) FROM questions WHERE is_active = TRUE) as total_questions,
          (SELECT COUNT(*) FROM student_attempts) as total_attempts,
          (SELECT COUNT(*) FROM users WHERE created_at >= NOW() - INTERVAL '24 hours') as new_signups_24h
      `),
      query(`
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM users
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY 1 ORDER BY 1 ASC
      `),
      query(`
        SELECT s.name, COUNT(q.id) as count
        FROM subjects s
        LEFT JOIN chapters c ON c.subject_id = s.id
        LEFT JOIN topics t ON t.chapter_id = c.id
        LEFT JOIN questions q ON q.topic_id = t.id AND q.is_active = TRUE
        GROUP BY s.id, s.name
      `)
    ]);

    res.json({ 
      success: true, 
      data: {
        stats: statsRes.rows[0],
        signup_chart: signupRes.rows,
        subject_breakdown: subjectRes.rows
      }
    });
  } catch (err) { next(err); }
};

module.exports = { getDashboard, getChapterHeatmap, getPublicStats, getLeaderboard, getAdminOverview };
