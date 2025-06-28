const Participation = require('../models/participation');
const transporter = require('../mailer'); // Import mailer
const User = require('../models/User');
// Utility function to send email notification
const sendNotification = async (email, eventName, message) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Notification for Event: ${eventName}`,
    text: message,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Notification sent to ${email} for event: ${eventName}`);
  } catch (error) {
    console.error(`Error sending notification to ${email}:`, error.message);
  }
};

// Get all participation records with optional filtering by event names
const getAllParticipation = async (req, res) => {
  try {
    const { eventNames } = req.query;
    const filter = eventNames
      ? { eventName: { $in: eventNames.split(',') } }
      : {};
    const records = await Participation.find(filter);

    if (!records.length) {
      return res.status(404).json({ message: 'No participation records found' });
    }

    res.status(200).json(records);
  } catch (error) {
    console.error('Error fetching participation records:', error.message);
    res.status(500).json({ message: 'Error fetching participation records' });
  }
};
const getpresentParticipation = async (req, res) => {
  try {
    const { eventNames } = req.query;
    const filter = eventNames
      ? { eventName: { $in: eventNames.split(',') },attendance: true  }
      : {};
    const records = await Participation.find(filter);

    if (!records.length) {
      return res.status(404).json({ message: 'No participation records found' });
    }

    res.status(200).json(records);
  } catch (error) {
    console.error('Error fetching participation records:', error.message);
    res.status(500).json({ message: 'Error fetching participation records' });
  }
};

const add = async (req, res) => {
  const { name, department, year, eventName, contactNumber, date, facultyId } = req.body;

  if (!name || !department || !year || !eventName || !date) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  try {
    const newRecord = new Participation({
      name,
      department,
      year,
      eventName,
      contactNumber,
      date,
      facultyId,
    });

    await newRecord.save();


    res.status(201).json({ message: 'Participation record added successfully', record: newRecord });
  } catch (error) {
    console.error('Error adding participation record:', error.message);
    res.status(500).json({ message: 'Error adding participation record' });
  }
};

// Add a new participation record
const addParticipation = async (req, res) => {
  const { name, email, department, year, eventName, contactNumber, team_name, date, team_members, facultyId } = req.body;

  if (!name || !department || !year || !eventName || !date) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (!Array.isArray(team_members) || team_members.some((m) => !m.name || !m.email)) {
    return res.status(400).json({ message: 'Each team member must have a name and email' });
  }

  try {
    const newRecord = new Participation({
      name,
      email,
      department,
      year,
      eventName,
      contactNumber,
      team_name,
      date,
      team_members: team_members.map((member) => ({
        ...member,
        status: 'pending',
      })),
      facultyId,
    });

    await newRecord.save();

    // Notify team members
    await Promise.all(
      team_members.map((member) =>
        sendNotification(
          member.email,
          eventName,
          `You've been selected to join the team for ${eventName}! 🎉 We’re excited to have you on board! Please confirm your participation and get ready for an amazing experience. 🚀🔥`
        )
      )
    );

    res.status(201).json({ message: 'Participation record added successfully', record: newRecord });
  } catch (error) {
    console.error('Error adding participation record:', error.message);
    res.status(500).json({ message: 'Error adding participation record' });
  }
};

// Handle team member response
const handleTeamMemberResponse = async (req, res) => {
  const { participationId, email, status } = req.body;

  if (!['accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status. Must be "accepted" or "rejected".' });
  }

  try {
    const participation = await Participation.findById(participationId);

    if (!participation) {
      return res.status(404).json({ message: 'Participation record not found' });
    }

    const teamMember = participation.team_members.find((member) => member.email === email);

    if (!teamMember) {
      return res.status(404).json({ message: 'Team member not found' });
    }

    if (teamMember.status !== 'pending') {
      return res.status(400).json({ message: 'You have already responded' });
    }

    teamMember.status = status;

    if (status === 'accepted') {
      participation.status =
        participation.team_members.every((m) => m.status === 'accepted') ? 'confirmed' : participation.status;
    }

    await participation.save();

    // Send notification to the team member
    await sendNotification(
      email,
      participation.eventName,
      status === 'accepted'
        ? `🎉 Thank you for confirming your participation in ${participation.eventName}!We can't wait to see you in action. Get ready for an amazing experience! 🚀🔥`
        : `You have declined participation in ${participation.eventName} ❌😔.We respect your decision and appreciate your time. Wishing you the best in your endeavors! 🌟🚀`
    );

    // Notify the person who added the team members (using participation.email)
    if (participation.email) {
      await sendNotification(
        participation.email,
        participation.eventName,
        `📢 Update! The team member ${email} has ${status} their invitation for ${participation.eventName}.Stay tuned for more updates! 🚀🎉`
      );
    }

    res.status(200).json({ message: `Your response has been recorded as ${status}` });
  } catch (error) {
    console.error('Error handling team member response:', error.message);
    res.status(500).json({ message: 'Error handling response' });
  }
};


// Get pending participations for a team member
const getPendingParticipations = async (req, res) => {
  const { email } = req.query;

  try {
    const records = await Participation.find({
      'team_members.email': email,
      'team_members.status': 'pending',
    });

    if (!records.length) {
      return res.status(404).json({ message: 'No pending participations found' });
    }

    res.status(200).json(records);
  } catch (error) {
    console.error('Error fetching pending participations:', error.message);
    res.status(500).json({ message: 'Error fetching pending participations' });
  }
};
// Delete a participation record
const deleteParticipation = async (req, res) => {
  try {
    const deletedRecord = await Participation.findByIdAndDelete(req.params.id);

    if (!deletedRecord) {
      return res.status(404).json({ message: 'Participation record not found' });
    }

    res.status(200).json({ message: 'Participation record deleted successfully' });
  } catch (error) {
    console.error('Error deleting participation record:', error.message);
    res.status(500).json({ message: 'Error deleting participation record' });
  }
};

// Update attendance for a participation record
const updateAttendance = async (req, res) => {
  const { attendance } = req.body;

  if (typeof attendance !== 'boolean') {
    return res.status(400).json({ message: 'Attendance must be a boolean value' });
  }

  try {
    const updatedRecord = await Participation.findByIdAndUpdate(
      req.params.id,
      { attendance },
      { new: true }
    );

    if (!updatedRecord) {
      return res.status(404).json({ message: 'Participation record not found' });
    }

    res.status(200).json({ message: 'Attendance updated successfully', record: updatedRecord });
  } catch (error) {
    console.error('Error updating attendance:', error.message);
    res.status(500).json({ message: 'Error updating attendance' });
  }
};

// Remove absent participation records
const removeAbsentStudents = async (req, res) => {
  try {
    const result = await Participation.deleteMany({ attendance: false });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'No absent students to remove' });
    }

    res.status(200).json({
      message: 'Absent students removed successfully',
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Error removing absent students:', error.message);
    res.status(500).json({ message: 'Error removing absent students' });
  }
};

// Update marks for a participation record
const updateMarks = async (req, res) => {
  const { marks } = req.body;

  if (typeof marks !== 'number' || marks < 0) {
    return res.status(400).json({ message: 'Marks must be a positive number' });
  }

  try {
    const updatedRecord = await Participation.findByIdAndUpdate(
      req.params.id,
      { marks },
      { new: true }
    );

    if (!updatedRecord) {
      return res.status(404).json({ message: 'Participation record not found' });
    }

    res.status(200).json({ message: 'Marks updated successfully', record: updatedRecord });
  } catch (error) {
    console.error('Error updating marks:', error.message);
    res.status(500).json({ message: 'Error updating marks' });
  }
};
const getUserParticipations = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) {
      return res.status(400).json({ success: false, message: "Student name is required" });
    }

    console.log("Fetching participations for:", name);

    const participations = await Participation.find({
      $or: [
        { name: { $regex: new RegExp(name, "i") } },
        { "team_members.name": { $regex: new RegExp(name, "i") } }
      ]
    });

    console.log("Found participations:", participations);

    const updatedParticipations = participations.map((participation) => {
      let status = "solo"; 
      let participantName = participation.name;

      const teamMembers = participation.team_members || [];

      const teamMember = teamMembers.find(
        (member) => member?.name && new RegExp(name, "i").test(member.name)
      );

      if (teamMember) {
        participantName = participation.name; 
        status = teamMember.status || "solo"; 
      }

      return {
        ...participation.toObject(),
        name: participantName, 
        status, 
        date: participation.date || null,  
      };
    });

    res.status(200).json({
      success: true,
      totalParticipations: updatedParticipations.length,
      participations: updatedParticipations,
    });
  } catch (error) {
    console.error("Error fetching participations:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// pending Notifications
const getPendingNotificationsCount = async (req, res) => {
  const { email } = req.query;
  console.log('Received email for notification count:', email);

  try {
    const count = await Participation.countDocuments({
      'team_members.email': email,
      'team_members.status': 'pending',
    });

    console.log('Pending notifications count:', count);
    res.status(200).json({ count });
  } catch (error) {
    console.error('Error fetching pending notifications count:', error.message);
    res.status(500).json({ message: 'Error fetching pending notifications count' });
  }
};


module.exports = {
  getAllParticipation,
  getpresentParticipation,
  add,
  addParticipation,
  handleTeamMemberResponse,
  getPendingParticipations,
  deleteParticipation,
  updateAttendance,
  getUserParticipations,
  removeAbsentStudents,
  updateMarks,
  getPendingNotificationsCount,
};