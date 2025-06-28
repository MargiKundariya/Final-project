const mongoose = require("mongoose");

// Define the schema for an ID Card
const idCardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  eventName: {
    type: String,
    required: true,
  },
  year: {
    type: String,
    required: true,
  },
  filePath: {
    type: String,
    required: true, // Path to the generated ID card image
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically stores the date when the card was created
  },
});

// Create the model
const IDCard = mongoose.model("IDCard", idCardSchema);

module.exports = IDCard;
