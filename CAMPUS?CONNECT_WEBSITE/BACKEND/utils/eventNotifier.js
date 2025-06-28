const cron = require('node-cron');
const Event = require('../models/Event');
const Participation = require('../models/participation');
const User = require('../models/User');
const transporter = require('../mailer');

// Format time to "hh:mm AM/PM"
const formatTime = (date) => {
  let hours = date.getHours();
  let minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
};

// Format date to "YYYY-MM-DD" (without timezone influence)
const formatDate = (date) => {
  const yyyy = date.getFullYear();
  const mm = (date.getMonth() + 1).toString().padStart(2, '0'); // Month starts at 0
  const dd = date.getDate().toString().padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const sendNotification = async (email, eventName, startTime) => {
  const formattedTime = formatTime(new Date(`1970-01-01T${startTime}:00`));

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Reminder: ${eventName} is Starting Soon!`,
    text: `Dear participant,\n\nThe event "${eventName}" is starting within one hour. Don't be late!\n\nBest regards,\nConnectors`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Notification sent to ${email} for event: ${eventName} at ${formattedTime}`);
  } catch (error) {
    console.error(`❌ Error sending email to ${email}:`, error.message);
  }
};

const checkAndSendNotifications = async () => {
  try {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    const formattedTime = oneHourLater.toTimeString().slice(0, 5); // "HH:MM"
    const formattedDate = formatDate(oneHourLater); // "YYYY-MM-DD"

    console.log(`🔍 Checking for events on ${formattedDate} at ${formattedTime}`);

    const upcomingEvents = await Event.find({
      startTime: formattedTime,
      date: formattedDate, // Make sure your Event model stores this in "YYYY-MM-DD"
    });

    if (!upcomingEvents.length) {
      console.log('ℹ️ No events starting in one hour.');
      return;
    }

    for (const event of upcomingEvents) {
      const { name: eventName, startTime } = event;

      const participations = await Participation.find({ eventName });
      if (!participations.length) {
        console.log(`ℹ️ No participants for event: ${eventName}`);
        continue;
      }

      const users = await User.find(
        { name: { $in: participations.map((p) => p.name) } },
        'email'
      );

      if (!users.length) {
        console.log(`ℹ️ No participant emails for event: ${eventName}`);
        continue;
      }

      for (const user of users) {
        await sendNotification(user.email, eventName, startTime);
      }
    }
  } catch (error) {
    console.error('❌ Error in notification job:', error);
  }
};

cron.schedule('*/1 * * * *', () => {
  console.log('⏳ Running scheduled event notification check...');
  checkAndSendNotifications();
});
