require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { connectDB } = require('./config/db');

// Route Imports
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const activityRoutes = require('./routes/activities');
const carbonRoutes = require('./routes/carbon');
const challengeRoutes = require('./routes/challenges');
const leaderboardRoutes = require('./routes/leaderboard');
const adminRoutes = require('./routes/admin');

// Initialize App
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database (falls back to mock store if unconfigured)
connectDB();

// Middlewares
app.use(helmet({
  contentSecurityPolicy: false // Allow Leaflet and other resources in development
}));
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Default root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the GreenSteps India REST API. All endpoints are accessible under /api/v1.',
    status: 'online',
    health: 'Check /health for system status'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {

  res.json({
    status: 'healthy',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/activities', activityRoutes);
app.use('/api/v1/carbon', carbonRoutes);
app.use('/api/v1/challenges', challengeRoutes);
app.use('/api/v1/leaderboard', leaderboardRoutes);
app.use('/api/v1/admin', adminRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong on the server',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 GreenSteps India Backend running on port ${PORT}`);
  console.log(`📡 API URL: http://localhost:${PORT}/api/v1`);
});

module.exports = app; // export for testing
