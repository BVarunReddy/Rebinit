const express = require('express');
const router = express.Router();
const { signup, login, updateProfile } = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth');
router.post('/signup', signup);
router.post('/login', login);
router.patch('/profile', verifyToken, updateProfile);
module.exports = router;
