import React, { useState } from "react";
import axios from "axios";
import { FaPaperPlane } from "react-icons/fa";
import "../../assets/css/feedbackform.css";

const FeedbackForm = () => {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !message) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/feedback", {
        name,
        message,
      });

      if (response.data.success) {
        setSuccess("Feedback submitted successfully!");
        setName("");
        setMessage("");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Failed to submit feedback. Try again.");
    }
  };

  return (
    <div className="feedback-container">
      <h2 className="h2">Give Your Feedback</h2>
      {success && <p className="success-message">{success}</p>}
      <form onSubmit={handleSubmit} className="feedback-form">
        <input id="input"
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <textarea
          placeholder="Your Feedback"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
        <button type="submit" className="ebutton">
          Submit <FaPaperPlane />
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;
