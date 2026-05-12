/**
 * Cursor-based pagination helper (more efficient than OFFSET for mobile)
 *
 * Usage: const { rows, nextCursor } = await paginate(query, params, limit, cursorCol)
 */
const paginate = async (queryFn, baseQuery, params, limit = 20, cursor = null, cursorCol = 'id') => {
  let sql = baseQuery;
  const queryParams = [...params];

  if (cursor) {
    // Append cursor condition — assumes UUID or TIMESTAMPTZ ordering
    sql += ` AND ${cursorCol} < $${queryParams.length + 1}`;
    queryParams.push(cursor);
  }

  sql += ` ORDER BY ${cursorCol} DESC LIMIT $${queryParams.length + 1}`;
  queryParams.push(limit + 1); // fetch one extra to detect hasMore

  const result = await queryFn(sql, queryParams);
  const hasMore = result.rows.length > limit;
  const rows = hasMore ? result.rows.slice(0, limit) : result.rows;
  const nextCursor = hasMore ? rows[rows.length - 1][cursorCol] : null;

  return { rows, nextCursor, hasMore };
};

module.exports = { paginate };
