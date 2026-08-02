const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { verifyToken } = require('../middleware/auth');
const {
  previewRecycling,
  createRecyclingEntry,
  getMyRecyclingLog,
  getMyRecyclingStats,
} = require('../controllers/recycling.controller');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

router.post('/preview', verifyToken, upload.single('image'), previewRecycling);
router.post('/', verifyToken, upload.single('image'), createRecyclingEntry);
router.get('/mine', verifyToken, getMyRecyclingLog);
router.get('/stats', verifyToken, getMyRecyclingStats);

module.exports = router;
