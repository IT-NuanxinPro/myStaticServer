const express = require('express');
const router = express.Router();
const apiConfig = require('../projects/intelligent-penetration/config');
const createMockMiddleware = require('../middleware/mockDataMiddleware');

router.use(createMockMiddleware('intelligent-penetration', apiConfig));

module.exports = router; 