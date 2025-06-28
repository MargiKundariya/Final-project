const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  gender: { type: String, required: true },
  id: { type: String },
  division: { type: String },
  department: { type: String },
  role: { type: String, default: "student" }, // Role: 'student', 'judge', or 'admin'
  assignedEvents: [{ type: String }], // Array of event names for judges
  otp: { type: String },
  isVerified: { type: Boolean, default: false },
  imageUrl: { type: String }, // URL for profile image
  details: { type: String }, // URL for additional image (ID card, certificate, etc.)
});

// Avoid overwriting the model if it already exists
const User = mongoose.models.User || mongoose.model("User", userSchema);

module.exports = User;
