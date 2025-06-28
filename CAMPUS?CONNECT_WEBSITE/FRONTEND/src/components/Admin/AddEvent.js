import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaCalendarPlus, FaInfoCircle, FaChartLine } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/css/addevent.css"; // Adjusted path assuming CSS is in assets folder

function AddEvent() {
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    venue: "",
    startTime: "",
    endTime: "",
    description: "",
    participationType: "",
    criteria: [],
    coordinators: [],
    attachments: null,
    scanner: null,
  });

  const [facultyNames, setFacultyNames] = useState([]);
  const [selectedCoordinator, setSelectedCoordinator] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFacultyNames = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/events/faculty-names");
        const data = await response.json();
        if (data.success) {
          setFacultyNames(data.facultyNames.map((faculty) => faculty.name));
        }
      } catch (error) {
        console.error("Error fetching faculty names:", error);
        toast.error("Failed to fetch faculty names");
      }
    };

    fetchFacultyNames();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleCriteriaChange = (index, value) => {
    const updatedCriteria = [...formData.criteria];
    updatedCriteria[index] = value;
    setFormData({ ...formData, criteria: updatedCriteria });
  };
  
  const handleAddCoordinator = () => {
    if (selectedCoordinator && !formData.coordinators.includes(selectedCoordinator)) {
      setFormData({ 
        ...formData, 
        coordinators: [...formData.coordinators, selectedCoordinator] 
      });
      setSelectedCoordinator("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate end time is after start time
    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      toast.error("End time must be after start time");
      return;
    }

    const form = new FormData();
    Object.keys(formData).forEach((key) => {
      if (Array.isArray(formData[key])) {
        formData[key].forEach((item) => form.append(key, item));
      } else if (formData[key]) {
        form.append(key, formData[key]);
      }
    });

    try {
      const response = await fetch("http://localhost:5000/api/events/add", {
        method: "POST",
        body: form,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Something went wrong");
      }

      toast.success("Event added successfully!");

      setFormData({
        name: "",
        date: "",
        venue: "",
        startTime: "",
        endTime: "",
        description: "",
        participationType: "",
        criteria: [],
        coordinators: [],
        attachments: null,
        scanner: null,
      });

      navigate("/admin/event-details");
    } catch (error) {
      console.error("Error submitting the form:", error);
      toast.error(`Error: ${error.message}`);
    }
  };

  return (
    <div className="event-page-container">
      <div className="event-sidebar">
        <div className="sidebar-content">
          <h1>Add Event</h1>
          <h2>Campus Connect</h2>
          
          <div className="sidebar-tips">
            <div className="tip-item">
              <FaCalendarPlus className="tip-icon" />
              <div className="tip-text">
                <h4>Best Practices</h4>
                <p>Choose descriptive event names and provide clear instructions to maximize participation.</p>
              </div>
            </div>
            
            <div className="tip-item">
              <FaInfoCircle className="tip-icon" />
              <div className="tip-text">
                <h4>Need Help?</h4>
                <p>Include detailed judging criteria to ensure fair and consistent evaluation.</p>
              </div>
            </div>
            
            <div className="tip-item">
              <FaChartLine className="tip-icon" />
              <div className="tip-text">
                <h4>Did You Know?</h4>
                <p>Events with complete details receive 60% more registrations on average!</p>
              </div>
            </div>
          </div>
          
          <div className="sidebar-image"></div>
        </div>
      </div>
      
      <div className="event-form-container">
        <div className="form-header">
          <h1>Create New Event</h1>
          <p>Fill in the details below to create a new campus event</p>
        </div>
        
        <form onSubmit={handleSubmit} className="event-form">
          <div className="form-section">
            <h3>Basic Information</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Event Name*</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  placeholder="Enter event name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="venue">Event Venue*</label>
                <input 
                  type="text" 
                  id="venue" 
                  name="venue" 
                  placeholder="Enter event venue" 
                  value={formData.venue} 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date">Event Date*</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => {
                    const selectedDate = e.target.value;
                    const today = new Date().toISOString().split("T")[0];

                    if (selectedDate <= today) {
                      toast.error("Please select a future date");
                      e.target.value = "";
                      setFormData({ ...formData, date: "" });
                    } else {
                      setFormData({ ...formData, date: selectedDate });
                    }
                  }}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="participationType">Participation Type*</label>
                <select 
                  id="participationType" 
                  name="participationType" 
                  value={formData.participationType} 
                  onChange={handleChange} 
                  required
                >
                  <option value="">Select type</option>
                  <option value="Individual">Individual</option>
                  <option value="Group">Group</option>
                  <option value="Both">Both</option>
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startTime">Start Time*</label>
                <input 
                  type="time" 
                  id="startTime" 
                  name="startTime" 
                  value={formData.startTime} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="endTime">End Time*</label>
                <input 
                  type="time" 
                  id="endTime" 
                  name="endTime" 
                  value={formData.endTime} 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>
          </div>
          
          <div className="form-section">
            <h3>Event Details</h3>
            
            <div className="form-group full-width">
              <label htmlFor="description">Description & Rules*</label>
              <textarea 
                id="description" 
                name="description" 
                placeholder="Describe your event and list any rules participants should know" 
                value={formData.description} 
                onChange={handleChange} 
                required
              ></textarea>
            </div>
          </div>
          
          <div className="form-section">
            <h3>Judging Criteria</h3>
            
            <div className="criteria-container">
              {formData.criteria.map((criterion, index) => (
                <div key={index} className="criteria-item">
                  <input 
                    type="text" 
                    value={criterion} 
                    onChange={(e) => handleCriteriaChange(index, e.target.value)} 
                    placeholder={`Criterion ${index + 1}`} 
                    required 
                  />
                  <button 
                    type="button" 
                    className="remove-btn" 
                    onClick={() => setFormData({ 
                      ...formData, 
                      criteria: formData.criteria.filter((_, i) => i !== index) 
                    })}
                  >
                    &times;
                  </button>
                </div>
              ))}
              
              {formData.criteria.length === 0 && (
                <p className="empty-message">No criteria added yet</p>
              )}
              
              <button 
                type="button" 
                className="add-btn" 
                onClick={() => setFormData({ 
                  ...formData, 
                  criteria: [...formData.criteria, ""] 
                })}
              >
                + Add Criterion
              </button>
            </div>
          </div>
          
          <div className="form-section">
            <h3>Event Coordinators</h3>
            
            <div className="coordinator-selector">
              <div className="selector-row">
                <select 
                  value={selectedCoordinator}
                  onChange={(e) => setSelectedCoordinator(e.target.value)}
                >
                  <option value="">Select a coordinator</option>
                  {facultyNames.map((faculty, index) => (
                    <option key={index} value={faculty}>{faculty}</option>
                  ))}
                </select>
                <button 
                  type="button" 
                  className="add-btn" 
                  onClick={handleAddCoordinator}
                  disabled={!selectedCoordinator}
                >
                  Add
                </button>
              </div>
              
              <div className="coordinators-list">
                {formData.coordinators.length === 0 ? (
                  <p className="empty-message">No coordinators added yet</p>
                ) : (
                  formData.coordinators.map((coordinator, index) => (
                    <div key={index} className="coordinator-tag">
                      <span>{coordinator}</span>
                      <button 
                        type="button" 
                        onClick={() => setFormData({ 
                          ...formData, 
                          coordinators: formData.coordinators.filter(c => c !== coordinator) 
                        })}
                      >
                        &times;
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          
          <div className="form-section">
            <h3>Files & Attachments</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="attachments">Event Attachments</label>
                <div className="file-input-container">
                  <input 
                    type="file" 
                    id="attachments" 
                    name="attachments" 
                    onChange={handleChange} 
                    accept="image/*,application/pdf" 
                  />
                  <label htmlFor="attachments" className="file-label">
                    {formData.attachments ? formData.attachments.name : "Choose file"}
                  </label>
                </div>
                <small>Upload event flyers, schedules, or supporting documents</small>
              </div>
              
              <div className="form-group">
                <label htmlFor="scanner">Scanner File</label>
                <div className="file-input-container">
                  <input 
                    type="file" 
                    id="scanner" 
                    name="scanner" 
                    onChange={handleChange} 
                    accept="image/*,application/pdf" 
                  />
                  <label htmlFor="scanner" className="file-label">
                    {formData.scanner ? formData.scanner.name : "Choose file"}
                  </label>
                </div>
                <small>Upload QR code scanner or check-in materials</small>
              </div>
            </div>
          </div>
          
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={() => navigate("/admin/event-details")}>
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddEvent;