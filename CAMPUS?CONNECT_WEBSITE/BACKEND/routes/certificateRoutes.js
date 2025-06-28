const express = require("express");
const router = express.Router();
const certificateController = require("../controllers/certificateController");

// Create a single certificate
router.post("/create", certificateController.createCertificate);

// Get certificates for the logged-in user (if applicable)
router.get("/", certificateController.getCertificates);

module.exports = router;
