const mongoose = require("mongoose");

const InvitationSchema = new mongoose.Schema({
  judgeName: { type: String, required: true },
  eventName: { type: String, required: true },
  eventDate: { type: String, required: true },
  eventTime: { type: String, required: true },
  invitationImage: { type: String, required: true }, // Store image URL
});

module.exports = mongoose.model("Invitation", InvitationSchema);
