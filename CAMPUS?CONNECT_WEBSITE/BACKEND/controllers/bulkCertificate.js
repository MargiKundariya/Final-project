const Certificate = require("../models/Certificate"); // Import the Certificate model
const path = require("path");
const fs = require("fs");
const { createCanvas, loadImage } = require("canvas");

// Utility to ensure the certificates directory exists
const ensureCertificatesDir = () => {
  const certificatesDir = path.join(__dirname, "../certificates");
  if (!fs.existsSync(certificatesDir)) {
    fs.mkdirSync(certificatesDir, { recursive: true });
  }
  return certificatesDir;
};

// Enhanced color palette based on rank (reused from previous design)
const getRankStyles = (rank = 0) => {
  switch (rank) {
    case 1:
      return {
        primary: "#FFD700", // Gold
        secondary: "#F5F5DC", // Beige
        accent: "#8B7500", // Dark gold
        text: "#333333",
        shadow: "rgba(255, 215, 0, 0.3)"
      };
    case 2:
      return {
        primary: "#C0C0C0", // Silver
        secondary: "#F5F5F5", // Light gray
        accent: "#555555", // Dark gray
        text: "#333333",
        shadow: "rgba(192, 192, 192, 0.3)"
      };
    case 3:
      return {
        primary: "#CD7F32", // Bronze
        secondary: "#FFF0E6", // Light orange
        accent: "#8B4513", // Brown
        text: "#333333",
        shadow: "rgba(205, 127, 50, 0.3)"
      };
    default:
      return {
        primary: "#2b6db6", // Blue
        secondary: "#E6F0FF", // Light blue
        accent: "#1A4B84", // Dark blue
        text: "#333333",
        shadow: "rgba(43, 109, 182, 0.3)"
      };
  }
};

// Function to generate the certificate canvas (image) with improved design
const generateCertificateCanvas = async (data) => {
  try {
    // Canvas setup with better dimensions for a certificate
    const canvasWidth = 1000;
    const canvasHeight = 700;
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext("2d");
    
    // Get rank-specific styles (default to rank 0 if not provided)
    const styles = getRankStyles(data.rank || 0);

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(1, styles.secondary);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Add background logo with reduced opacity
    const logoPath = path.join(__dirname, "../certificates/log.png");
    try {
      const logoImg = await loadImage(logoPath);
      
      // Save current context state
      ctx.save();
      
      // Set global alpha for transparency
      ctx.globalAlpha = 0.1;
      
      // Draw large logo as background
      const logoSize = Math.max(canvasWidth, canvasHeight) * 0.8;
      ctx.drawImage(
        logoImg, 
        canvasWidth / 2 - logoSize / 2, 
        canvasHeight / 2 - logoSize / 2, 
        logoSize, 
        logoSize
      );
      
      // Restore context to normal opacity
      ctx.restore();
    } catch (err) {
      console.warn("Could not load logo as background:", err.message);
    }

    // Card-like design with rounded corners and shadow
    ctx.save();
    // Create rounded rectangle path
    const cardMargin = 40;
    const cardWidth = canvasWidth - (cardMargin * 2);
    const cardHeight = canvasHeight - (cardMargin * 2);
    const cornerRadius = 20;
    
    // Draw drop shadow
    ctx.shadowColor = styles.shadow;
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    
    // Begin path for rounded rectangle
    ctx.beginPath();
    ctx.moveTo(cardMargin + cornerRadius, cardMargin);
    ctx.lineTo(cardMargin + cardWidth - cornerRadius, cardMargin);
    ctx.arcTo(cardMargin + cardWidth, cardMargin, cardMargin + cardWidth, cardMargin + cornerRadius, cornerRadius);
    ctx.lineTo(cardMargin + cardWidth, cardMargin + cardHeight - cornerRadius);
    ctx.arcTo(cardMargin + cardWidth, cardMargin + cardHeight, cardMargin + cardWidth - cornerRadius, cardMargin + cardHeight, cornerRadius);
    ctx.lineTo(cardMargin + cornerRadius, cardMargin + cardHeight);
    ctx.arcTo(cardMargin, cardMargin + cardHeight, cardMargin, cardMargin + cardHeight - cornerRadius, cornerRadius);
    ctx.lineTo(cardMargin, cardMargin + cornerRadius);
    ctx.arcTo(cardMargin, cardMargin, cardMargin + cornerRadius, cardMargin, cornerRadius);
    ctx.closePath();
    
    // Fill with slightly transparent white for a modern look
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.fill();
    
    // Add border with rank color
    ctx.strokeStyle = styles.primary;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    // Add decorative accents based on rank
    ctx.save();
    ctx.strokeStyle = styles.primary;
    ctx.lineWidth = 2;
    
    // Top left decorative corner
    ctx.beginPath();
    ctx.moveTo(cardMargin + 30, cardMargin + 30);
    ctx.lineTo(cardMargin + 30, cardMargin + 60);
    ctx.lineTo(cardMargin + 60, cardMargin + 30);
    ctx.closePath();
    ctx.stroke();
    
    // Bottom right decorative corner
    ctx.beginPath();
    ctx.moveTo(cardMargin + cardWidth - 30, cardMargin + cardHeight - 30);
    ctx.lineTo(cardMargin + cardWidth - 30, cardMargin + cardHeight - 60);
    ctx.lineTo(cardMargin + cardWidth - 60, cardMargin + cardHeight - 30);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();

    // Add normal sized logo at the top
    try {
      const logoImg = await loadImage(logoPath);
      ctx.drawImage(logoImg, canvasWidth / 2 - 80, cardMargin + 40, 160, 80);
    } catch (err) {
      console.warn("Could not load top logo:", err.message);
    }

    // Certificate title with elegant styling
    ctx.fillStyle = styles.primary;
    ctx.font = "bold 32px 'Georgia', serif";
    ctx.textAlign = "center";
    ctx.fillText("Certificate of Participation", canvasWidth / 2, cardMargin + 160);
    
    // Add decorative line under title
    ctx.beginPath();
    ctx.moveTo(canvasWidth / 2 - 200, cardMargin + 175);
    ctx.lineTo(canvasWidth / 2 + 200, cardMargin + 175);
    ctx.strokeStyle = styles.primary;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Recipient details with improved typography
    ctx.fillStyle = styles.text;
    ctx.font = "italic 24px 'Georgia', serif";
    ctx.fillText("Presented to", canvasWidth / 2, cardMargin + 220);

    // Recipient name with prominent display
    ctx.font = "bold 38px 'Georgia', serif";
    ctx.fillStyle = styles.accent;
    ctx.fillText(data.recipientName, canvasWidth / 2, cardMargin + 270);

    ctx.fillStyle = styles.text;
    ctx.font = "20px 'Georgia', serif";
    ctx.fillText("For outstanding Performance in", canvasWidth / 2, cardMargin + 330);

    ctx.font = "bold 28px 'Georgia', serif";
    ctx.fillStyle = styles.primary;
    ctx.fillText(data.courseTitle, canvasWidth / 2, cardMargin + 370);

    // Add date with elegant styling
    ctx.font = "20px 'Georgia', serif";
    ctx.fillStyle = styles.text;
    ctx.fillText(`Held  on: ${data.date}`, canvasWidth / 2, cardMargin + 420);

    // If rank is provided, show the rank badge
    if (data.rank) {
      const badgeRadius = 50;
      const badgeX = canvasWidth / 2;
      const badgeY = cardMargin + 480;
      
      // Draw circle badge
      ctx.beginPath();
      ctx.arc(badgeX, badgeY, badgeRadius, 0, Math.PI * 2);
      ctx.fillStyle = styles.primary;
      ctx.fill();
      
      // Add rank text to badge
      ctx.font = "bold 40px 'Arial', sans-serif";
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(`${data.rank}`, badgeX, badgeY + 14);
      
      // Add "RANK" text below number
      ctx.font = "bold 16px 'Arial', sans-serif";
      ctx.fillText("RANK", badgeX, badgeY + 38);
    }

    // Signature section with improved layout
    const signaturePath = path.join(__dirname, "../certificates/signature.png");
    try {
      const signatureImg = await loadImage(signaturePath);
      ctx.drawImage(signatureImg, cardMargin + 100, cardMargin + cardHeight - 100, 140, 50);
    } catch (err) {
      console.warn("Could not load signature:", err.message);
    }

    // Signature text with improved styling
    ctx.font = "bold 18px 'Georgia', serif";
    ctx.textAlign = "left";
    ctx.fillStyle = styles.text;
    ctx.fillText("Dhruv Chaudhari", cardMargin + 120, cardMargin + cardHeight - 40);
    
    ctx.font = "16px 'Georgia', serif";
    ctx.fillText("All India School of Designing", cardMargin + 120, cardMargin + cardHeight - 20);

    // // Certificate ID or serial number (optional)
    // ctx.font = "12px 'Georgia', serif";
    // ctx.fillStyle = "#888888";
    // ctx.fillText(`Certificate ID: ${Date.now().toString().substring(6)}`, canvasWidth / 2, cardMargin + cardHeight - 15);

    // Save certificate
    const certificatesDir = ensureCertificatesDir();
    const imagePath = path.join(certificatesDir, `certificate-${Date.now()}.png`);
    const out = fs.createWriteStream(imagePath);
    const stream = canvas.createPNGStream();
    stream.pipe(out);

    await new Promise((resolve) => out.on("finish", resolve));
    return imagePath;
  } catch (err) {
    console.error("Error generating certificate:", err);
    throw err;
  }
};

// Controller for bulk uploading certificates with redesigned certificates
exports.bulkUploadCertificates = async (req, res) => {
  try {
    const certificatesData = req.body; // Receive bulk data from frontend

    // Validate data
    if (
      !Array.isArray(certificatesData) ||
      certificatesData.some((data) => !data.recipientName || !data.courseTitle || !data.date)
    ) {
      return res.status(400).json({ message: "Invalid certificates data format." });
    }

    // Generate certificates and store in DB
    const certificatesWithImages = await Promise.all(
      certificatesData.map(async (data) => {
        const { recipientName, courseTitle, date, rank } = data;
        
        // Format date string properly
        let formattedDate;
        try {
          formattedDate = new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        } catch (err) {
          console.warn("Date formatting error:", err);
          formattedDate = date; // Fallback to original string if parsing fails
        }
        
        // Generate certificate with the enhanced design
        const imagePath = await generateCertificateCanvas({
          recipientName,
          courseTitle,
          date: formattedDate,
          rank: rank || 0, // Pass rank to certificate generator (default 0 if not provided)
        });

        // Save certificate in the database with the image URL
        const certificate = new Certificate({
          recipientName,
          courseTitle,
          date: new Date(date),
          imageUrl: `/certificates/${path.basename(imagePath)}`, // Store URL to the image file
          rank: rank || 0, // Default rank to 0 if not provided
        });

        await certificate.save(); // Save the certificate document to the database

        return {
          _id: certificate._id,
          recipientName,
          courseTitle,
          date: formattedDate,
          imageUrl: certificate.imageUrl,
          rank: rank || 0
        }; // Return a clean certificate object
      })
    );

    // Return certificates with success message
    res.status(201).json({
      message: `Successfully generated ${certificatesWithImages.length} certificates`,
      certificates: certificatesWithImages
    });
  } catch (error) {
    console.error("Error in bulkUploadCertificates:", error);
    res.status(500).json({ message: error.message });
  }
};