const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Activity = require('../models/Activity');
const User = require('../models/User');
const { getIsMockDB, mockStore } = require('../config/db');

// Indian Emission Factors (kg CO2 per unit)
const EMISSION_FACTORS = {
  electricity: 0.82, // per kWh
  lpg: 2.98, // per kg
  // transport: per km
  transport: {
    petrolCar: 0.18,
    dieselCar: 0.14,
    twoWheeler: 0.06,
    ev: 0.04,
    bus: 0.03,
    metro: 0.015
  },
  // food: per meal
  food: {
    highMeat: 2.5,
    vegetarian: 1.2,
    vegan: 0.7
  },
  // shopping: per item
  shopping: 0.5,
  // waste: per kg
  waste: {
    organic: 0.4,
    recyclable: 0.1,
    landfill: 0.6
  }
};

// Helper to calculate activity carbon emission
function calculateCarbon(category, value, subtype = 'default') {
  if (category === 'electricity') {
    return value * EMISSION_FACTORS.electricity;
  }
  if (category === 'lpg') {
    return value * EMISSION_FACTORS.lpg;
  }
  if (category === 'transport') {
    const factor = EMISSION_FACTORS.transport[subtype] || EMISSION_FACTORS.transport.petrolCar;
    return value * factor;
  }
  if (category === 'food') {
    const factor = EMISSION_FACTORS.food[subtype] || EMISSION_FACTORS.food.vegetarian;
    return value * factor;
  }
  if (category === 'shopping') {
    return value * EMISSION_FACTORS.shopping;
  }
  if (category === 'waste') {
    const factor = EMISSION_FACTORS.waste[subtype] || EMISSION_FACTORS.waste.landfill;
    return value * factor;
  }
  return 0;
}

// Helper to pre-populate mock activities if none exist
function ensureMockActivities(userId) {
  const existing = mockStore.activities.filter(a => a.userId === userId);
  if (existing.length > 0) return;

  const now = new Date();
  const categories = ['electricity', 'transport', 'lpg', 'food', 'shopping', 'waste'];
  
  // Create history for last 5 months
  for (let i = 4; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 15);
    
    // Electricity
    mockStore.activities.push({
      _id: `mock-act-elec-${i}`,
      userId,
      category: 'electricity',
      value: 150 - i * 10, // decreasing trend (reducing footprints)
      unit: 'kWh',
      co2Emission: calculateCarbon('electricity', 150 - i * 10),
      date: new Date(date.getTime() - 2 * 24 * 3600000)
    });

    // Transport (mix of metro & twoWheeler)
    mockStore.activities.push({
      _id: `mock-act-trans-${i}`,
      userId,
      category: 'transport',
      value: 300 + i * 50, // replacing car trips with public transit
      unit: 'km',
      co2Emission: calculateCarbon('transport', 300 + i * 50, i > 1 ? 'petrolCar' : 'metro'),
      date: new Date(date.getTime() + 1 * 24 * 3600000)
    });

    // Food
    mockStore.activities.push({
      _id: `mock-act-food-${i}`,
      userId,
      category: 'food',
      value: 30, // 30 meals
      unit: 'meals',
      co2Emission: calculateCarbon('food', 30, i > 2 ? 'highMeat' : 'vegetarian'),
      date: new Date(date.getTime() + 3 * 24 * 3600000)
    });

    // Waste
    mockStore.activities.push({
      _id: `mock-act-waste-${i}`,
      userId,
      category: 'waste',
      value: 20 + i * 2,
      unit: 'kg',
      co2Emission: calculateCarbon('waste', 20 + i * 2, i > 1 ? 'landfill' : 'organic'),
      date: new Date(date.getTime() - 4 * 24 * 3600000)
    });
  }
}

// @route   GET /api/v1/activities
// @desc    Get user activities
// @access  Private
router.get('/', auth, async (req, res) => {
  const isMock = getIsMockDB();

  if (isMock) {
    ensureMockActivities(req.user._id);
    const userActs = mockStore.activities.filter(a => a.userId === req.user._id);
    // Sort by date descending
    userActs.sort((a, b) => new Date(b.date) - new Date(a.date));
    return res.json(userActs);
  }

  try {
    const activities = await Activity.find({ userId: req.user._id }).sort({ date: -1 });
    res.json(activities);
  } catch (error) {
    console.error('Fetch Activities Error:', error);
    res.status(500).json({ message: 'Server error fetching activities' });
  }
});

// @route   POST /api/v1/activities
// @desc    Log a new activity
// @access  Private
router.post('/', auth, async (req, res) => {
  const { category, value, unit, subtype } = req.body;

  if (!category || !value || !unit) {
    return res.status(400).json({ message: 'Please provide category, value, and unit' });
  }

  const calculatedCO2 = calculateCarbon(category, Number(value), subtype);
  
  // Calculate reward points based on activity (e.g. low-emissions get more points)
  let basePoints = 10;
  if (category === 'transport' && (subtype === 'metro' || subtype === 'ev' || subtype === 'bus')) {
    basePoints = 25; // Bonus for green transport
  } else if (category === 'food' && subtype === 'vegan') {
    basePoints = 20; // Bonus for vegan food
  } else if (category === 'waste' && subtype === 'recyclable') {
    basePoints = 15; // Bonus for recycling
  }

  const isMock = getIsMockDB();

  if (isMock) {
    const newActivity = {
      _id: `mock-act-${Date.now()}`,
      userId: req.user._id,
      category,
      value: Number(value),
      unit,
      co2Emission: Number(calculatedCO2.toFixed(2)),
      date: new Date()
    };

    mockStore.activities.push(newActivity);

    // Update user points
    const userIndex = mockStore.users.findIndex(u => u.firebaseUid === req.user.firebaseUid);
    if (userIndex !== -1) {
      mockStore.users[userIndex].greenPoints += basePoints;
      // Add a badge if green points cross milestones
      if (mockStore.users[userIndex].greenPoints >= 200 && !mockStore.users[userIndex].badges.includes('Eco Champ')) {
        mockStore.users[userIndex].badges.push('Eco Champ');
      }
    }

    return res.status(201).json({
      activity: newActivity,
      greenPointsEarned: basePoints,
      message: `Activity logged successfully! Earned ${basePoints} Green Points.`
    });
  }

  try {
    const newActivity = new Activity({
      userId: req.user._id,
      category,
      value: Number(value),
      unit,
      co2Emission: Number(calculatedCO2.toFixed(2))
    });

    await newActivity.save();

    // Update user points
    const user = await User.findById(req.user._id);
    if (user) {
      user.greenPoints += basePoints;
      if (user.greenPoints >= 200 && !user.badges.includes('Eco Champ')) {
        user.badges.push('Eco Champ');
      }
      await user.save();
    }

    res.status(201).json({
      activity: newActivity,
      greenPointsEarned: basePoints,
      message: `Activity logged successfully! Earned ${basePoints} Green Points.`
    });
  } catch (error) {
    console.error('Log Activity Error:', error);
    res.status(500).json({ message: 'Server error logging activity' });
  }
});

module.exports = router;
// Attach helpers to router object so they are exportable in CommonJS
router.EMISSION_FACTORS = EMISSION_FACTORS;
router.calculateCarbon = calculateCarbon;

