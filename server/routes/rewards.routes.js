const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { getMyRewards, getLeaderboard } = require('../controllers/rewards.controller');
router.get('/me', verifyToken, getMyRewards);
router.get('/leaderboard', verifyToken, getLeaderboard);
module.exports = router;
