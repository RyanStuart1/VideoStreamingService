const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const User = require('./models/user'); // use your existing model

const app = express();
const port = process.env.PORT || 4000;

// CORS (keep EC2 origin for portfolio, allow local dev too)
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://98.85.96.246:3004'],
    credentials: true,
  })
);

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('User DB connected'))
  .catch((err) => console.log('Database not connected', err));

// Auth routes (/, /register, /login, /profile)
app.use('/', require('./routes/authRoutes'));

// Fetch All Users Route (used by API gateway /users)
app.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // exclude password
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Error fetching users' });
  }
});

app.listen(port, () => {
  console.log(`User Service running on port ${port}`);
});
