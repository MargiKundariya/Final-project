const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
  name: {
    type: String,
    required: true, // Ensure the name is required
  },
});

const participationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email:{
    type: String,
  },
  department: {
    type: String,
    required: true,
  },
  year: {
    type: String,
    required: true,
  },
  contactNumber: {
    type: String,
  },
  team_name:{
    type:String,
  },
  eventName: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  attendance: {
    type: Boolean,
    default: false,
  },
  marks: {
    type: Number,
    default: 0,
  },
  team_members: {
    type: [teamMemberSchema],
    default: [],
  },
});

module.exports = mongoose.model('Participation', participationSchema);
