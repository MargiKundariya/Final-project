function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000).toString(); // Generate a 4-digit numeric OTP
}

module.exports = { generateOTP };
