const express = require("express");
const { getProfile, updateProfile } = require("../controllers/ProfileController");

const router = express.Router();

// Route to fetch the profile of the logged-in user
router.get("/profile", getProfile);

// Route to update or create the profile of the logged-in user
router.post("/profile", updateProfile);

module.exports = router;
