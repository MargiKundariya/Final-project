const Winner = require('../models/winnerModel');

// Save winners to the database
exports.saveWinners = async (req, res) => {
  try {
    const winners = req.body;
    await Winner.insertMany(winners);
    res.json({ message: 'Winners stored successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get winners from the database
exports.getWinners = async (req, res) => {
  try {
    const winners = await Winner.find().sort({ rank: 1 }); // Sort by rank (1st, 2nd, 3rd)
    res.json(winners);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
