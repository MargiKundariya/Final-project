const express = require('express');
const { saveWinners, getWinners } = require('../controllers/winnerController');

const router = express.Router();

// Route to save winners
router.post('/', saveWinners);

// Route to get winners
router.get('/', getWinners);

module.exports = router;
