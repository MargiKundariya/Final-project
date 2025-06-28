const express = require("express");
const router = express.Router();
const inviationscontrollers = require("../controllers/invitationController");

router.post("/generate", inviationscontrollers.generateInvitation);
router.get("/",inviationscontrollers.getinvitation);

module.exports = router;
