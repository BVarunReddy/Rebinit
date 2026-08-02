const pool = require('../config/db');

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

async function getCollectionPoints(req, res) {
  try {
    const [rows] = await pool.query('SELECT id, name, latitude, longitude, type FROM collection_points');
    const { lat, lng, radius } = req.query;
    if (!lat || !lng) return res.json(rows);
    const userLat = parseFloat(lat), userLng = parseFloat(lng), maxKm = parseFloat(radius) || 10;
    const nearby = rows.map(pt => ({ ...pt, distance_km: parseFloat(haversine(userLat, userLng, parseFloat(pt.latitude), parseFloat(pt.longitude)).toFixed(2)) })).filter(pt => pt.distance_km <= maxKm).sort((a, b) => a.distance_km - b.distance_km);
    res.json(nearby);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch collection points', error: err.message });
  }
}

async function getGeoReports(req, res) {
  try {
    const [rows] = await pool.query(`SELECT id, category, latitude, longitude, status, created_at FROM reports WHERE latitude IS NOT NULL AND longitude IS NOT NULL ORDER BY created_at DESC LIMIT 200`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch geo reports', error: err.message });
  }
}

module.exports = { getCollectionPoints, getGeoReports };
