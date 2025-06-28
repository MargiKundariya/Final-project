const mongoose = require('mongoose');

const winnerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  eventName: { type: String, required: true },
  rank: { type: Number, required: true },
  date: { type: String, required: true },
});

const Winner = mongoose.model('Winner', winnerSchema);

module.exports = Winner;
