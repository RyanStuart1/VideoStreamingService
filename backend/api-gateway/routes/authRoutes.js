const express = require('express');
const router = express.Router();
const cors = require('cors');

const USER_SERVICE_URL = 'http://localhost:3000';

router.use(
    cors({
      credentials: true,
      origin: USER_SERVICE_URL
    })
)

router.get('/', async (req, res) => {

});

module.exports = router