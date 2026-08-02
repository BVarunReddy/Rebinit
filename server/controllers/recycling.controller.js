const pool = require('../config/db');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const { getWasteInfo } = require('../utils/wasteInfo');

// POST /api/recycling/preview — same idea as reports/preview: classify only,
// nothing saved, no points. Lets the user see the AI's read before committing.
async function previewRecycling(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' });
    }

    let category = 'unknown';
    let confidence = 0;

    try {
      const form = new FormData();
      form.append('image', fs.createReadStream(req.file.path));
      const mlRes = await axios.post(`${process.env.ML_SERVICE_URL}/classify`, form, { headers: form.getHeaders() });
      category = mlRes.data.category;
      confidence = mlRes.data.confidence;
    } catch (e) {
      console.log('ML service unavailable, using default:', e.response?.data || e.message);
    }

    fs.unlink(req.file.path, () => {});

    res.json({ category, confidence, ...getWasteInfo(category) });
  } catch (err) {
    res.status(500).json({ message: 'Preview failed', error: err.message });
  }
}

// POST /api/recycling — actually save the entry and award points.
// This is where category-based rewards belong: you personally recycled
// this item, so what it actually was matters for the reward.
async function createRecyclingEntry(req, res) {
  try {
    const userId = req.user.id;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    let category = 'unknown';
    let confidence = 0;

    if (req.file) {
      try {
        const form = new FormData();
        form.append('image', fs.createReadStream(req.file.path));
        const mlRes = await axios.post(`${process.env.ML_SERVICE_URL}/classify`, form, { headers: form.getHeaders() });
        category = mlRes.data.category;
        confidence = mlRes.data.confidence;
      } catch (e) {
        console.log('ML service unavailable, using default:', e.response?.data || e.message);
      }
    }

    const [result] = await pool.query(
      'INSERT INTO recycling_log (user_id, category, confidence, image_url) VALUES (?,?,?,?)',
      [userId, category, confidence, imageUrl]
    );

    // Category-based reward: genuinely recyclable items earn more than trash,
    // since this is a personal-diversion action, not a civic report.
    const info = getWasteInfo(category);
    const pointsAwarded = category === 'trash' ? 0 : info.hazardous ? 15 : 10;

    if (pointsAwarded > 0) {
      await pool.query('INSERT INTO rewards_log (user_id, points, reason) VALUES (?,?,?)', [userId, pointsAwarded, `Recycled ${category} (log #${result.insertId})`]);
      await pool.query('UPDATE users SET points = points + ? WHERE id = ?', [pointsAwarded, userId]);
    }

    res.status(201).json({
      id: result.insertId,
      category,
      confidence,
      pointsAwarded,
      ...info,
      message: pointsAwarded > 0
        ? `Logged! +${pointsAwarded} points for recycling this ${category} item.`
        : `Logged — classified as non-recyclable trash, no points this time.`,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to log recycling entry', error: err.message });
  }
}

// GET /api/recycling/mine — personal history
async function getMyRecyclingLog(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM recycling_log WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(rows.map(r => ({ ...r, ...getWasteInfo(r.category) })));
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch recycling log', error: err.message });
  }
}

// GET /api/recycling/stats — quick summary for the page header
async function getMyRecyclingStats(req, res) {
  try {
    const [[stats]] = await pool.query(
      `SELECT COUNT(*) AS total_items,
              SUM(CASE WHEN category != 'trash' THEN 1 ELSE 0 END) AS diverted_items
       FROM recycling_log WHERE user_id = ?`,
      [req.user.id]
    );
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stats', error: err.message });
  }
}

module.exports = { previewRecycling, createRecyclingEntry, getMyRecyclingLog, getMyRecyclingStats };
