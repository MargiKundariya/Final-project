const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const Participation = require("../models/participation"); // ✅ Corrected model name
const mongoose = require("mongoose");

// Helper function to format months
const getMonthName = (monthIndex) => {
  return new Date(0, monthIndex).toLocaleString("en-US", { month: "long" });
};

// 📌 **Month-wise Report API**
router.get("/monthly", async (req, res) => {
  try {
    const monthlyReport = await Event.aggregate([
      {
        $group: {
          _id: { $month: "$date" }, // Group by month
          eventCount: { $sum: 1 }, // Count events in that month
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const formattedReport = monthlyReport.map((entry) => ({
      month: getMonthName(entry._id - 1), // Convert month index to name
      eventCount: entry.eventCount,
    }));

    res.json({ success: true, monthlyReport: formattedReport });
  } catch (error) {
    console.error("Error fetching monthly report:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// 📌 **Event-wise Report API**
router.get("/events", async (req, res) => {
    try {
      const eventReport = await Event.find().lean();
  
      for (let event of eventReport) {
        if (!event.name) {
          console.warn(`Event with ID ${event._id} is missing a name.`);
          event.name = "Unnamed Event"; // Provide a default name
        }
  
        // Match by eventName instead of eventId
        const participantCount = await Participation.countDocuments({ eventName: event.name });
        event.participants = participantCount;
      }
  
      res.json({ success: true, eventReport });
    } catch (error) {
      console.error("Error fetching event-wise report:", error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  });

  // Department wise
  router.get("/department-wise", async (req, res) => {
    try {
      const departmentReport = await Participation.aggregate([
        { $group: { _id: "$department", totalParticipants: { $sum: 1 } } },
        { $sort: { totalParticipants: -1 } }
      ]);
  
      res.json({ success: true, departmentReport });
    } catch (error) {
      console.error("Error generating department-wise report:", error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  });

  //  Year-Wise Participation 
  router.get("/year-wise", async (req, res) => {
    try {
      const yearReport = await Participation.aggregate([
        { $group: { _id: "$year", totalParticipants: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]);
  
      res.json({ success: true, yearReport });
    } catch (error) {
      console.error("Error generating year-wise report:", error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  });
 // top winners
 router.get("/top-performers", async (req, res) => {
    try {
      const topPerformers = await Participation.find().sort({ marks: -1 }).limit(10).lean();
      res.json({ success: true, topPerformers });
    } catch (error) {
      console.error("Error fetching top performers:", error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  });
//     
    
module.exports = router;
