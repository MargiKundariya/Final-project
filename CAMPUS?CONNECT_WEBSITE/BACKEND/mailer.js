const nodemailer = require('nodemailer');
require ('dotenv').config(); // Ensure this line is present to load environment variables

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  service: 'Gmail', // e.g., 'Gmail', 'Yahoo', 'Outlook'
  auth: {
    user: process.env.EMAIL_USER, // Access environment variable
    pass: process.env.EMAIL_PASS,  // Access environment variable
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error with mailer configuration:', error);
  } else {
    console.log('Mailer configured successfully:', success);
  }
});

module.exports = transporter;
