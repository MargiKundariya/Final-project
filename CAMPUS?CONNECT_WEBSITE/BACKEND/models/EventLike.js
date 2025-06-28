const mongoose = require('mongoose');

const EventLikeSchema = new mongoose.Schema({
  eventId: { type: String, required: true },
  userEmail: { type: String, required: true },
  liked: { type: Boolean, default: false },
});

module.exports = mongoose.model('EventLike', EventLikeSchema);
