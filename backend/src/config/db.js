const mongoose = require('mongoose');

let isMockDB = false;
const mockStore = {
  users: [],
  activities: [],
  challenges: [
    {
      _id: 'challenge_1',
      title: 'Plastic Free Challenge',
      description: 'Avoid buying single-use plastics for 7 days. Use cotton bags and glass containers.',
      category: 'shopping',
      rewardPoints: 100,
      durationDays: 7,
      participantsCount: 1240,
      targetValue: 7,
      iconName: 'Sparkles'
    },
    {
      _id: 'challenge_2',
      title: 'No Car Sunday',
      description: 'Travel only using metro, public buses, bi-cycling, or walking this Sunday.',
      category: 'transport',
      rewardPoints: 150,
      durationDays: 1,
      participantsCount: 890,
      targetValue: 1,
      iconName: 'Bike'
    },
    {
      _id: 'challenge_3',
      title: 'Plant Trees Challenge',
      description: 'Plant a sapling in your balcony or local community park and upload details.',
      category: 'waste',
      rewardPoints: 200,
      durationDays: 30,
      participantsCount: 450,
      targetValue: 1,
      iconName: 'Leaf'
    },
    {
      _id: 'challenge_4',
      title: 'Eat Local & Vegan',
      description: 'Eat entirely plant-based meals sourced from local organic vendors for 3 days.',
      category: 'food',
      rewardPoints: 80,
      durationDays: 3,
      participantsCount: 620,
      targetValue: 3,
      iconName: 'Apple'
    }
  ]
};

async function connectDB() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri || mongoUri.includes('<username>') || mongoUri === '') {
    console.warn('\x1b[33m%s\x1b[0m', '⚠️ WARNING: MONGO_URI is missing or unconfigured.');
    console.warn('\x1b[36m%s\x1b[0m', 'ℹ️ Falling back to server in-memory database mode for development & preview.');
    isMockDB = true;
    return;
  }

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    isMockDB = false;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.warn('\x1b[33m%s\x1b[0m', '⚠️ Falling back to server in-memory database mode due to connection failure.');
    isMockDB = true;
  }
}

module.exports = {
  connectDB,
  getIsMockDB: () => isMockDB,
  mockStore
};
