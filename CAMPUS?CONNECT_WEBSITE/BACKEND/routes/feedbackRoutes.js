const express = require("express");
const router = express.Router();
const { addFeedback, getFeedbacks } = require("../controllers/feedbackController");

router.post("/", addFeedback);
router.get("/", getFeedbacks);

module.exports = router;
