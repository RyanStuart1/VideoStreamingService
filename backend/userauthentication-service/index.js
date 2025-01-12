const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors'); // Import CORS

const app = express();
const port = 3000;

// Enable CORS for all origins
app.use(cors());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('User DB connected'))
  .catch((err) => console.log('Database not connected', err));

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/', require('./routes/authRoutes'));

// Example route
app.get('/users', (req, res) => {
  res.json(users);
});

// Start the server
app.listen(port, () => {
  console.log(`User Service running on port ${port}`);
});
