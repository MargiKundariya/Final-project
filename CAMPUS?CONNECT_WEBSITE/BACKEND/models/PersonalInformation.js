const mongoose = require("mongoose");

const PersonalInformationSchema = new mongoose.Schema({
  id: String,
  name: String,
  class: String,
  role: String,
  address: String,
  bloodGroup: String,
  contact: String,
  dob: Date,
  email: String,
  imageUrl: String, // New field for storing image URL
});

module.exports = mongoose.model("PersonalInformation", PersonalInformationSchema);
