const express = require('express');
const axios = require('axios');
const cors = require('cors');
const http = require('http'); // Required to create an HTTP server
const WebSocket = require('ws'); // WebSocket library

const app = express();

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json());

// Service URLs from environment variables (fallback to localhost)
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://98.85.96.246:3000';
const VIDEO_SERVICE_URL = process.env.VIDEO_SERVICE_URL || 'http://98.85.96.246:3001';
const WATCHLIST_SERVICE_URL = process.env.WATCHLIST_SERVICE_URL || 'http://98.85.96.246:3002';

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

// Create HTTP server and WebSocket server
const server = http.createServer(app);

// WebSocket server listening on the same server
const wss = new WebSocket.Server({ server, path: '/ws' });

wss.on('connection', (ws) => {
  console.log('New WebSocket connection established');

  // Handle incoming messages
  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);
    ws.send(`Echo: ${message}`); // Echo the message back to the client
  });

  // Handle WebSocket disconnection
  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });

  // Send a welcome message when the client connects
  ws.send('Welcome to the WebSocket server!');
});

// Start server explicitly on port 3000
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`HTTP and WebSocket server running on http://98.85.96.246:${PORT}`);
});
