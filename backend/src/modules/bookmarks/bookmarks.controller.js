const { query } = require('../../config/db');

module.exports = {
  toggleBookmark: async (req, res, next) => {
    try {
      const { questionId } = req.body;
      const userId = req.user.id;

      // Check if already bookmarked
      const checkRes = await query(
        `SELECT id FROM bookmarks WHERE user_id = $1 AND question_id = $2`,
        [userId, questionId]
      );

      if (checkRes.rows.length > 0) {
        // Remove it
        await query(`DELETE FROM bookmarks WHERE user_id = $1 AND question_id = $2`, [userId, questionId]);
        return res.json({ success: true, bookmarked: false });
      } else {
        // Add it
        await query(
          `INSERT INTO bookmarks (user_id, question_id) VALUES ($1, $2)`,
          [userId, questionId]
        );
        return res.json({ success: true, bookmarked: true });
      }
    } catch (err) { next(err); }
  },

  getBookmarks: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { rows } = await query(
        `SELECT b.created_at, q.*, t.name as topic_name, c.name as chapter_name, s.name as subject_name
         FROM bookmarks b
         JOIN questions q ON q.id = b.question_id
         JOIN topics t    ON t.id = q.topic_id
         JOIN chapters c  ON c.id = t.chapter_id
         JOIN subjects s  ON s.id = c.subject_id
         WHERE b.user_id = $1
         ORDER BY b.created_at DESC`,
        [userId]
      );
      res.json({ success: true, data: rows });
    } catch (err) { next(err); }
  }
};
