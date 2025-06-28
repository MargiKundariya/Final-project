const express = require("express");
const router = express.Router();
const {
  addEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getFacultyNames,
  getUpcomingEvents,
  getCompletedEvents,
  getOngoingEvents,
  getEventStats,
} = require("../controllers/eventController");

router.post("/add", addEvent);
router.get("/", getEvents);
router.get("/faculty-names",getFacultyNames);
router.get("/upcoming", getUpcomingEvents);
router.get("/completed", getCompletedEvents);
router.get("/stats", getEventStats);
router.get("/getOngoing",getOngoingEvents)
router.get("/:id", getEventById);
router.put("/:id", updateEvent);   
router.delete("/:id", deleteEvent);
module.exports = router;
