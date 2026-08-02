const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { verifyToken, requireRole } = require('../middleware/auth');
const { createReport, previewReport, getMyReports, getAllReports, updateStatus } = require('../controllers/reports.controller');

router.post('/preview', verifyToken, upload.single('image'), previewReport);
router.post('/', verifyToken, upload.single('image'), createReport);
router.get('/my', verifyToken, getMyReports);
router.get('/', verifyToken, requireRole('admin'), getAllReports);
router.patch('/:id/status', verifyToken, requireRole('admin'), updateStatus);
module.exports = router;
