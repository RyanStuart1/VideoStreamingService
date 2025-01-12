const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// Enable CORS so frontend can access this gateway
app.use(cors({
  origin: 'http://98.85.96.246:3004', // Frontend URL
  credentials: true, // Allow cookies if needed
}));

// Middleware for parsing JSON
app.use(express.json());

// Service URLs
const USER_SERVICE_URL = 'http://98.85.96.246:3000';
const VIDEO_SERVICE_URL = 'http://98.85.96.246:3001';
const WATCHLIST_SERVICE_URL = 'http://98.85.96.246:3002';

// Handle errors centrally
const handleError = (error, res, message) => {
  console.error(`${message}:`, error.message);
  console.error('Error details:', error.response?.data || error);
  res.status(error.response?.status || 500).send(error.response?.data || 'Internal Server Error');
};

// Route to fetch users from the User Authentication Service
app.get('/api/users', async (req, res) => {
  try {
    const response = await axios.get(`${USER_SERVICE_URL}/users`);
    res.json(response.data);
  } catch (error) {
    handleError(error, res, 'Error fetching users from userAuthentication-service');
  }
});

// Route to fetch videos from the Video Streaming Service
app.get('/api/videos', async (req, res) => {
  try {
    const response = await axios.get(`${VIDEO_SERVICE_URL}/videos`);
    res.json(response.data);
  } catch (error) {
    handleError(error, res, 'Error fetching videos from videoStreaming-service');
  }
});

// Route to fetch watchlist from the Watchlist Service
app.get('/api/watchlist', async (req, res) => {
  try {
    const response = await axios.get(`${WATCHLIST_SERVICE_URL}/watchlist`);
    res.json(response.data);
  } catch (error) {
    handleError(error, res, 'Error fetching watchlist from watchlist-service');
  }
});

// Start the API Gateway
const PORT = 3003;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
