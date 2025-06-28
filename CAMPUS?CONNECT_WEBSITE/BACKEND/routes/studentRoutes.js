const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController'); // Assuming controller is in controllers/studentController.js

// Route to get all students
router.get('/students', studentController.getAllStudents);

// Route to get a student by ID
router.get('/students/:id', studentController.getStudentById);

// Route to edit student details
router.put('/students/:id', studentController.editStudent);

module.exports = router;
