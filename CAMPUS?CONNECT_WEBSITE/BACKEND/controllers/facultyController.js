const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const transporter = require('../mailer.js'); // Import your pre-configured transporter
const User = require('../models/User'); // Import the User model
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000'; // Default to localhost if not set in environment variables
const multer = require('multer');
const path = require('path');

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: './judgephoto', // Define the upload directory
  filename: (req, file, cb) => {
    cb(null, `judgephoto-${Date.now()}${path.extname(file.originalname)}`); // Create a unique filename
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // Limit file size to 1MB
  fileFilter: (req, file, cb) => {
    // Allow only image files
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb('Error: Images Only!'); // Reject non-image files
    }
  }
}).single('judgephoto'); // Expect a file with the field name 'judgephoto'

// Register new user
const userRegister = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err });
    }

    const { name, email, password, mobileNumber, gender, role, department,details} = req.body;

    if (!name || !email || !password || !mobileNumber || !gender || !role || !department) {
      return res.status(400).json({ message: 'Please fill in all required fields.' });
    }

    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists!' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create new user
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        mobileNumber,
        gender,
        role: role || 'student', 
        isVerified: true, 
        department,
        imageUrl: req.file ? req.file.path : null, 
        details,
      });

      await newUser.save();

      // Send email notification to the new user
      const mailOptions = {
        from: process.env.EMAIL_USER, // Access your configured email from the environment variables
        to: email,
        subject: `🎉 Welcome, ${name}! Your Account is Ready`,
        text: `
        Dear ${name},
        We are excited to inform you that your account has been successfully created. 🎉 Now, you can log in and start exploring all the features!

        👉 Email: ${email}
        👉 Password: ${password}

        If you have any questions or need assistance, feel free to reach out. We're here to help and thrilled to have you on board! 🚀✨

        Best Regards,
        Connectors 🎓
        `,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
          return res.status(500).json({ message: 'Error sending confirmation email', error: error.message });
        } else {
          console.log('Email sent:', info.response);
        }
      });

      res.status(201).json({ message: 'User registered successfully!', user: { name, email, role } });
    } catch (error) {
      console.error('Error during user registration:', error);
      res.status(500).json({ message: 'Error registering user', error: error.message });
    }
  });
};
// User login
const userLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials!' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: 'Login successful!', token });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Error during login', error: error.message });
  }
};

// Get all user details
const getUserDetails = async (req, res) => {
  try {
    const users = await User.find(); // Get all users
    if (!users || users.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Error fetching user details', error: error.message });
  }
};

// Update user details
const updateUserDetails = async (req, res) => {
  try {
    const updates = req.body; // Get all fields from request body
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updates, // Apply all updates from the request body
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user details:', error);
    res.status(500).json({ message: 'Error updating user details', error: error.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

// Get faculty by ID
const getfacultyById = async (req, res) => {
  const { facultyId } = req.params;

  try {
    const judge = await User.findById(facultyId);
    if (!judge) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    res.status(200).json(judge);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch faculty",
      error: error.message,
    });
  }
};

module.exports = {
  facultyRegister: userRegister,
  facultyLogin: userLogin,
  getFacultyDetails: getUserDetails,
  updateFacultyDetails: updateUserDetails,
  deleteFaculty: deleteUser,
  getfacultyById,
};
