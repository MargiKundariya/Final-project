import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../assets/css/invitation.css";

const InvitationForm = () => {
  const [formData, setFormData] = useState({
    judgeId: "",
    judgeName: "",
    departmentName: "",
    eventName: "",
    eventDate: "",
    eventTime: "",
  });

  const [judges, setJudges] = useState([]);
  const [events, setEvents] = useState([]);
  const [invitationImage, setInvitationImage] = useState("");
  const [loading, setLoading] = useState({
    judges: true,
    events: true
  });

  // Fetch judges
  useEffect(() => {
    const fetchJudges = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/judges");
        
        // Check if response is an array instead of checking for response.data.success
        if (Array.isArray(response.data)) {
          setJudges(response.data);
        } else {
          console.error("Invalid data format for judges.");
        }
      } catch (error) {
        console.error("Error fetching judges:", error);
      } finally {
        setLoading(prevState => ({ ...prevState, judges: false }));
      }
    };
  
    fetchJudges();
  }, []);
  
  

  // Fetch event details
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/events");
    
        console.log("Events API Response:", response.data); // Debugging
    
        if (response.data.success && Array.isArray(response.data.events)) {
          setEvents(response.data.events);
        } else {
          console.error("Invalid data format for events.");
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(prevState => ({ ...prevState, events: false }));
      }
    };
    
    fetchEvents();
  }, []);
  
    // Handle Judge Selection
  const handleJudgeChange = (e) => {
    const selectedJudgeId = e.target.value;
    const selectedJudge = judges.find(judge => judge._id === selectedJudgeId);
    
    if (selectedJudge) {
      setFormData(prevState => ({
        ...prevState,
        judgeId: selectedJudgeId,
        judgeName: selectedJudge.name,
        departmentName: selectedJudge.department || "",
      }));
    }
  };

  // Handle Event Selection
  const handleEventChange = (e) => {
    const selectedEventId = e.target.value;
    const selectedEvent = events.find(event => event._id === selectedEventId);
    
    if (selectedEvent) {
      console.log("Selected Event:", selectedEvent); // Debugging
      setFormData(prevState => ({
        ...prevState,
        eventName: selectedEvent.name,
        eventDate: new Date(selectedEvent.date).toISOString().split("T")[0],
        eventTime: selectedEvent.startTime,
      }));
    }
  };
  

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const submissionData = { ...formData };

    try {
      const response = await axios.post("http://localhost:5000/api/invitations/generate", submissionData);
      setInvitationImage(response.data.invitationImage);
    } catch (error) {
      console.error("Error generating invitation:", error);
    }
  };

  return (
    <div className="invitation-page">
      <div className="invitation-card">
        <div className="card-header" id="card-header">
          <h2>Generate Invitation</h2>
          <p className="subtitle">Create customized invitations for judges</p>
        </div>
        
        <div className="card-content">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="judgeId">Select Judge</label>
              <select 
                    id="judgeId"
                    name="judgeId"
                    value={formData.judgeId}
                    onChange={handleJudgeChange}
                    required
                  >
                    <option value="">-- Select a judge --</option>
                    {loading.judges ? (
                      <option disabled>Loading judges...</option>
                    ) : (
                      judges.length > 0 ? (
                        judges.map((judge) => (
                          <option key={judge._id} value={judge._id}>
                            {judge.name}
                          </option>
                        ))
                      ) : (
                        <option disabled>No judges available</option>
                      )
                    )}
                  </select>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="judgeName">Judge Name</label>
                <input
                  type="text"
                  id="judgeName"
                  name="judgeName"
                  value={formData.judgeName}
                  readOnly
                  required
                  className="readonly-field"
                />
              </div>

              <div className="form-group">
                <label htmlFor="departmentName">Department</label>
                <input
                  type="text"
                  id="departmentName"
                  name="departmentName"
                  value={formData.departmentName}
                  readOnly
                  required
                  className="readonly-field"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="eventName">Select Event</label>
              <select 
                  id="eventName"
                  name="eventName"
                  onChange={handleEventChange}
                  required
                >
                  <option value="">-- Select an event --</option>
                  {loading.events ? (
                    <option disabled>Loading events...</option>
                  ) : (
                    events.length > 0 ? (
                      events.map((event) => (
                        <option key={event._id} value={event._id}>
                          {event.name}
                        </option>
                      ))
                    ) : (
                      <option disabled>No events available</option>
                    )
                  )}
                </select>


            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="eventDate">Event Date</label>
                <input 
                  type="date" 
                  id="eventDate"
                  name="eventDate" 
                  value={formData.eventDate} 
                  readOnly 
                  required 
                  className="readonly-field"
                />
              </div>

              <div className="form-group">
                <label htmlFor="eventTime">Event Time</label>
                <input 
                  type="time" 
                  id="eventTime"
                  name="eventTime" 
                  value={formData.eventTime} 
                  readOnly 
                  required 
                  className="readonly-field"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="submit-button"
              disabled={!formData.judgeName || !formData.eventName}
            >
              Generate Invitation
            </button>
          </form>
        </div>
        
        {invitationImage && (
          <div className="invitation-preview">
            <h3>Generated Invitation</h3>
            <div className="preview-container">
              <div className="invitation-details">
                <div className="detail-item">
                  <span className="detail-label">Judge:</span>
                  <span className="detail-value">{formData.judgeName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Department:</span>
                  <span className="detail-value">{formData.departmentName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Event:</span>
                  <span className="detail-value">{formData.eventName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Date:</span>
                  <span className="detail-value">
                    {new Date(formData.eventDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <img src={invitationImage} alt="Invitation" className="invitation-image" />
              <a href={invitationImage} download="invitation.png" className="download-link">
                <button className="download-button">Download Invitation</button>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvitationForm;