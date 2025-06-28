const Invitation = require("../models/Invitation");
const { createCanvas } = require("canvas");
const fs = require("fs");
const path = require("path");

exports.generateInvitation = async (req, res) => {
  try {
    const { judgeName, departmentName, eventName, eventDate, eventTime } = req.body;

    // Create a Canvas
    const canvas = createCanvas(900, 1120);
    const ctx = canvas.getContext("2d");

    // White Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Header - "Invitation Letter"
    ctx.fillStyle = "#000000"; // Black text
    ctx.font = "bold 30px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Invitation Letter", canvas.width / 2, 75);

    // To, Judge Name, Department
    ctx.font = "20px serif";
    ctx.textAlign = "left";
    ctx.fillText("To,", 50, 150);
    ctx.fillText(`${judgeName}`, 50, 180);
    ctx.fillText(`${departmentName}`, 50, 210); // Include department name

    // Subject Box
    ctx.font = "bold 22px Arial";
    ctx.fillText("Subject: Invitation for Judge at Vidyabharti Trust College of BBA, Umrakh", 50, 270);
    
    ctx.strokeStyle = "#000000"; // Black border
    ctx.lineWidth = 2;
    ctx.strokeRect(45, 240, 800, 50); // Box around subject

    // Invitation Content
    ctx.font = "20px serif";
    ctx.fillText(`Dear ${judgeName},`, 50, 350);

    const message = [
      "We are pleased to invite you as a distinguished Judge for",
      `the event '${eventName}' organized by Vidyabharti Trust College of BBA, Umrakh.`,
      "Your expertise and insights would be invaluable in evaluating and guiding our participants.",
      `The event is scheduled for ${eventDate}, beginning at ${eventTime}.`,
      "We would be honored by your presence and look forward to your confirmation."
    ];

    let textY = 390;
    message.forEach(line => {
      ctx.fillText(line, 50, textY);
      textY += 40;
    });

    // Closing Note
    ctx.font = "italic 20px serif";
    ctx.fillText("Anticipating a favorable response.", 50, textY + 40);

    // Footer - Signature
    ctx.font = "20px serif";
    ctx.fillText("Best regards,", 50, textY + 100);
    ctx.fillText("Vidyabharti Trust College of BBA, Umrakh", 50, textY + 130);

    // Save Image to File
    const imageFileName = `${Date.now()}_invitation.png`;
    const imagePath = path.join(__dirname, `../invitation/${imageFileName}`);
    const out = fs.createWriteStream(imagePath);
    const stream = canvas.createPNGStream();
    stream.pipe(out);

    out.on("finish", async () => {
      const imageUrl = `/invitation/${imageFileName}`;

      // Save to MongoDB
      const savedInvitation = new Invitation({
        judgeName,
        eventName,
        eventDate,
        eventTime,
        invitationImage: imageUrl, // Store relative URL
      });

      await savedInvitation.save();

      res.status(201).json({
        message: "Invitation Created",
        invitationImage: `http://localhost:5000${imageUrl}`, // Send full URL
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getinvitation = async (req, res) => {
  try {
    const sessionName = req.session?.name;
    if (!sessionName) {
      return res.status(400).json({ message: "Session name is required." });
    }

    const invitations = await Invitation.find({
      judgeName: { $regex: new RegExp(`^${sessionName}$`, "i") }, // Case-insensitive search
    });

    if (invitations.length === 0) {
      return res.status(404).json({ message: "No invitations found" });
    }

    res.status(200).json(invitations);
  } catch (error) {
    console.error("Error in getinvitation:", error);
    res.status(500).json({ message: error.message });
  }
};
