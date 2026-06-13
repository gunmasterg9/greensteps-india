const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// @route   GET /api/v1/auth/me
// @desc    Get current user profile (using token)
// @access  Private
router.get('/me', auth, (req, res) => {
  res.json({ user: req.user });
});

// @route   POST /api/v1/auth/login
// @desc    Login / Sync user profile
// @access  Private
router.post('/login', auth, (req, res) => {
  res.json({ user: req.user, message: 'Authentication successful' });
});

module.exports = router;
