import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
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

const AdminDashboard = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [completedEvents, setCompletedEvents] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [participationCount, setParticipationCount] = useState(0);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [upcomingRes, completedRes, statsRes, feedbackRes] = await Promise.all([
          fetch("http://localhost:5000/api/events/upcoming"),
          fetch("http://localhost:5000/api/events/completed"),
          fetch("http://localhost:5000/api/events/stats"),
          fetch("http://localhost:5000/api/feedback")
        ]);

        const upcomingData = await upcomingRes.json();
        const completedData = await completedRes.json();
        const statsData = await statsRes.json();
        const feedbackData = await feedbackRes.json();

        if (upcomingData.success) setUpcomingEvents(upcomingData.upcomingEvents);
        if (completedData.success) setCompletedEvents(completedData.completedEvents.length);
        if (statsData.success) {
          setStudentCount(statsData.studentCount);
          setParticipationCount(statsData.participationCount);
        }
        if (feedbackData.success) setFeedbacks(feedbackData.feedbacks);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const pieData = {
    labels: ["Students", "Participation"],
    datasets: [
      {
        label: "Students vs Participation",
        data: [studentCount, participationCount],
        backgroundColor: ["#4361ee", "#3a0ca3"],
        borderColor: ["#ffffff"],
        borderWidth: 2,
        hoverOffset: 10,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#333",
          font: {
            size: 14,
            weight: "bold",
          },
          padding: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => ` ${tooltipItem.label}: ${tooltipItem.raw}`,
        },
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleFont: { size: 14 },
        bodyFont: { size: 10 },
        padding: 10,
        usePointStyle: true,
      },
    },
    cutout: "70%",
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <FaExclamationCircle />
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome back! Here's an overview of your events.</p>
      </div>
      
      <div className="dashboard-stats">
        <div className="stat-card">
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
        </div>
        
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

        <div className="dashboard-card chart-card">
          <div className="card-header" id="card-header">
            <h2><FaUsers /> Students vs Participation</h2>
          </div>
          <div className="card-body chart-container">
            <Pie data={pieData} options={pieOptions} />
            <div className="chart-legend">
              <div className="legend-item">
                <span className="legend-color" style={{backgroundColor: "#4361ee"}}></span>
                <span>Students: {studentCount}</span>
              </div>
              <div className="legend-item">
                <span className="legend-color" style={{backgroundColor: "#3a0ca3"}}></span>
                <span>Participation: {participationCount}</span>
              </div>
            </div>
          </div>
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
    </div>
  );
};

export default AdminDashboard;