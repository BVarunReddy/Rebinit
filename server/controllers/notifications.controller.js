const pool = require("../config/db");

async function getMyNotifications(req, res) {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50",
      [req.user.id],
    );
    res.json(rows);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch notifications", error: err.message });
  }
}

async function markAllRead(req, res) {
  try {
    await pool.query("UPDATE notifications SET is_read = 1 WHERE user_id = ?", [
      req.user.id,
    ]);
    res.json({ message: "All marked as read" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to mark as read", error: err.message });
  }
}

async function markOneRead(req, res) {
  try {
    await pool.query(
      "UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id],
    );
    res.json({ message: "Marked as read" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to mark as read", error: err.message });
  }
}

async function getUnreadCount(req, res) {
  try {
    const [[{ count }]] = await pool.query(
      "SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = 0",
      [req.user.id],
    );
    res.json({ count });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to get count", error: err.message });
  }
}

module.exports = {
  getMyNotifications,
  markAllRead,
  markOneRead,
  getUnreadCount,
};
