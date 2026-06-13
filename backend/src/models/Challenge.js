const mongoose = require('mongoose');

const ChallengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  rewardPoints: {
    type: Number,
    required: true
  },
  durationDays: {
    type: Number,
    required: true
  },
  participantsCount: {
    type: Number,
    default: 0
  },
  targetValue: {
    type: Number,
    required: true
  },
  iconName: {
    type: String,
    default: 'Leaf'
  }
});

module.exports = mongoose.model('Challenge', ChallengeSchema);
