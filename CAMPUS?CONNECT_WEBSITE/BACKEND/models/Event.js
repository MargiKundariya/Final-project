const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  venue: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  description: { type: String, required: true },
  participationType:{type:String , required:true},
  criteria: [{ type: String, required: true }],
  attachments: { type: String }, // URL or file path to the attachment
  scanner: { type: String },    // Path for the scanner image
  coordinators: [{ type:String  }], // Faculty references
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
