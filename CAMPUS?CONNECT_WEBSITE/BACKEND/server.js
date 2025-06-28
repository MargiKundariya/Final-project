const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const eventRoutes = require('./routes/eventRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const participationRoutes = require('./routes/participationRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const userRoutes = require('./routes/userRoutes');
const studentRoutes = require('./routes/studentRoutes');
const judgeRoutes = require('./routes/judgeRoutes');
const idCardRoutes = require('./routes/idCardRoutes');
const bulkRoute = require('./routes/bulkRoute');
const personalInformationRoutes = require("./routes/personalInformationRoutes");
const invitationRoutes = require("./routes/invitationRoutes");
const coordinator = require("./routes/coordinator");
const winnerRoutes = require("./routes/winnerRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const reportRoutes = require('./routes/reports');
const eventLike = require('./routes/eventLike')
const path = require('path'); // Add this line
const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true, // Allow session cookies
}));
app.use(bodyParser.json());
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }, // Set to true if using HTTPS
}));
999
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use('/certificates', express.static(path.join(__dirname, 'certificates')));
app.use("/scanner_uploads", express.static(path.join(__dirname, "scanner_uploads")));
app.use("/invitation",express.static(path.join(__dirname,"invitation")));
app.use("/judgephoto",express.static(path.join(__dirname,"judgephoto")));
app.use("/studentphoto",express.static(path.join(__dirname,"studentphoto")));

// MongoDB Connection
mongoose.connect('mongodb+srv://CampusConnect:campus_123@campusconnect.ud0vv.mongodb.net/campusconnect', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  
  // Start cron job after successful database connection
  require('./utils/eventNotifier'); 
})

  .catch(err => console.log('Error connecting to Altas:', err));

// Routes
app.use('/api/events', eventRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/participation', participationRoutes);
app.use('/api/certificate', certificateRoutes);
app.use('/api/users', userRoutes);
app.use('/api/student', studentRoutes);
app.use("/api/judges", judgeRoutes);
app.use('/api/id-cards', idCardRoutes); // Use the ID card routes
app.use('/api', bulkRoute); // Use the bulk route
app.use('/api', personalInformationRoutes);
app.use("/api/invitations", invitationRoutes);
app.use('/api/coordinator',coordinator);
app.use("/api/winners",winnerRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/like",eventLike);
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
