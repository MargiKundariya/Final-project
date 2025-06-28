const mongoose = require("mongoose");

const CertificateSchema = new mongoose.Schema({
  recipientName: { type: String, required: true },
  courseTitle: { type: String, required: true },
  date: { type: Date, required: true },
  imageUrl: { type: String, required: true },
  rank:{type:Number,default: 0}, // URL to the stored image
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Certificate", CertificateSchema);
