const User = require("../models/User");
const Participation = require('../models/participation'); // Assuming you have a Participation model

// Controller to assign events to a judge
const assignEventsToJudge = async (req, res) => {
  const { judgeId } = req.params;
  const { assignedEvents } = req.body;

  if (!assignedEvents || !Array.isArray(assignedEvents)) {
    return res.status(400).json({ message: "Invalid events data provided" });
  }

  try {
    const updatedJudge = await User.findByIdAndUpdate(
      judgeId,
      { $set: { assignedEvents } },
      { new: true } // Return the updated document
    );

    if (!updatedJudge) {
      return res.status(404).json({ message: "Judge not found" });
    }

    res.status(200).json({
      message: "Events assigned successfully",
      updatedJudge,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to assign events",
      error: error.message,
    });
  }
};

// Controller to get all judges
const getAllJudges = async (req, res) => {
  try {
    const judges = await User.find({ role: "judge" });
    res.status(200).json(judges);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch judges",
      error: error.message,
    });
  }
};

// Controller to get judge by ID
const getJudgeById = async (req, res) => {
  const { judgeId } = req.params;

  try {
    const judge = await User.findById(judgeId);
    if (!judge) {
      return res.status(404).json({ message: "Judge not found" });
    }

    res.status(200).json(judge);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch judge",
      error: error.message,
    });
  }
};

const getAssignedEvents = async (req, res) => {
  try {
    // Get logged-in judge's email from session
    const judgeEmail = req.session.email;
    if (!judgeEmail) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Find the judge in the Users table and get assignedEvents field
    const judge = await User.findOne({ email: judgeEmail, role: "judge" }, "assignedEvents");
    if (!judge) {
      return res.status(404).json({ success: false, message: "Judge not found" });
    }

    // Return assigned events
    res.status(200).json({ success: true, events: judge.assignedEvents || [] });
  } catch (error) {
    console.error("Error fetching assigned events:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



module.exports = {
  assignEventsToJudge,
  getAllJudges,
  getJudgeById,
  getAssignedEvents,
};