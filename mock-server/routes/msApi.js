const express = require('express');
const router = express.Router();
const apiConfig = require('../projects/ms/config');
const createMockMiddleware = require('../middleware/mockDataMiddleware');

router.use(createMockMiddleware('ms', apiConfig));

module.exports = router; 