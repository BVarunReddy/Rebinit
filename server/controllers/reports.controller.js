const pool = require('../config/db');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const { getWasteInfo } = require('../utils/wasteInfo');

// POST /api/reports/preview — classify an image only, don't save anything or
// award points yet. Used by the "instant prediction" screen so the user can
// see what the AI thinks before committing to a full report submission.
async function previewReport(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' });
    }

    let category = 'unknown';
    let confidence = 0;

    try {
      const form = new FormData();
      form.append('image', fs.createReadStream(req.file.path));

      const mlRes = await axios.post(
        `${process.env.ML_SERVICE_URL}/classify`,
        form,
        { headers: form.getHeaders() }
      );
      category = mlRes.data.category;
      confidence = mlRes.data.confidence;
    } catch (e) {
      console.log('ML service unavailable, using default:', e.response?.data || e.message);
    }

    // Clean up the temp file — this was only for prediction, not a saved report.
    // The real file gets re-uploaded and saved when the user actually submits.
    fs.unlink(req.file.path, () => {});

    res.json({
      category,
      confidence,
      ...getWasteInfo(category),
    });
  } catch (err) {
    res.status(500).json({ message: 'Preview failed', error: err.message });
  }
}

async function createReport(req, res) {
  try {
    const { description, latitude, longitude, severity } = req.body;
    const userId = req.user.id;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    // This is a civic dumping report, not a personal recycling log — a
    // report with no location is useless to whoever has to clean it up.
    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Location is required to report a dump site' });
    }

    let category = 'unknown';
    let confidence = 0;

    if (req.file) {
      try {
        const form = new FormData();
        form.append('image', fs.createReadStream(req.file.path));

        const mlRes = await axios.post(
          `${process.env.ML_SERVICE_URL}/classify`,
          form,
          { headers: form.getHeaders() }
        );
        category = mlRes.data.category;
        confidence = mlRes.data.confidence;
      } catch (e) {
        console.log('ML service unavailable, using default:', e.response?.data || e.message);
      }
    }

    const [result] = await pool.query(
      'INSERT INTO reports (user_id, category, confidence, description, severity, image_url, latitude, longitude) VALUES (?,?,?,?,?,?,?,?)',
      [userId, category, confidence, description, severity || 'Medium', imageUrl, latitude, longitude]
    );

    // Civic reporting: you're flagging a problem, not recycling it yourself —
    // so the reward is a flat "thanks for reporting" amount, independent of
    // what category the classifier guessed. (Personal recycling logging,
    // where category-based rewards make sense, is a separate feature.)
    const pointsAwarded = 5;
    await pool.query('INSERT INTO rewards_log (user_id, points, reason) VALUES (?,?,?)', [userId, pointsAwarded, `Dumping report #${result.insertId} submitted`]);
    await pool.query('UPDATE users SET points = points + ? WHERE id = ?', [pointsAwarded, userId]);

    await pool.query('INSERT INTO notifications (user_id, title, message) VALUES (?,?,?)', [
      userId,
      'Dumping report submitted!',
      `Thanks for flagging this — report #${result.insertId} has been received and is being reviewed by the cleanup team.`,
    ]);

    res.status(201).json({
      id: result.insertId,
      category,
      confidence,
      pointsAwarded,
      ...getWasteInfo(category),
      message: `Dumping report submitted — thanks for flagging it. +${pointsAwarded} points awarded.`,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create report', error: err.message });
  }
}

async function getMyReports(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM reports WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
    res.json(rows.map(r => ({ ...r, ...getWasteInfo(r.category) })));
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch reports', error: err.message });
  }
}

async function getAllReports(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, u.name AS user_name FROM reports r
       JOIN users u ON u.id = r.user_id ORDER BY r.created_at DESC`
    );
    res.json(rows.map(r => ({ ...r, ...getWasteInfo(r.category) })));
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch reports', error: err.message });
  }
}

async function updateStatus(req, res) {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const [[report]] = await pool.query('SELECT user_id, category FROM reports WHERE id = ?', [id]);
    await pool.query('UPDATE reports SET status = ? WHERE id = ?', [status, id]);

    if (report) {
      await pool.query('INSERT INTO notifications (user_id, title, message) VALUES (?,?,?)', [
        report.user_id,
        `Report #${id} ${status}`,
        `Your waste report (${report.category}) has been updated to "${status}".`,
      ]);
    }

    res.json({ message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update status', error: err.message });
  }
}

module.exports = { createReport, previewReport, getMyReports, getAllReports, updateStatus };