const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const { getIsMockDB, mockStore } = require('../config/db');

// @route   GET /api/v1/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, (req, res) => {
  res.json(req.user);
});

// @route   PUT /api/v1/users/profile
// @desc    Update user profile (state, city, name, etc.)
// @access  Private
router.put('/profile', auth, async (req, res) => {
  const { name, state, city, carbonScore, greenPoints, badges } = req.body;
  const isMock = getIsMockDB();

  if (isMock) {
    const userIndex = mockStore.users.findIndex(u => u.firebaseUid === req.user.firebaseUid);
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update fields
    if (name !== undefined) mockStore.users[userIndex].name = name;
    if (state !== undefined) mockStore.users[userIndex].state = state;
    if (city !== undefined) mockStore.users[userIndex].city = city;
    if (carbonScore !== undefined) mockStore.users[userIndex].carbonScore = Number(carbonScore);
    if (greenPoints !== undefined) mockStore.users[userIndex].greenPoints = Number(greenPoints);
    if (badges !== undefined) mockStore.users[userIndex].badges = badges;

    req.user = mockStore.users[userIndex];
    return res.json({ user: req.user, message: 'Profile updated successfully' });
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name !== undefined) user.name = name;
    if (state !== undefined) user.state = state;
    if (city !== undefined) user.city = city;
    if (carbonScore !== undefined) user.carbonScore = Number(carbonScore);
    if (greenPoints !== undefined) user.greenPoints = Number(greenPoints);
    if (badges !== undefined) user.badges = badges;

    await user.save();
    res.json({ user, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

module.exports = router;
