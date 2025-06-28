const express = require("express");
const router = express.Router();
const { generateIDCards, getIDCard } = require("../controllers/idCardController");

// Route to generate ID cards
router.post("/generate", generateIDCards);

// Route to fetch an ID card by session name
router.get("/get", getIDCard);

module.exports = router;
