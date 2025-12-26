const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://98.85.96.246:3004'],
  credentials: true,
}));
app.use(express.json());

// LOCAL-FIRST defaults (EC2 can be used by setting env vars)
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://userauthentication-service:4000";
const VIDEO_SERVICE_URL = process.env.VIDEO_SERVICE_URL || "http://videostreaming-service:3001";
const WATCHLIST_SERVICE_URL = process.env.WATCHLIST_SERVICE_URL || "http://watchlist-service:3002";

// --------- Routes ---------

app.get('/api/users', async (req, res) => {
  try {
    const response = await axios.get(`${USER_SERVICE_URL}/users`);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error fetching users:', error.message);
    return res.status(error.response?.status || 500).json({
      error: 'Failed to fetch users',
      details: error.response?.data || error.message,
    });
  }
});

app.get('/api/profile', async (req, res) => {
  try {
    const response = await axios.get(`${USER_SERVICE_URL}/profile`, {
      headers: { cookie: req.headers.cookie || '' },
      withCredentials: true,
      validateStatus: () => true,
    });

    const setCookie = response.headers['set-cookie'];
    if (setCookie) res.setHeader('set-cookie', setCookie);

    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error fetching profile:', error.message);
    return res.status(error.response?.status || 500).json({
      error: 'Failed to fetch profile',
      details: error.response?.data || error.message,
    });
  }
});

app.get('/api/videos', async (req, res) => {
  try {
    const response = await axios.get(`${VIDEO_SERVICE_URL}/videos`);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error fetching videos:', error.message);
    return res.status(error.response?.status || 500).json({
      error: 'Failed to fetch videos',
      details: error.response?.data || error.message,
    });
  }
});

app.get('/api/watchlist', async (req, res) => {
  try {
    const response = await axios.get(`${WATCHLIST_SERVICE_URL}/watchlist`);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error fetching watchlist:', error.message);
    return res.status(error.response?.status || 500).json({
      error: 'Failed to fetch watchlist',
      details: error.response?.data || error.message,
    });
  }
});

// Auth routes (forward cookies properly)
app.post('/api/register', async (req, res) => {
  try {
    const response = await axios.post(`${USER_SERVICE_URL}/register`, req.body, {
      headers: { cookie: req.headers.cookie || '' },
      withCredentials: true,
      validateStatus: () => true,
    });

    const setCookie = response.headers['set-cookie'];
    if (setCookie) res.setHeader('set-cookie', setCookie);

    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Gateway register error:', error.message);
    return res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const response = await axios.post(`${USER_SERVICE_URL}/login`, req.body, {
      headers: { cookie: req.headers.cookie || '' },
      withCredentials: true,
      validateStatus: () => true,
    });

    const setCookie = response.headers['set-cookie'];
    if (setCookie) res.setHeader('set-cookie', setCookie);

    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Gateway login error:', error.message);
    return res.status(500).json({ error: 'Login failed' });
  }
});

app.post("/api/logout", async (req, res) => {
  try {
    // 1) Ask user service to clear its cookie too (best if it sets attributes)
    const response = await axios.post(`${USER_SERVICE_URL}/logout`, null, {
      headers: { cookie: req.headers.cookie || "" },
      withCredentials: true,
      validateStatus: () => true,
    });

    // Forward any Set-Cookie (expired token) from user service
    const setCookie = response.headers["set-cookie"];
    if (setCookie) res.setHeader("set-cookie", setCookie);
  } catch (e) {
    // If user service doesn't have /logout yet, we still clear locally below
    console.warn("User service logout not available, clearing cookie at gateway only");
  }

  // 2) Clear cookie at gateway as well (must match cookie options)
  res.clearCookie("token", {
    path: "/",        
    httpOnly: true,
    sameSite: "lax",
    secure: false,
  });

  // Optional: clear common alternate names just in case
  res.clearCookie("jwt", { path: "/", httpOnly: true, sameSite: "lax" });
  res.clearCookie("access_token", { path: "/", httpOnly: true, sameSite: "lax" });

  return res.json({ message: "Logged out" });
});


// Start server
const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log('USER_SERVICE_URL:', USER_SERVICE_URL);
  console.log('VIDEO_SERVICE_URL:', VIDEO_SERVICE_URL);
  console.log('WATCHLIST_SERVICE_URL:', WATCHLIST_SERVICE_URL);
});
