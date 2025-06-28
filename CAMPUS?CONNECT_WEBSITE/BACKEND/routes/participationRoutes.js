const express = require('express');
const {
  getAllParticipation,
  getpresentParticipation,
  add,
  addParticipation,
  deleteParticipation,
  updateAttendance,
  removeAbsentStudents,
  updateMarks,
  handleTeamMemberResponse,
  getPendingParticipations,
  getUserParticipations,
  getPendingNotificationsCount,

} = require('../controllers/participationController');
const Participation =require('../models/participation');

const router = express.Router();

// Routes
router.get('/', getAllParticipation); // Get all participation records
router.get('/present', getpresentParticipation); 
router.get('/user',getUserParticipations);// Get all participation records
router.get('/notifications/count', getPendingNotificationsCount);
router.post('/save-participation', async (req, res) => {
  const participationData = req.body;

  // Validate the data structure
  if (!Array.isArray(participationData) || participationData.length === 0) {
    return res.status(400).json({ message: 'Invalid data format' });
  }

  try {
    // Create an array of participation records
    const participationRecords = participationData.map(data => ({
      name: data.name || null, // If no data, set null
      department: data.department || null, // If no data, set null
      year: data.year || null, // If no data, set null
      eventName: data.eventName || null, // If no data, set null
      contactNumber: data.contactNumber || null, // If no data, set null
      date: data.date || null, // If no data, set null
      team_name: data.team_name || null, // If no data, set null
      // Add any other necessary fields
    }));

    // Save the records to the database
    await Participation.insertMany(participationRecords);

    res.status(200).json({ message: 'Participation data saved successfully' });
  } catch (error) {
    console.error('Error saving participation data:', error.message);
    res.status(500).json({ message: 'Error saving participation data' });
  }
});
router.post('/addsingle', add); // Add a new participation record
router.post('/add', addParticipation); // Add a new participation record


router.put('/:id/marks', updateMarks); // Update marks for a participation record
router.post('/response', handleTeamMemberResponse); // Handle team member response (accept/reject)
router.get('/pending', getPendingParticipations); // Get pending participations for a team member
router.put('/:id/attendance', updateAttendance); // Update attendance for a participation record
router.delete('/remove-absent', removeAbsentStudents); // Remove absent participation records
router.delete('/:id', deleteParticipation); // Delete a participation record by ID

module.exports = router;





