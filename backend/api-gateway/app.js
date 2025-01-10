const express = require('express');
const axios = require('axios');
const app = express();

const cors = require('cors');
app.use(cors());  // Enable CORS so frontend can access this gateway
app.use(express.json());

const USER_SERVICE_URL = 'http://54.174.222.249:3000';
const VIDEO_SERVICE_URL = 'http://54.174.222.249:3001';
const WATCHLIST_SERVICE_URL = 'http://54.174.222.249:3002';

app.get('/api/users', async (req, res) => {
  try {
    const response = await axios.get(`${USER_SERVICE_URL}/users`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching users from userAuthentication-service:', error.message);
    console.error('Error details:', error.response?.data || error);
    res.status(500).send('Error fetching users');
  }
});

app.get('/api/videos', async (req, res) => {
  try {
    const response = await axios.get(`${VIDEO_SERVICE_URL}/videos`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching videos from videoStreaming-service:', error.message);
    console.error('Error details:', error.response?.data || error);
    res.status(500).send('Error fetching videos');
  }
});

app.get('/api/watchlist', async (req, res) => {
  try {
    const response = await axios.get(`${WATCHLIST_SERVICE_URL}/watchlist`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching watchlist from watchlist-service:', error.message);
    console.error('Error details:', error.response?.data || error);
    res.status(500).send('Error fetching watchlist');
  }
});

app.listen(3003, () => {
  console.log('API Gateway running on port 3003');
});