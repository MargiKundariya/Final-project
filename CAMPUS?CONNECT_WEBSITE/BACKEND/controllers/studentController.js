const User = require('../models/User'); // Assuming the model is in models/User.js

// Get all students
const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }); // Only fetching students
    res.status(200).json(students);
  } catch (error) {
    console.error('Error fetching students:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get student by ID
const getStudentById = async (req, res) => {
  const { id } = req.params;

  try {
    const student = await User.findById(id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json(student);
  } catch (error) {
    console.error('Error fetching student by ID:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Edit student details
const editStudent = async (req, res) => {
  const { id } = req.params;
  const { name, email, mobileNumber, gender, division, department, role } = req.body;

  try {
    const updatedStudent = await User.findByIdAndUpdate(
      id,
      { name, email, mobileNumber, gender, division, department, role },
      { new: true } // Return the updated document
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json(updatedStudent);
  } catch (error) {
    console.error('Error updating student:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllStudents,
  getStudentById,
  editStudent
};
