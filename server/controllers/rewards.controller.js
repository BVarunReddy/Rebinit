const pool = require('../config/db');

async function getMyRewards(req, res) {
  try {
    const userId = req.user.id;
    const [[user]] = await pool.query('SELECT id, name, points FROM users WHERE id = ?', [userId]);
    const [history] = await pool.query('SELECT id, points, reason, created_at FROM rewards_log WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    const [[{ rank }]] = await pool.query('SELECT COUNT(*) + 1 AS `rank` FROM users WHERE points > ?', [user.points]);
    res.json({ points: user.points, rank, history });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch rewards', error: err.message });
  }
}

async function getLeaderboard(req, res) {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
    const [rows] = await pool.query(
      `SELECT id, name, points, RANK() OVER (ORDER BY points DESC) AS \`rank\` FROM users ORDER BY points DESC LIMIT ?`,
      [limit]
    );
    res.json(rows.map(row => ({ ...row, isMe: row.id === req.user.id })));
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch leaderboard', error: err.message });
  }
}

module.exports = { getMyRewards, getLeaderboard };
