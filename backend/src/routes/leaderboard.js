const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { getIsMockDB, mockStore } = require('../config/db');

// List of mock users representing Indian States & UTs
const DEFAULT_MOCK_USERS = [
  { name: 'Kavitha Ramaswamy', email: 'kavitha@example.com', firebaseUid: 'mock-uid-kavitha', state: 'Tamil Nadu', city: 'Chennai', carbonScore: 1200, greenPoints: 640, badges: ['Tree Planter', 'Solar Fanatic', 'Eco Champ'], role: 'user' },
  { name: 'Rohan Deshmukh', email: 'rohan@example.com', firebaseUid: 'mock-uid-rohan', state: 'Maharashtra', city: 'Mumbai', carbonScore: 1850, greenPoints: 480, badges: ['Eco Champ', 'Metro Rider'], role: 'user' },
  { name: 'Priya Hegde', email: 'priya@example.com', firebaseUid: 'mock-uid-priya', state: 'Karnataka', city: 'Bengaluru', carbonScore: 1400, greenPoints: 520, badges: ['Zero Plastic', 'Eco Champ'], role: 'user' },
  { name: 'Amit Sharma', email: 'amit@example.com', firebaseUid: 'mock-uid-amit', state: 'Delhi', city: 'New Delhi', carbonScore: 2100, greenPoints: 320, badges: ['Metro Rider'], role: 'user' },
  { name: 'Sneha Nair', email: 'sneha@example.com', firebaseUid: 'mock-uid-sneha', state: 'Kerala', city: 'Kochi', carbonScore: 950, greenPoints: 720, badges: ['Earth Friend', 'Tree Planter', 'Zero Plastic'], role: 'user' },
  { name: 'Aarav Patel', email: 'aarav@example.com', firebaseUid: 'mock-uid-aarav', state: 'Gujarat', city: 'Ahmedabad', carbonScore: 2300, greenPoints: 240, badges: ['Earth Friend'], role: 'user' },
  { name: 'Vikram Singh', email: 'vikram@example.com', firebaseUid: 'mock-uid-vikram', state: 'Uttar Pradesh', city: 'Noida', carbonScore: 2800, greenPoints: 180, badges: ['Earth Friend'], role: 'user' },
  { name: 'Anjali Bose', email: 'anjali@example.com', firebaseUid: 'mock-uid-anjali', state: 'West Bengal', city: 'Kolkata', carbonScore: 1650, greenPoints: 410, badges: ['Eco Champ'], role: 'user' },
  { name: 'Harshit Shah', email: 'harshit@example.com', firebaseUid: 'mock-uid-harshit', state: 'Gujarat', city: 'Surat', carbonScore: 1950, greenPoints: 380, badges: ['Zero Plastic'], role: 'user' },
  { name: 'Meera Kutty', email: 'meera@example.com', firebaseUid: 'mock-uid-meera', state: 'Kerala', city: 'Trivandrum', carbonScore: 1100, greenPoints: 590, badges: ['Eco Champ', 'Tree Planter'], role: 'user' }
];

function seedMockUsers() {
  if (mockStore.users.length <= 1) { // only has logged in user
    DEFAULT_MOCK_USERS.forEach((user, idx) => {
      mockStore.users.push({
        _id: `mock-seed-user-${idx}`,
        ...user,
        createdAt: new Date(Date.now() - idx * 24 * 3600000)
      });
    });
  }
}

// @route   GET /api/v1/leaderboard
// @desc    Get overall user standings & state rankings
// @access  Public
router.get('/', async (req, res) => {
  const isMock = getIsMockDB();

  if (isMock) {
    seedMockUsers();
    
    // 1. Overall Standings (top users by greenPoints)
    const topUsers = [...mockStore.users]
      .sort((a, b) => b.greenPoints - a.greenPoints)
      .slice(0, 10)
      .map(u => ({
        name: u.name,
        state: u.state,
        city: u.city,
        greenPoints: u.greenPoints,
        carbonScore: u.carbonScore,
        badgesCount: u.badges.length
      }));

    // 2. State-wise Aggregations
    const stateGroups = {};
    mockStore.users.forEach(u => {
      if (!stateGroups[u.state]) {
        stateGroups[u.state] = {
          stateName: u.state,
          totalUsers: 0,
          totalCarbon: 0,
          totalPoints: 0
        };
      }
      stateGroups[u.state].totalUsers += 1;
      stateGroups[u.state].totalCarbon += u.carbonScore;
      stateGroups[u.state].totalPoints += u.greenPoints;
    });

    const stateRankings = Object.values(stateGroups).map(s => ({
      state: s.stateName,
      userCount: s.totalUsers,
      avgCarbonScore: Number((s.totalCarbon / s.totalUsers).toFixed(0)),
      avgGreenPoints: Number((s.totalPoints / s.totalUsers).toFixed(0)),
      // Savings is calculated as an offset relative to average Indian carbon footprint (~2500 kg per capita)
      carbonSavings: Number((Math.max(0, (2500 * s.totalUsers) - s.totalCarbon)).toFixed(0))
    })).sort((a, b) => b.avgGreenPoints - a.avgGreenPoints);

    return res.json({
      topUsers,
      stateRankings
    });
  }

  try {
    // 1. Top 10 users by Green Points
    const topUsers = await User.find({}, 'name state city greenPoints carbonScore badges')
      .sort({ greenPoints: -1 })
      .limit(10);

    const formattedTopUsers = topUsers.map(u => ({
      name: u.name,
      state: u.state,
      city: u.city,
      greenPoints: u.greenPoints,
      carbonScore: u.carbonScore,
      badgesCount: u.badges.length
    }));

    // 2. Group by state
    const stateAggregation = await User.aggregate([
      {
        $group: {
          _id: '$state',
          userCount: { $sum: 1 },
          avgCarbonScore: { $avg: '$carbonScore' },
          avgGreenPoints: { $avg: '$greenPoints' },
          totalCarbon: { $sum: '$carbonScore' }
        }
      },
      {
        $project: {
          state: '$_id',
          userCount: 1,
          avgCarbonScore: { $round: ['$avgCarbonScore', 0] },
          avgGreenPoints: { $round: ['$avgGreenPoints', 0] },
          carbonSavings: {
            $round: [
              { $max: [0, { $subtract: [{ $multiply: [2500, '$userCount'] }, '$totalCarbon'] }] },
              0
            ]
          }
        }
      },
      {
        $sort: { avgGreenPoints: -1 }
      }
    ]);

    res.json({
      topUsers: formattedTopUsers,
      stateRankings: stateAggregation
    });
  } catch (error) {
    console.error('Leaderboard Fetch Error:', error);
    res.status(500).json({ message: 'Server error loading leaderboard' });
  }
});

module.exports = router;
module.exports.DEFAULT_MOCK_USERS = DEFAULT_MOCK_USERS;
