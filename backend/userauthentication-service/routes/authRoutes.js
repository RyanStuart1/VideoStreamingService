const express = require('express');
const router = express.Router();
const cors = require('cors');
const { auth, registerUser, loginUser, getProfile } = require('../controllers/authController')

const USER_SERVICE_URL = 'http://98.85.96.246:3000';

router.use(
    cors({
      credentials: true,
      origin: USER_SERVICE_URL
    })
)

router.get('/', auth);
router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/profile', getProfile)

module.exports = router