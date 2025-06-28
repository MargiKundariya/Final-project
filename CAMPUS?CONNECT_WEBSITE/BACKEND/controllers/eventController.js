const mongoose = require("mongoose");
const Event = require("../models/Event");
const User = require("../models/User");
const Participation = require("../models/participation");
const multer = require("multer");
const path = require("path");
const transporter = require('../mailer.js'); // Import your pre-configured transporter
const sendEmailNotification = require('../sendEmailNotification.js');
// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const destinationPath = file.fieldname === "scanner" ? "scanner_uploads/" : "uploads/";
    cb(null, destinationPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedExtensions = /jpeg|jpg|png|pdf/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only images and PDF files are allowed."));
    }
  },
}).fields([
  { name: "attachments", maxCount: 1 },
  { name: "scanner", maxCount: 1 },
]);

// Helper to handle file uploads
const handleFileUploads = (req) => {
  const fileData = {};
  if (req.files?.attachments) {
    fileData.attachments = `/uploads/${req.files.attachments[0].filename}`;
  }
  if (req.files?.scanner) {
    fileData.scanner = `/scanner_uploads/${req.files.scanner[0].filename}`;
  }
  return fileData;
};


// Fetch Faculty Names
const getFacultyNames = async (req, res) => {
  try {
    const facultyNames = await User.find({ role: "faculty" }, { name: 1, _id: 0 });
    res.status(200).json({ success: true, facultyNames });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching faculty names", error: error.message });
  }
};

// Add Event
const addEvent = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: "File upload error", error: err.message });
    }

    const { name, date, venue, startTime, endTime, description, participationType, criteria, coordinators } = req.body;

    if (!name || !date || !venue || !startTime || !endTime || !description || !participationType || !criteria || !coordinators) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const coordinatorArray = Array.isArray(coordinators) ? coordinators : [coordinators];
    const criteriaArray = Array.isArray(criteria) ? criteria : criteria.split(',');
    const fileData = handleFileUploads(req);

    try {
      // Create the new event
      const newEvent = new Event({
        name,
        date,
        venue,
        startTime,
        endTime,
        description,
        participationType,
        criteria: criteriaArray,
        coordinators: coordinatorArray,
        attachments: fileData.attachments,
        scanner: fileData.scanner,
      });

      await newEvent.save();

      // Find coordinator emails and send notifications
      for (const coordinatorName of coordinatorArray) {
        const user = await User.findOne({ name: coordinatorName, role: "faculty" });

        if (user && user.email) {
          await sendCoordinatorEmail(user.email, name);

        }
      }

      res.status(201).json({ success: true, message: "Event added successfully", event: newEvent });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error adding event", error: error.message });
    }
  });
};

// Function to send an email notification
  const sendCoordinatorEmail = async (email, eventName) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "📢 Coordinator Assignment Notification 🎯",
    text: `Exciting News! You have been assigned as a coordinator for an upcoming event. 🎉
    Get ready to take the lead and make ${eventName} a huge success! Your role is crucial in ensuring everything runs smoothly.
    Stay tuned for more details, and let’s make this an unforgettable experience! 🚀✨
    Best Regards,
    Connectors 🎓`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${email}`);
  } catch (error) {
    console.error(`Error sending email to ${email}:`, error);
  }
};
// Get All Events
const getEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching events", error: error.message });
  }
};

// Get Event by ID
const getEventById = async (req, res) => {
  const { id } = req.params;

  try {
    let event;

    // Check if the `id` is a valid MongoDB ObjectId
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);

    if (isObjectId) {
      // If valid ObjectId, search by ID
      event = await Event.findById(id);
    } else {
      // Otherwise, search by name
      event = await Event.findOne({ name: id });
    }

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    res.status(200).json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching event", error: error.message });
  }
};

// Update Event
const updateEvent = async (req, res) => {
  try {
    const { name, date, venue, coordinators } = req.body;
    const eventId = req.params.id;

    const existingEvent = await Event.findById(eventId);
    if (!existingEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Identify added and removed coordinators
    const oldCoordinators = existingEvent.coordinators || [];
    const addedCoordinators = coordinators.filter(c => !oldCoordinators.includes(c));
    const removedCoordinators = oldCoordinators.filter(c => !coordinators.includes(c));

    console.log("Added Coordinators:", addedCoordinators);
    console.log("Removed Coordinators:", removedCoordinators);

    // Send emails
    for (const coordinatorName of addedCoordinators) {
      const user = await User.findOne({ name: coordinatorName, role: "faculty" });
      if (user?.email) {
        console.log(`📧 Sending email to added coordinator: ${user.email}`);
        await sendEmailNotification(user.email, name, "added");
      }
    }

    for (const coordinatorName of removedCoordinators) {
      const user = await User.findOne({ name: coordinatorName, role: "faculty" });
      if (user?.email) {
        console.log(`📧 Sending email to removed coordinator: ${user.email}`);
        await sendEmailNotification(user.email, name, "removed");
      }
    }

    // Update event
    existingEvent.name = name;
    existingEvent.date = date;
    existingEvent.venue = venue;
    existingEvent.coordinators = coordinators;
    
    await existingEvent.save();
    res.json({ message: "Event updated successfully", event: existingEvent });
  } catch (error) {
    console.error("❌ Error updating event:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete Event
const deleteEvent = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedEvent = await Event.findByIdAndDelete(id);
    if (!deletedEvent) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }
    res.status(200).json({ success: true, message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting event", error: error.message });
  }
};
// upcoming event
const getUpcomingEvents = async (req, res) => {
  try {
    const systemDate = new Date(); // Current date-time in UTC
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0); // Ensure it's midnight UTC

    console.log("System Date:", systemDate);
    console.log("Start of Today:", startOfDay);

    // Fetch events with a date greater than or equal to today
    const upcomingEvents = await Event.find({
      date: { $gt: startOfDay }  // Match future events
    }).sort({ date: 1 });

    console.log("Upcoming Events:", upcomingEvents);

    if (upcomingEvents.length === 0) {
      return res.status(200).json({ success: true, upcomingEvents: [] });
    }

    res.status(200).json({ success: true, upcomingEvents });
  } catch (error) {
    console.error("Error fetching upcoming events:", error);
    res.status(500).json({ success: false, message: "Error fetching upcoming events", error: error.message });
  }
};
const getOngoingEvents = async (req, res) => {
  try {
    const systemDate = new Date(); // Current date-time in UTC
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0); // Ensure it's midnight UTC

    console.log("System Date:", systemDate);
    console.log("Start of Today:", startOfDay);

    // Fetch events with a date greater than or equal to today
    const upcomingEvents = await Event.find({
      date: { $eq: startOfDay }  // Match future events
    }).sort({ date: 1 });

    console.log("Upcoming Events:", upcomingEvents);

    if (upcomingEvents.length === 0) {
      return res.status(200).json({ success: true, upcomingEvents: [] });
    }

    res.status(200).json({ success: true, upcomingEvents });
  } catch (error) {
    console.error("Error fetching upcoming events:", error);
    res.status(500).json({ success: false, message: "Error fetching upcoming events", error: error.message });
  }
};
const getCompletedEvents = async (req, res) => {
  try {
    const systemDate = new Date(); // Get current system date
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0); // Ensure it's midnight UTC
    const completedEvents = await Event.find({ date: { $lt: startOfDay } }).sort({ date: -1 });

    res.status(200).json({ success: true, completedEvents });
  } catch (error) {
    console.error("Error fetching completed events:", error);
    res.status(500).json({ success: false, message: "Error fetching completed events", error: error.message });
  }
};
const getEventStats = async (req, res) => {
  try {
    const studentCount = await User.countDocuments({ role: "student" }); // Count only students
    const participationCount = await Participation.countDocuments(); // Count participation entries

    res.status(200).json({ success: true, studentCount, participationCount });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ success: false, message: "Error fetching stats", error: error.message });
  }
};



// Exporting the controller functions
module.exports = {
  getFacultyNames,
  addEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getUpcomingEvents,
  getCompletedEvents,
  getOngoingEvents,
  getEventStats,
};