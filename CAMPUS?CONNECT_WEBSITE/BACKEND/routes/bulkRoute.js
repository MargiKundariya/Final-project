const express = require('express');
const router = express.Router();
const multer = require('multer');
const bulkCertificateController = require('../controllers/bulkCertificate');

// Multer setup for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Define the POST route for bulk certificate upload
router.post('/bulk', upload.single('file'), bulkCertificateController.bulkUploadCertificates);

module.exports = router;
