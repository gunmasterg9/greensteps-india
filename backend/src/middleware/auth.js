const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getIsMockDB, mockStore } = require('../config/db');

// Initialize Firebase Admin (only if environment is populated)
let firebaseInitialized = false;
try {
  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
    firebaseInitialized = true;
    console.log('✅ Firebase Admin SDK Initialized Successfully.');
  } else {
    console.warn('⚠️ Firebase credentials not fully configured. Using Mock Authentication fallback.');
  }
} catch (error) {
  console.warn('⚠️ Failed to initialize Firebase Admin SDK:', error.message);
  console.warn('ℹ️ Using Mock Authentication fallback.');
}

module.exports = async function(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Check if it's a developer mock token or if firebase is not initialized
    if (token.startsWith('mock-token-') || !firebaseInitialized) {
      let email = 'guest@greensteps.in';
      let name = 'Guest Citizen';
      let firebaseUid = 'mock-uid-default';
      
      if (token.startsWith('mock-token-')) {
        const parts = token.replace('mock-token-', '').split('|');
        email = parts[0] || email;
        name = parts[1] || 'Mock User';
        firebaseUid = `mock-uid-${email}`;
      } else {
        try {
          const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'supersecretgreenstepsindiadevelopmentkey'
          );
          email = decoded.email;
          name = decoded.name || 'Mock User';
          firebaseUid = decoded.firebaseUid || `mock-uid-${email}`;
        } catch (err) {
          email = token.includes('@') ? token : 'guest@greensteps.in';
          firebaseUid = `mock-uid-${email}`;
        }
      }

      const isMock = getIsMockDB();
      if (isMock) {
        let user = mockStore.users.find(u => u.email === email || u.firebaseUid === firebaseUid);
        if (!user) {
          user = {
            _id: `mock-user-${Date.now()}`,
            name,
            email,
            firebaseUid,
            state: 'Delhi',
            city: 'New Delhi',
            carbonScore: 2400,
            greenPoints: 120,
            badges: ['Earth Friend'],
            role: email.includes('admin') ? 'admin' : 'user',
            createdAt: new Date()
          };
          mockStore.users.push(user);
        }
        req.user = user;
      } else {
        let user = await User.findOne({ $or: [{ email }, { firebaseUid }] });
        if (!user) {
          user = new User({
            name,
            email,
            firebaseUid,
            state: 'Delhi',
            city: 'New Delhi',
            carbonScore: 2400,
            greenPoints: 120,
            badges: ['Earth Friend'],
            role: email.includes('admin') ? 'admin' : 'user'
          });
          await user.save();
        }
        req.user = user;
      }
      return next();
    }

    // Live Firebase Token Verification
    if (firebaseInitialized) {
      try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        const { uid, email, name } = decodedToken;

        const isMock = getIsMockDB();
        if (isMock) {
          let user = mockStore.users.find(u => u.firebaseUid === uid);
          if (!user) {
            user = {
              _id: `mock-user-${Date.now()}`,
              name: name || email.split('@')[0],
              email: email,
              firebaseUid: uid,
              state: 'Delhi',
              city: 'New Delhi',
              carbonScore: 2400,
              greenPoints: 120,
              badges: ['Earth Friend'],
              role: email.includes('admin') ? 'admin' : 'user',
              createdAt: new Date()
            };
            mockStore.users.push(user);
          }
          req.user = user;
        } else {
          let user = await User.findOne({ firebaseUid: uid });
          if (!user) {
            user = new User({
              name: name || email.split('@')[0],
              email: email,
              firebaseUid: uid,
              state: 'Delhi',
              city: 'New Delhi',
              carbonScore: 2400,
              greenPoints: 120,
              badges: ['Earth Friend'],
              role: email.includes('admin') ? 'admin' : 'user'
            });
            await user.save();
          }
          req.user = user;
        }
        return next();
      } catch (err) {
        return res.status(401).json({ message: 'Token verification failed', error: err.message });
      }
    }

    return res.status(401).json({ message: 'Authorization verification failed' });
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    res.status(500).json({ message: 'Server authorization error' });
  }
};
