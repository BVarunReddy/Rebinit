const pool = require("../config/db");
const crypto = require("crypto");

function generateCode() {
  const random = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `REBINIT-${random}`;
}

// GET /api/redemptions/catalog
async function getCatalog(req, res) {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM rewards_catalog WHERE active = 1 ORDER BY points_cost ASC",
    );
    res.json(rows);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch catalog", error: err.message });
  }
}

// POST /api/redemptions/:catalogItemId
async function redeemItem(req, res) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [[item]] = await conn.query(
      "SELECT * FROM rewards_catalog WHERE id = ? AND active = 1",
      [req.params.catalogItemId],
    );
    if (!item) {
      await conn.rollback();
      return res
        .status(404)
        .json({ message: "Reward not found or no longer available" });
    }

    const [[user]] = await conn.query(
      "SELECT points FROM users WHERE id = ? FOR UPDATE",
      [req.user.id],
    );
    if (user.points < item.points_cost) {
      await conn.rollback();
      return res
        .status(400)
        .json({
          message: `Not enough points. You have ${user.points}, this costs ${item.points_cost}.`,
        });
    }

    const code = generateCode();

    await conn.query("UPDATE users SET points = points - ? WHERE id = ?", [
      item.points_cost,
      req.user.id,
    ]);
    const [result] = await conn.query(
      "INSERT INTO redemptions (user_id, catalog_item_id, code, points_spent) VALUES (?,?,?,?)",
      [req.user.id, item.id, code, item.points_cost],
    );
    // Negative entry in rewards_log so the points history shows the full
    // earn-and-spend picture, not just accumulation.
    await conn.query(
      "INSERT INTO rewards_log (user_id, points, reason) VALUES (?,?,?)",
      [
        req.user.id,
        -item.points_cost,
        `Redeemed: ${item.title} (${item.partner_name})`,
      ],
    );
    await conn.query(
      "INSERT INTO notifications (user_id, title, message) VALUES (?,?,?)",
      [
        req.user.id,
        "Voucher redeemed!",
        `Your code for "${item.title}" is ${code}. Check My Vouchers to view it anytime.`,
      ],
    );

    await conn.commit();

    res.status(201).json({
      id: result.insertId,
      code,
      title: item.title,
      partner_name: item.partner_name,
      points_spent: item.points_cost,
      message: `Redeemed! Your code is ${code}`,
    });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: "Redemption failed", error: err.message });
  } finally {
    conn.release();
  }
}

// GET /api/redemptions/mine
async function getMyRedemptions(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, c.title, c.description, c.partner_name
       FROM redemptions r JOIN rewards_catalog c ON c.id = r.catalog_item_id
       WHERE r.user_id = ? ORDER BY r.redeemed_at DESC`,
      [req.user.id],
    );
    res.json(rows);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch redemptions", error: err.message });
  }
}

module.exports = { getCatalog, redeemItem, getMyRedemptions };
