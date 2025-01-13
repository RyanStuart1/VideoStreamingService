const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());  // Enable CORS
app.use(express.json());

// Service URLs from environment variables (fallback to localhost)
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3000';
const VIDEO_SERVICE_URL = process.env.VIDEO_SERVICE_URL || 'http://localhost:3001';
const WATCHLIST_SERVICE_URL = process.env.WATCHLIST_SERVICE_URL || 'http://localhost:3002';

// Routes
app.get('/api/users', async (req, res) => {
  try {
    const response = await axios.get(`${USER_SERVICE_URL}/users`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch users',
      details: error.response?.data || error.message,
    });
  }
});

app.get('/api/profile', async (req, res) => {
  try {
    const response = await axios.get(`${USER_SERVICE_URL}/profile`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching profile:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch profile',
      details: error.response?.data || error.message,
    });
  }
});

app.get('/api/videos', async (req, res) => {
  try {
    const response = await axios.get(`${VIDEO_SERVICE_URL}/videos`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching videos:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch videos',
      details: error.response?.data || error.message,
    });
  }
});

app.get('/api/watchlist', async (req, res) => {
  try {
    const response = await axios.get(`${WATCHLIST_SERVICE_URL}/watchlist`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching watchlist:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch watchlist',
      details: error.response?.data || error.message,
    });
  }
});

// Start server
const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
