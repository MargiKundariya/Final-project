const express = require('express');
const router = express.Router();
const {
  facultyRegister,
  facultyLogin,
  getFacultyDetails,
  updateFacultyDetails,
  getfacultyById,
  deleteFaculty,
} = require('../controllers/facultyController'); // Importing faculty controller functions

// Route to register a new faculty
router.post('/register', facultyRegister);

// Route to log in an existing faculty
router.post('/login', facultyLogin);

// Route to get all faculty details
router.get('/', getFacultyDetails); // Fetches all faculty details
router.get("/:facultyId", getfacultyById);


// Route to update faculty details by ID
router.put('/:id', updateFacultyDetails);

// Route to delete a faculty by ID
router.delete('/:id', deleteFaculty);

module.exports = router;
