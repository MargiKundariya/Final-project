const express = require("express");
const {
  assignEventsToJudge,
  getAllJudges,
  getJudgeById,
  getAssignedEvents,
} = require("../controllers/judgeController");

const router = express.Router();

// Routes
router.put("/assign-events/:judgeId", assignEventsToJudge);
router.get("/", getAllJudges);
router.get('/assigned-events', getAssignedEvents);
router.get("/:judgeId", getJudgeById);


module.exports = router;
