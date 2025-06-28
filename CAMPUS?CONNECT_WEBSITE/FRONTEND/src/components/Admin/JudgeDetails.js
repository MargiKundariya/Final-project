import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EnhancedLoader from "../EnhancedLoader";

const JudgeDetails = ({ judge, onBack }) => {
  const [assignedEvents, setAssignedEvents] = useState(judge.assignedEvents || []);
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Get profile image URL
  const profileImageUrl = `http://localhost:5000/${judge.imageUrl?.replace(/\\/g, "/")}`;

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/events");
        setAllEvents(response.data.events);
      } catch (err) {
        setError("Failed to fetch events. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleAssignEvents = async () => {
    setIsSaving(true);
    try {
      await axios.put(`http://localhost:5000/api/judges/assign-events/${judge._id}`, {
        assignedEvents,
      });
      toast.success("Events assigned successfully!");
    } catch (err) {
      toast.error("Failed to assign events. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddEvent = (event) => {
    if (!assignedEvents.includes(event)) {
      setAssignedEvents([...assignedEvents, event]);
    } else {
      toast.info("Event is already assigned.");
    }
  };

  const handleRemoveEvent = (event) => {
    setAssignedEvents(assignedEvents.filter((e) => e !== event));
  };

  // Filter out events that are already assigned
  const availableEvents = allEvents.filter(
    event => !assignedEvents.includes(event.name)
  );

  if (loading) {
    return <EnhancedLoader />;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button className="btn btn-primary" onClick={onBack}>Back to Judges</button>
      </div>
    );
  }

  return (
    <div className="judge-details-page">
      <div className="page-header">
        <h1 id="head">Judge Details</h1>
      </div>

      <div className="cards-container" id="cards-container">
        {/* Judge Profile Card */}
        <div className="card profile-card" id="card profile-card">
          <div className="card-header" id="card-header">
            <h2>Profile Information</h2>
          </div>
          <div className="card-body" id="card-body">
            <div className="profile-image-container">
              {!imageError ? (
                <img 
                  src={profileImageUrl} 
                  alt={judge.name} 
                  className="profile-image"
                  onError={(e) => {
                    setImageError(true);
                  }}
                />
              ) : (
                <div className="avatar">
                  {judge.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="profile-info">
              <h3>{judge.name}</h3>
              <p className="email">{judge.email}</p>
              {judge.department && (
                <p className="department">
                  <span className="label">Department:</span> {judge.department}
                </p>
              )}
              {judge.details && (
                <p className="details">
                  <span className="label">Details:</span> {judge.details}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Assigned Events Card */}
        <div className="card events-card" id="card events-card">
          <div className="card-header" id="card-header">
            <h2>Assigned Events</h2>
          </div>
          <div className="card-body" id="card-body">
            {assignedEvents.length > 0 ? (
              <div className="event-tags">
                {assignedEvents.map((event, index) => (
                  <div className="event-tag" key={index}>
                    <span>{event}</span>
                    <button 
                      className="remove-event-btn"
                      onClick={() => handleRemoveEvent(event)}
                      aria-label={`Remove ${event}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-events">No events assigned yet</p>
            )}
          </div>
        </div>

        {/* Assign Events Card */}
        <div className="card assign-card" id="card assign-card">
          <div className="card-header" id="card-header">
            <h2>Assign New Event</h2>
          </div>
          <div className="card-body" id="card-body">
            <select
              onChange={(e) => e.target.value && handleAddEvent(e.target.value)}
              value=""
              className="event-dropdown"
              disabled={availableEvents.length === 0}
            >
              <option value="" disabled>
                {availableEvents.length === 0 ? "No more events available" : "Select an event"}
              </option>
              {availableEvents.map((event) => (
                <option key={event._id} value={event.name}>
                  {event.name}
                </option>
              ))}
            </select>
            <button 
              className="svbtn btn-primary save-btn"
              onClick={handleAssignEvents}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .judge-details-page {
          padding: 24px;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .page-header {
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .page-header h1 {
          margin: 0;
          font-size: 24px;
          color: #333;
        }
        
        .back-button {
          background: none;
          border: none;
          color: #1890ff;
          cursor: pointer;
          font-size: 16px;
          padding: 8px 0;
          display: flex;
          align-items: center;
        }
        
        #cards-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
        }
        
        #card {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          overflow: hidden;
        }
        
        #card-header {
          padding: 16px 20px;
          border-bottom: 1px solid #eee;
          background-color: #fafafa;
        }
        
        #card-header h2 {
          margin: 0;
          font-size: 18px;
          color: #fff;
        }
        
        #card-body {
          padding: 20px;
        }
        
        .profile-card #card-body {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .profile-image-container {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #eee;
        }
        
        .profile-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background-color: #1890ff;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          font-weight: bold;
        }
        
        .profile-info {
          flex: 1;
        }
        
        .profile-info h3 {
          margin: 0 0 8px 0;
          font-size: 20px;
          color: #333;
        }
        
        .profile-info p {
          margin: 0 0 6px 0;
          color: #666;
        }
        
        .profile-info .email {
          margin-bottom: 12px;
        }
        
        .profile-info .label {
          font-weight: 600;
          color: #555;
        }
        
        .event-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .event-tag {
          background-color: #f0f7ff;
          border: 1px solid #cce5ff;
          border-radius: 16px;
          padding: 6px 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .remove-event-btn {
          background: none;
          border: none;
          color: #666;
          cursor: pointer;
          font-size: 16px;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
        }
        
        .remove-event-btn:hover {
          color: #ff4d4f;
        }
        
        .no-events {
          color: #999;
          font-style: italic;
        }
        
        .event-dropdown {
          width: 100%;
          padding: 10px;
          border-radius: 4px;
          border: 1px solid #d9d9d9;
          margin-bottom: 16px;
        }
        
        .save-btn {
          width: 100%;
        }
        
        .svbtn {
          padding: 10px 18px;
          border-radius: 4px;
          border: none;
          cursor: pointer;
          font-weight: 500;
        }
        
        .btn-primary {
          background-color: #1890ff;
          color: white;
        }
        
        .btn-primary:hover {
          background-color: #40a9ff;
        }
        
        .btn-primary:disabled {
          background-color: #bfbfbf;
          cursor: not-allowed;
        }
        
        
        .error-container {
          text-align: center;
          padding: 40px;
        }
        
        .error-message {
          padding: 20px;
          color: #ff4d4f;
          margin-bottom: 16px;
        }
        
        @media (max-width: 768px) {
          #cards-container {
            grid-template-columns: 1fr;
          }
          
          .profile-card .card-body {
            flex-direction: column;
            text-align: center;
          }
          
          .profile-info {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default JudgeDetails;