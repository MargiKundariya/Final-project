const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Participation = require('../models/participation');
const Event = require('../models/Event');

router.get('/', async (req, res) => {
  console.log("🔍 Checking session data...");
  console.log("🛠 SESSION DATA:", req.session);

  if (!req.session || !req.session.name) {
    console.log("❌ No session found or missing 'name' field.");
    return res.status(401).json({ error: 'Unauthorized: No session found' });
  }

  const coordinatorName = req.session.name; // Faculty name from session
  console.log(`✅ Fetching events for coordinator: ${coordinatorName}`);

  try {
    // Find events where the faculty is listed as a coordinator
    const events = await Event.find({ coordinators: coordinatorName });

    if (!events.length) {
      console.log("⚠️ No events found for this coordinator.");
      return res.json([]); 
    }

    console.log(`🎉 Found ${events.length} event(s).`);

    // Extract event names for matching participation records
    const eventNames = events.map(event => event.name);
    console.log("📌 Event Names for Matching Participation:", eventNames);

    // Fetch participation data where eventName matches event names found
    const participationData = await Participation.find({ eventName: { $in: eventNames } });

    console.log(`📢 Participation Records Found: ${participationData.length}`);
    res.json(participationData);
  } catch (error) {
    console.error("❌ ERROR: Fetching participation data failed.");
    console.error(error.stack); // Print full error stack
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

module.exports = router;
