const transporter = require('./mailer'); // Ensure this is correctly imported

const sendEmailNotification = async (email, eventName, action) => {
  try {
    let subject, text;

    if (action === "added") {
      subject = `:
📢 Coordinator Assignment Notification 🎯`;
      text = `Exciting News! You have been assigned as a coordinator for an upcoming event. 🎉
Get ready to take the lead and make ${eventName} a huge success! Your role is crucial in ensuring everything runs smoothly.
Stay tuned for more details, and let’s make this an unforgettable experience! 🚀✨
Best Regards,
Connectors 🎓`;
    } else if (action === "removed") {
      subject = `⚠️ Update: Coordinator Role Change for ${eventName}`;
      text = `Hello,
      We wanted to inform you that you have been removed from the coordinator role for ${eventName}. We truly appreciate the time and effort you’ve put in! 🙌
      Your contributions have been valuable, and we look forward to collaborating with you in future opportunities. If you have any questions, feel free to reach out.
      Best Regards,
      Campus Connect🎓`;
    } else {
      console.error("Invalid action type for email notification.");
      return;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      text,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${email} for ${action} action`);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = sendEmailNotification;
