const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Challenge = require('../models/Challenge');
const Activity = require('../models/Activity');
const { getIsMockDB, mockStore } = require('../config/db');

// Middleware to ensure user is admin
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Administrator role required.' });
  }
};

// @route   GET /api/v1/admin/users
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get('/users', [auth, adminOnly], async (req, res) => {
  const isMock = getIsMockDB();

  if (isMock) {
    const list = mockStore.users.map(u => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      state: u.state,
      city: u.city,
      carbonScore: u.carbonScore,
      greenPoints: u.greenPoints,
      role: u.role,
      createdAt: u.createdAt
    }));
    return res.json(list);
  }

  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Admin Fetch Users Error:', error);
    res.status(500).json({ message: 'Server error listing users' });
  }
});

// @route   DELETE /api/v1/admin/users/:id
// @desc    Delete a user (Admin only)
// @access  Private/Admin
router.delete('/users/:id', [auth, adminOnly], async (req, res) => {
  const { id } = req.params;
  const isMock = getIsMockDB();

  if (isMock) {
    const index = mockStore.users.findIndex(u => u._id === id);
    if (index === -1) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Delete their activities too
    mockStore.activities = mockStore.activities.filter(a => a.userId !== id);
    mockStore.users.splice(index, 1);
    return res.json({ message: 'User deleted successfully from mock store.' });
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete users activities
    await Activity.deleteMany({ userId: id });
    await User.findByIdAndDelete(id);

    res.json({ message: 'User and associated activities deleted successfully.' });
  } catch (error) {
    console.error('Admin Delete User Error:', error);
    res.status(500).json({ message: 'Server error deleting user' });
  }
});

// @route   POST /api/v1/admin/challenges
// @desc    Create a new challenge (Admin only)
// @access  Private/Admin
router.post('/challenges', [auth, adminOnly], async (req, res) => {
  const { title, description, category, rewardPoints, durationDays, targetValue, iconName } = req.body;

  if (!title || !description || !category || !rewardPoints || !durationDays || !targetValue) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  const isMock = getIsMockDB();

  if (isMock) {
    const newChallenge = {
      _id: `challenge_${Date.now()}`,
      title,
      description,
      category,
      rewardPoints: Number(rewardPoints),
      durationDays: Number(durationDays),
      participantsCount: 0,
      targetValue: Number(targetValue),
      iconName: iconName || 'Leaf'
    };
    mockStore.challenges.push(newChallenge);
    return res.status(201).json({ challenge: newChallenge, message: 'Challenge created in mock store successfully!' });
  }

  try {
    const newChallenge = new Challenge({
      title,
      description,
      category,
      rewardPoints: Number(rewardPoints),
      durationDays: Number(durationDays),
      targetValue: Number(targetValue),
      iconName: iconName || 'Leaf'
    });

    await newChallenge.save();
    res.status(201).json({ challenge: newChallenge, message: 'Challenge created successfully!' });
  } catch (error) {
    console.error('Admin Create Challenge Error:', error);
    res.status(500).json({ message: 'Server error creating challenge' });
  }
});

// @route   GET /api/v1/admin/analytics
// @desc    Get application analytics (Admin only)
// @access  Private/Admin
router.get('/analytics', [auth, adminOnly], async (req, res) => {
  const isMock = getIsMockDB();

  if (isMock) {
    const userCount = mockStore.users.length;
    const challengeCount = mockStore.challenges.length;
    const activityCount = mockStore.activities.length;

    // Calculate total carbon savings (assume baseline 2500 per capita)
    const totalCarbonScore = mockStore.users.reduce((acc, u) => acc + (u.carbonScore || 0), 0);
    const estimatedSavings = Math.max(0, (2500 * userCount) - totalCarbonScore);

    // Activity breakdown by category
    const categoryCounts = { transport: 0, electricity: 0, lpg: 0, food: 0, shopping: 0, waste: 0 };
    let totalCo2Emitted = 0;
    mockStore.activities.forEach(a => {
      if (categoryCounts[a.category] !== undefined) {
        categoryCounts[a.category] += 1;
      }
      totalCo2Emitted += a.co2Emission;
    });

    const categoryBreakdown = Object.keys(categoryCounts).map(cat => ({
      category: cat,
      count: categoryCounts[cat],
      co2: Number((mockStore.activities.filter(a => a.category === cat).reduce((acc, a) => acc + a.co2Emission, 0)).toFixed(2))
    }));

    return res.json({
      summary: {
        totalUsers: userCount,
        totalChallenges: challengeCount,
        totalActivities: activityCount,
        totalCarbonSavingsKg: Number(estimatedSavings.toFixed(0)),
        avgCarbonScorePerCapita: userCount > 0 ? Number((totalCarbonScore / userCount).toFixed(0)) : 0,
        totalCo2EmittedKg: Number(totalCo2Emitted.toFixed(0))
      },
      categoryBreakdown
    });
  }

  try {
    const userCount = await User.countDocuments();
    const challengeCount = await Challenge.countDocuments();
    const activityCount = await Activity.countDocuments();

    // Total Carbon Score
    const aggregateUsers = await User.aggregate([
      {
        $group: {
          _id: null,
          totalCarbon: { $sum: '$carbonScore' }
        }
      }
    ]);
    const totalCarbonScore = aggregateUsers.length > 0 ? aggregateUsers[0].totalCarbon : 0;
    const estimatedSavings = Math.max(0, (2500 * userCount) - totalCarbonScore);

    // Activity count by category & emissions
    const categoryBreakdown = await Activity.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          co2: { $sum: '$co2Emission' }
        }
      },
      {
        $project: {
          category: '$_id',
          count: 1,
          co2: { $round: ['$co2', 2] }
        }
      }
    ]);

    // Total CO2 Emitted
    const totalCo2Aggregate = await Activity.aggregate([
      {
        $group: {
          _id: null,
          totalCo2: { $sum: '$co2Emission' }
        }
      }
    ]);
    const totalCo2Emitted = totalCo2Aggregate.length > 0 ? totalCo2Aggregate[0].totalCo2 : 0;

    res.json({
      summary: {
        totalUsers: userCount,
        totalChallenges: challengeCount,
        totalActivities: activityCount,
        totalCarbonSavingsKg: Math.round(estimatedSavings),
        avgCarbonScorePerCapita: userCount > 0 ? Math.round(totalCarbonScore / userCount) : 0,
        totalCo2EmittedKg: Math.round(totalCo2Emitted)
      },
      categoryBreakdown
    });
  } catch (error) {
    console.error('Admin Analytics Error:', error);
    res.status(500).json({ message: 'Server error retrieving analytics reports' });
  }
});

module.exports = router;
