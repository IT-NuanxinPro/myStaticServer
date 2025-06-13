const express = require('express');
const router = express.Router();
const apiConfig = require('../projects/custBook/config');
const createMockMiddleware = require('../middleware/mockDataMiddleware');

router.use(createMockMiddleware('custBook', apiConfig));

module.exports = router; 