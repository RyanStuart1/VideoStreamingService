const User = require('../models/user');
const { hashPassword, comparePassword } = require('../helpers/auth');
const jwt = require('jsonwebtoken');

// Simple test endpoint
const auth = (req, res) => {
  res.json('Auth working');
};

// Register Endpoint
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if name was entered
    if (!name) {
      return res.json({ error: 'Name is required' });
    }
    // Check if password was entered
    if (!password || password.length < 6) {
      return res.json({
        error: 'Password is required and should be at least 6 characters long',
      });
    }
    // Check if email already exists
    const exist = await User.findOne({ email });
    if (exist) {
      return res.json({ error: 'Email is already taken' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user in database
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return res.json(user);
  } catch (error) {
    console.log(error);
  }
};

// Login Endpoint
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ error: 'No user found' });
    }

    // Check if password matches
    const match = await comparePassword(password, user.password);
    if (match) {
      jwt.sign(
        { email: user.email, id: user._id, name: user.name },
        process.env.JWT_SECRET,
        {},
        (err, token) => {
          if (err) throw err;
          // Set the token as a cookie
          res.cookie('token', token).json(user);
        }
      );
    } else {
      res.json({ error: 'Passwords do not match' });
    }
  } catch (error) {
    console.log(error);
  }
};

// Get Profile Endpoint
const getProfile = (req, res) => {
  // Use req.cookies (not require.cookies)
  const { token } = req.cookies || {};

  if (!token) {
    return res.status(401).json({ error: 'No token cookie found' });
  }

  jwt.verify(token, process.env.JWT_SECRET, {}, (err, user) => {
    if (err) {
      console.error(err);
      return res.status(403).json({ error: 'Invalid token' });
    }
    res.json(user);
  });
};

module.exports = {
  auth,
  registerUser,
  loginUser,
  getProfile
};
