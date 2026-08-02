const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { verifyToken } = require('../middleware/auth');
const {
  previewRecycling,
  createRecyclingEntry,
  getMyRecyclingLog,
  getMyRecyclingStats,
} = require('../controllers/recycling.controller');

router.post('/preview', verifyToken, upload.single('image'), previewRecycling);
router.post('/', verifyToken, upload.single('image'), createRecyclingEntry);
router.get('/mine', verifyToken, getMyRecyclingLog);
router.get('/stats', verifyToken, getMyRecyclingStats);

module.exports = router;
