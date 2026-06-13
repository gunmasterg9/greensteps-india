const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Challenge = require('../models/Challenge');
const User = require('../models/User');
const { getIsMockDB, mockStore } = require('../config/db');

// Helper to seed challenges in live db if empty
async function seedLiveChallenges() {
  const count = await Challenge.countDocuments();
  if (count > 0) return;

  const defaultChallenges = mockStore.challenges.map(c => {
    // strip mock _id so mongo generates its own
    const { _id, ...rest } = c;
    return rest;
  });

  await Challenge.insertMany(defaultChallenges);
}

// @route   GET /api/v1/challenges
// @desc    Get all challenges
// @access  Private
router.get('/', auth, async (req, res) => {
  const isMock = getIsMockDB();

  if (isMock) {
    return res.json(mockStore.challenges);
  }

  try {
    await seedLiveChallenges();
    const challenges = await Challenge.find();
    res.json(challenges);
  } catch (error) {
    console.error('Fetch Challenges Error:', error);
    res.status(500).json({ message: 'Server error fetching challenges' });
  }
});

// @route   POST /api/v1/challenges/:id/join
// @desc    Join a challenge
// @access  Private
router.post('/:id/join', auth, async (req, res) => {
  const { id } = req.params;
  const isMock = getIsMockDB();

  if (isMock) {
    const challenge = mockStore.challenges.find(c => c._id === id);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    challenge.participantsCount += 1;
    return res.json({ challenge, message: 'Successfully joined the challenge!' });
  }

  try {
    const challenge = await Challenge.findById(id);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    challenge.participantsCount += 1;
    await challenge.save();
    res.json({ challenge, message: 'Successfully joined the challenge!' });
  } catch (error) {
    console.error('Join Challenge Error:', error);
    res.status(500).json({ message: 'Server error joining challenge' });
  }
});

// @route   POST /api/v1/challenges/:id/complete
// @desc    Complete a challenge and claim points
// @access  Private
router.post('/:id/complete', auth, async (req, res) => {
  const { id } = req.params;
  const isMock = getIsMockDB();

  if (isMock) {
    const challenge = mockStore.challenges.find(c => c._id === id);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    const userIndex = mockStore.users.findIndex(u => u.firebaseUid === req.user.firebaseUid);
    if (userIndex !== -1) {
      mockStore.users[userIndex].greenPoints += challenge.rewardPoints;
      // Add challenge badge if applicable
      const badgeName = `${challenge.title.split(' ')[0]} Master`;
      if (!mockStore.users[userIndex].badges.includes(badgeName)) {
        mockStore.users[userIndex].badges.push(badgeName);
      }
      req.user = mockStore.users[userIndex];
    }

    return res.json({
      user: req.user,
      pointsEarned: challenge.rewardPoints,
      message: `Challenge completed! You earned ${challenge.rewardPoints} Green Points.`
    });
  }

  try {
    const challenge = await Challenge.findById(id);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.greenPoints += challenge.rewardPoints;
    const badgeName = `${challenge.title.split(' ')[0]} Master`;
    if (!user.badges.includes(badgeName)) {
      user.badges.push(badgeName);
    }
    await user.save();

    res.json({
      user,
      pointsEarned: challenge.rewardPoints,
      message: `Challenge completed! You earned ${challenge.rewardPoints} Green Points.`
    });
  } catch (error) {
    console.error('Complete Challenge Error:', error);
    res.status(500).json({ message: 'Server error completing challenge' });
  }
});

module.exports = router;
