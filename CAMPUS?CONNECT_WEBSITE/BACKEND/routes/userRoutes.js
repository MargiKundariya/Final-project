const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER, // Use environment variables for sensitive data
    pass: process.env.EMAIL_PASS,
  },
});

// Helper function to generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Function to create HTML email templates
const createEmailTemplate = (type, otp, name) => {
  const formattedOTP = otp.split('').join(' '); // Space out the OTP digits for readability
  
  if (type === 'verification') {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 5px;">
        <div style="text-align: center; padding: 15px 0; background-color: #4a86e8; color: white; border-radius: 5px 5px 0 0;">
          <h2 style="margin: 0;">Account Verification</h2>
        </div>
        <div style="padding: 20px; background-color: #f9f9f9;">
          <p style="font-size: 16px;">Hello ${name || 'there'},</p>
          <p style="font-size: 16px;">Thank you for registering with Connectors! Please use the verification code below to complete your registration:</p>
          <div style="background-color: #ffffff; padding: 15px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 8px; margin: 20px 0; border: 1px dashed #ccc; border-radius: 5px;">
            ${formattedOTP}
          </div>
          <p style="font-size: 14px; color: #555;">This code is valid for a limited time. Do not share it with anyone for security reasons.</p>
          <p style="font-size: 14px; color: #555;">If you didn't request this, please ignore this message.</p>
        </div>
        <div style="text-align: center; padding: 15px 0; background-color: #f1f1f1; border-radius: 0 0 5px 5px;">
          <p style="margin: 0; font-size: 14px;">Best Regards,</p>
          <p style="margin: 5px 0; font-size: 16px; font-weight: bold;">Connectors 🎓</p>
        </div>
      </div>
    `;
  } else if (type === 'password-reset') {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 5px;">
        <div style="text-align: center; padding: 15px 0; background-color: #ff6b6b; color: white; border-radius: 5px 5px 0 0;">
          <h2 style="margin: 0;">Password Reset</h2>
        </div>
        <div style="padding: 20px; background-color: #f9f9f9;">
          <p style="font-size: 16px;">Hello ${name || 'there'},</p>
          <p style="font-size: 16px;">You have requested to reset your password. Use the code below to proceed:</p>
          <div style="background-color: #ffffff; padding: 15px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 8px; margin: 20px 0; border: 1px dashed #ccc; border-radius: 5px;">
            ${formattedOTP}
          </div>
          <p style="font-size: 14px; color: #555;">For security reasons, do not share this code with anyone. It is valid for a limited time.</p>
          <p style="font-size: 14px; color: #555;">If you did not request a password reset, please ignore this message.</p>
        </div>
        <div style="text-align: center; padding: 15px 0; background-color: #f1f1f1; border-radius: 0 0 5px 5px;">
          <p style="margin: 0; font-size: 14px;">Best Regards,</p>
          <p style="margin: 5px 0; font-size: 16px; font-weight: bold;">Connectors 🎓</p>
        </div>
      </div>
    `;
  }
};

// Login route (unchanged)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'All fields are required!' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials or role' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials or role' });
    }

    req.session.email = user.email;
    req.session.name = user.name;
    req.session.role = user.role;
    req.session._id = user._id;

    res.status(200).json({ role: user.role, message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Register route
router.post('/register', async (req, res) => {
  console.log('Incoming registration request:', req.body);
  const { name, email, password, mobileNumber, gender, id, division, role } = req.body;

  if (!name || !email || !password || !mobileNumber || !gender || !id || !division) {
    console.error('Validation failed: Missing fields');
    return res.status(400).json({ message: 'All fields are required!' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.error('Validation failed: Email already in use');
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      mobileNumber,
      gender,
      id,
      division,
      role: role || 'student',
      otp,
      isVerified: false,
    });

    await newUser.save();
    console.log('User registered:', newUser);

    const htmlContent = createEmailTemplate('verification', otp, name);
    
    const mailOptions = {
      from: {
        name: 'Connectors Team',
        address: process.env.EMAIL_USER
      },
      to: newUser.email,
      subject: '🔐 Secure Your Access – OTP Inside!',
      html: htmlContent,
      text: `Hello,
        Your One-Time Password (OTP) for verification is: ${otp} 
        This code is valid for a limited time, so please use it promptly to complete your process. Do not share it with anyone for security reasons.
        If you didn't request this, please ignore this message.
        Best Regards,
        Connectors 🎓`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending OTP:', error);
        return res.status(500).json({ message: 'Error sending OTP' });
      }
      console.log('OTP sent:', info.response);
      res.status(200).json({ message: 'User registered! Please verify your email with the OTP sent.' });
    });
  } catch (error) {
    console.error('Server error during registration:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// OTP verification route (unchanged)
router.post('/verify-otp', async (req, res) => {
  console.log('Incoming OTP verification request:', req.body);
  const { email, otp } = req.body;

  if (!email || !otp) {
    console.error('Validation failed: Missing email or OTP');
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.error('Validation failed: User not found');
      return res.status(400).json({ message: 'User not found' });
    }

    if (user.otp !== otp) {
      console.error('Validation failed: Invalid OTP');
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    user.isVerified = true;
    user.otp = null;
    await user.save();
    console.log('Email verified:', user.email);
    res.status(200).json({ message: 'Email verified!' });
  } catch (error) {
    console.error('Server error during OTP verification:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout route (unchanged)
router.post('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).json({ message: 'Error logging out' });
      }
      res.clearCookie('connect.sid'); // Clear session cookie
      res.status(200).json({ message: 'Logout successful' });
    });
  } else {
    res.status(400).json({ message: 'No active session to log out' });
  }
});

// Forgot Password route
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const otp = generateOTP(); // Generate OTP
    user.otp = otp; // Save OTP to user for verification
    await user.save();

    const htmlContent = createEmailTemplate('password-reset', otp, user.name);

    const mailOptions = {
      from: {
        name: 'Connectors Team',
        address: process.env.EMAIL_USER
      },
      to: user.email,
      subject: '🔐 Password Reset OTP',
      html: htmlContent,
      text: `Hello,
      You have requested to reset your password. Use the OTP below to proceed:
      🔑 Your OTP: ${otp}
      For security reasons, do not share this code with anyone. It is valid for a limited time.
      If you did not request a password reset, please ignore this message.
      Best Regards,
      Connectors 🎓`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending OTP:', error);
        return res.status(500).json({ message: 'Error sending OTP' });
      }
      console.log('OTP sent:', info.response);
      res.status(200).json({ message: 'OTP sent to your email for password reset' });
    });
  } catch (error) {
    console.error('Server error during forgot-password:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
// Reset Password after OTP verification (no old password required)
router.post('/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ message: 'Email and new password are required' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.otp = null; // clear OTP after use
    await user.save();

    res.status(200).json({ message: 'Password reset successfully!' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
// Change Password from profile/settings (requires old password)
router.post('/change-password', async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  if (!email || !oldPassword || !newPassword) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Old password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Endpoint to get session data (unchanged)
router.get('/session', (req, res) => {
  if (req.session && req.session.email && req.session.role) {
    // Send the stored session data (email, role, and name)
    return res.status(200).json({
      email: req.session.email,
      name: req.session.name,
      role: req.session.role,
      _id: req.session._id,
    });
  } else {
    return res.status(401).json({ message: 'No session data found' });
  }
});

module.exports = router;