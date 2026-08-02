const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { getCollectionPoints, getGeoReports } = require('../controllers/map.controller');
router.get('/collection-points', verifyToken, getCollectionPoints);
router.get('/reports', verifyToken, getGeoReports);
module.exports = router;
