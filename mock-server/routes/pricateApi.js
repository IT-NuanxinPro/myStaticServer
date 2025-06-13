const express = require('express');
const router = express.Router();
const apiConfig = require('../projects/private/config');
const createMockMiddleware = require('../middleware/mockDataMiddleware');

router.use(createMockMiddleware('xx', apiConfig));

module.exports = router; 