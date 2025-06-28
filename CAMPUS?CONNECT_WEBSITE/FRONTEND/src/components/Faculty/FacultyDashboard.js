import React, { useEffect, useState } from "react";
// import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { 
  FaUsers, 
  FaCalendarAlt, 
  FaStar, 
  FaCheckCircle, 
  FaExclamationCircle,
  FaClock,
  FaCalendarCheck
} from "react-icons/fa";
import "../../assets/css/admindashboard.css";

ChartJS.register(ArcElement, Tooltip, Legend);

const FacultyDashboard = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [completedEvents, setCompletedEvents] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [participationCount, setParticipationCount] = useState(0);
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackInput, setFeedbackInput] = useState({ name: "", message: "" });

  useEffect(() => {
    fetch("http://localhost:5000/api/events/upcoming")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUpcomingEvents(data.upcomingEvents);
        }
      })
      .catch((error) => console.error("Error fetching upcoming events:", error));

    fetch("http://localhost:5000/api/events/completed")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCompletedEvents(data.completedEvents.length);
        }
      })
      .catch((error) => console.error("Error fetching completed events:", error));

    fetch("http://localhost:5000/api/events/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStudentCount(data.studentCount);
          setParticipationCount(data.participationCount);
        }
      })
      .catch((error) => console.error("Error fetching stats:", error));

    fetch("http://localhost:5000/api/feedback")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setFeedbacks(data.feedbacks);
        }
      })
      .catch((error) => console.error("Error fetching feedbacks:", error));
  }, []);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackInput.name || !feedbackInput.message) {
      alert("Please enter your name and feedback message.");
      return;
    }

    const response = await fetch("http://localhost:5000/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(feedbackInput),
    });

    const data = await response.json();
    if (data.success) {
      setFeedbacks((prev) => [...prev, feedbackInput]);
      setFeedbackInput({ name: "", message: "" });
    } else {
      alert("Error submitting feedback.");
    }
  };

  // const pieData = {
  //   labels: ["Students", "Participation"],
  //   datasets: [
  //     {
  //       label: "Students vs Participation",
  //       data: [studentCount, participationCount],
  //       backgroundColor: ["#3f51b5", "#ff5722"],
  //       borderColor: ["#ffffff"],
  //       borderWidth: 1,
  //     },
  //   ],
  // };

  return (
    <div className="admin-dashboard">
          <div className="dashboard-header">
            <h1>Faculty Dashboard</h1>
            <p>Welcome back! Here's an overview of your events.</p>
          </div>
          
          <div className="dashboard-stats">
            {/* <div className="stat-card">
              <div className="stat-icon">
                <FaUsers />
              </div>
              <div className="stat-content">
                <h3>Total Students</h3>
                <p>{studentCount}</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <FaCalendarCheck />
              </div>
              <div className="stat-content">
                <h3>Participants</h3>
                <p>{participationCount}</p>
              </div>
            </div> */}
            
            <div className="stat-card">
              <div className="stat-icon">
                <FaCheckCircle />
              </div>
              <div className="stat-content">
                <h3>Completed Events</h3>
                <p>{completedEvents}</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <FaClock />
              </div>
              <div className="stat-content">
                <h3>Upcoming Events</h3>
                <p>{upcomingEvents.length}</p>
              </div>
            </div>
          </div>
    
          <div className="dashboard-main">
            <div className="dashboard-card events-card">
              <div className="card-header" id="card-header"> 
                <h2><FaCalendarAlt /> Upcoming Events</h2>
              </div>
              <div className="card-body">
                {upcomingEvents.length > 0 ? (
                  <div className="event-list">
                    {upcomingEvents.map((event, index) => (
                      <div key={index} className="event-item">
                        <div className="event-date">
                          <span className="event-day">
                            {new Date(event.date).getDate()}
                          </span>
                          <span className="event-month">
                            {new Date(event.date).toLocaleString('default', { month: 'short' })}
                          </span>
                        </div>
                        <div className="event-details">
                          <h3>{event.name}</h3>
                          <p>{event.description || "No description available"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <FaCalendarAlt />
                    <p>No upcoming events scheduled</p>
                  </div>
                )}
              </div>
            </div>
            <div className="dashboard-card feedback-card">
                    <div className="card-header" id="card-header">
                      <h2><FaStar /> Recent Feedback</h2>
                    </div>
                    <div className="card-body">
                      {feedbacks.length > 0 ? (
                        <div className="feedback-list">
                          {feedbacks.map((feedback, index) => (
                            <div key={index} className="feedback-item">
                              <div className="feedback-avatar">
                                {feedback.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="feedback-content">
                                <h3>{feedback.name}</h3>
                                <p>{feedback.message}</p>
                                <div className="feedback-meta">
                                  <span className="feedback-date">
                                    {feedback.date ? new Date(feedback.date).toLocaleDateString() : "N/A"}
                                  </span>
                                  <span className="feedback-event">
                                    {feedback.event || "General Feedback"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="empty-state">
                          <FaStar />
                          <p>No feedback available yet</p>
                        </div>
                      )}
                    </div>
                  </div>
        {/* Students vs Participation Chart */}
      </div>
    </div>
  );
};

export default FacultyDashboard;
