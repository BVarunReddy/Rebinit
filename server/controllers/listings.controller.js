const pool = require('../config/db');
const { uploadBuffer } = require('../config/cloudinary');

async function createListing(req, res) {
  try {
    const { title, category, description, quantity, location, price } = req.body;
    const imageUrl = req.file ? await uploadBuffer(req.file.buffer, 'rebinit/listings') : null;
    const [result] = await pool.query(
      'INSERT INTO listings (user_id, title, category, description, quantity, location, price, image_url) VALUES (?,?,?,?,?,?,?,?)',
      [req.user.id, title, category, description, quantity, location, price || null, imageUrl]
    );
    res.status(201).json({ id: result.insertId, message: 'Listing created' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create listing', error: err.message });
  }
}

async function getAllListings(req, res) {
  try {
    const { category, search, location, minPrice, maxPrice } = req.query;
    let query = `SELECT l.*, u.name AS user_name, u.email AS user_email, u.phone AS user_phone, l.user_id = ? AS is_mine FROM listings l JOIN users u ON u.id = l.user_id WHERE l.status = 'Available'`;
    const params = [req.user.id];

    if (category) { query += ' AND l.category = ?'; params.push(category); }
    if (search) { query += ' AND (l.title LIKE ? OR l.description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    if (location) { query += ' AND l.location LIKE ?'; params.push(`%${location}%`); }
    if (minPrice) { query += ' AND l.price >= ?'; params.push(minPrice); }
    if (maxPrice) { query += ' AND l.price <= ?'; params.push(maxPrice); }

    query += ' ORDER BY l.created_at DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows.map(r => ({ ...r, is_mine: !!r.is_mine })));
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch listings', error: err.message });
  }
}

async function getMyListings(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM listings WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch listings', error: err.message });
  }
}

async function updateListingStatus(req, res) {
  try {
    const { status } = req.body;
    await pool.query('UPDATE listings SET status = ? WHERE id = ? AND user_id = ?', [status, req.params.id, req.user.id]);
    res.json({ message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update listing', error: err.message });
  }
}

async function deleteListing(req, res) {
  try {
    await pool.query('DELETE FROM listings WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Listing deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete listing', error: err.message });
  }
}

module.exports = { createListing, getAllListings, getMyListings, updateListingStatus, deleteListing };
