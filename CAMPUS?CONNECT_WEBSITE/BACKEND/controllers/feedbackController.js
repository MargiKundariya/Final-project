const Feedback = require("../models/Feedback");

// Add new feedback
const addFeedback = async (req, res) => {
  try {
    const { name, message } = req.body;
    if (!name || !message) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const newFeedback = new Feedback({ name, message });
    await newFeedback.save();
    
    res.status(201).json({ success: true, message: "Feedback submitted successfully!" });
  } catch (error) {
    console.error("Error saving feedback:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get all feedbacks
const getFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, feedbacks });
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = { addFeedback, getFeedbacks };
