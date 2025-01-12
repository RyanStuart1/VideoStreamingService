const express = require('express');
const dotenv = require('dotenv').config();
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors'); // Import CORS

const app = express();
const port = 3000;

// Enable CORS for all origins
app.use(cors());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('User DB connected'))
  .catch((err) => console.log('Database not connected', err));

// Define User Schema and Model
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true }, // Assuming the password is stored
});

const User = mongoose.model('User', userSchema, 'UserData'); // 'UserData' is the collection name

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/', require('./routes/authRoutes'));

// Fetch All Users Route
app.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // Exclude the password field
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).send('Error fetching users');
  }
});

// Fetch Profile Route
app.get('/profile', async (req, res) => {
  try {
    const { userId } = req.cookies; // Assume userId is stored in cookies
    if (!userId) {
      return res.status(401).send('Unauthorized: No user logged in');
    }

    const user = await User.findById(userId, '-password'); // Exclude password field
    if (!user) {
      return res.status(404).send('User not found');
    }

    res.json(user);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).send('Error fetching profile');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`User Service running on port ${port}`);
}); 