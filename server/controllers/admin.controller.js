const pool = require('../config/db');

async function getStats(req, res) {
  try {
    const [[{ totalUsers }]] = await pool.query('SELECT COUNT(*) AS totalUsers FROM users');
    const [[{ totalReports }]] = await pool.query('SELECT COUNT(*) AS totalReports FROM reports');
    const [[{ totalListings }]] = await pool.query('SELECT COUNT(*) AS totalListings FROM listings');
    const [[{ resolvedReports }]] = await pool.query("SELECT COUNT(*) AS resolvedReports FROM reports WHERE status = 'Resolved'");
    const [reportsByStatus] = await pool.query("SELECT status, COUNT(*) AS count FROM reports GROUP BY status");
    const [reportsByCategory] = await pool.query("SELECT category, COUNT(*) AS count FROM reports GROUP BY category ORDER BY count DESC");
    const [reportsOverTime] = await pool.query(`SELECT DATE(created_at) AS date, COUNT(*) AS count FROM reports WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 14 DAY) GROUP BY DATE(created_at) ORDER BY date ASC`);
    const [topUsers] = await pool.query('SELECT id, name, points FROM users ORDER BY points DESC LIMIT 5');
    res.json({ cards: { totalUsers, totalReports, totalListings, resolvedReports }, reportsByStatus, reportsByCategory, reportsOverTime, topUsers });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stats', error: err.message });
  }
}

async function getAllUsers(req, res) {
  try {
    const [rows] = await pool.query(`SELECT u.id, u.name, u.email, u.role, u.points, u.created_at, COUNT(r.id) AS reportCount FROM users u LEFT JOIN reports r ON r.user_id = u.id GROUP BY u.id ORDER BY u.created_at DESC`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
}

async function updateUserRole(req, res) {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) return res.status(400).json({ message: 'Invalid role' });
    await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
    res.json({ message: 'Role updated' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update role', error: err.message });
  }
}

async function getAllListings(req, res) {
  try {
    const [rows] = await pool.query(`SELECT l.*, u.name AS user_name FROM listings l JOIN users u ON u.id = l.user_id ORDER BY l.created_at DESC`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch listings', error: err.message });
  }
}

async function deleteListing(req, res) {
  try {
    await pool.query('DELETE FROM listings WHERE id = ?', [req.params.id]);
    res.json({ message: 'Listing deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete listing', error: err.message });
  }
}

module.exports = { getStats, getAllUsers, updateUserRole, getAllListings, deleteListing };
