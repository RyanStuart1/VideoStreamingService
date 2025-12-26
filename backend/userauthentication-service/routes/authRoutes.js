const express = require('express');
const router = express.Router();
const cors = require('cors');
const { auth, registerUser, loginUser, getProfile } = require('../controllers/authController')

// middleware
router.use(
    cors({
      credentials: true,
      origin: ['http://localhost:3000', 'http://98.85.96.246:3004']
    })
)

router.get('/', auth);
router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/profile', getProfile)

module.exports = router