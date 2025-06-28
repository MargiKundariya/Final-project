import React from "react";
import "../../assets/css/eventcards.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Base URL for the backend server
const BACKEND_URL = "http://localhost:5000"; 

// Utility to ensure proper URL formatting
const getFullURL = (path) => {
  if (!path) return null;
  const normalizedPath = path.startsWith("/") ? path.substring(1) : path;
  return `${BACKEND_URL}/${normalizedPath}`;
};

// Function to append AM/PM to the existing time
const addAMPM = (time) => {
  if (!time) return "N/A";
  const [hours, minutes] = time.split(":");
  let suffix = "AM";
  if (parseInt(hours) >= 12) {
    suffix = "PM";
  }
  const formattedHour = (parseInt(hours) % 12) || 12; // Convert 24-hour format to 12-hour format
  return `${formattedHour}:${minutes} ${suffix}`;
};

// Function to format the date to YYYY-MM-DD (removing the timezone)
const formatDate = (date) => {
  if (!date) return "N/A";
  const formattedDate = new Date(date).toLocaleDateString();
  return formattedDate;
};

// Function to convert text to Proper Case
const toProperCase = (str) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const EventCards = ({ events, onDelete, onEdit }) => {
  const handleEditClick = (event) => {
    toast.info(`Editing event: ${event.name}`);
    onEdit(event); // Trigger onEdit function
  };

  const handleDeleteClick = (event) => {
    toast.warn(`Deleting event: ${event.name}`);
    onDelete(event); // Trigger onDelete function
  };

  return (
    <div id="event-cards-section">
      <h2 className="event-cards-title">Event Details</h2>
      {events.length > 0 ? (
        <div className="event-cards-container">
          {events.map((event) => (
            <div key={event._id} className="event-card">
              <div className="event-card-header">
                <h3 className="event-name">{event.name}</h3>
                <div className="event-actions">
                  <button
                    className="action-btn edit-btn"
                    onClick={() => handleEditClick(event)}
                    title="Edit Event"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => handleDeleteClick(event)}
                    title="Delete Event"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>

              <div className="event-card-body">
                <div className="event-info-row">
                  <div className="event-info-item">
                    <span className="info-label">Date:</span>
                    <span className="info-value">{formatDate(event.date)}</span>
                  </div>
                  <div className="event-info-item">
                    <span className="info-label">Venue:</span>
                    <span className="info-value">{event.venue || "N/A"}</span>
                  </div>
                </div>

                <div className="event-info-row">
                  <div className="event-info-item">
                    <span className="info-label">Time:</span>
                    <span className="info-value">
                      {`${addAMPM(event.startTime)} - ${addAMPM(event.endTime)}`}
                    </span>
                  </div>
                  <div className="event-info-item">
                    <span className="info-label">Type:</span>
                    <span className="info-value">{event.participationType || "N/A"}</span>
                  </div>
                </div>

                <div className="event-description">
                  <h4>Description & Rules</h4>
                  <div className="scrollable-content">
                    <p>{event.description || "No description available"}</p>
                  </div>
                </div>

                <div className="event-criteria">
                  <h4>Criteria</h4>
                  <p>{event.criteria &&
                    Array.isArray(event.criteria) &&
                    event.criteria.length > 0
                      ? event.criteria.join(", ")
                      : "No criteria"}</p>
                </div>

                <div className="event-coordinators">
                  <h4>Coordinators</h4>
                  <p>
                    {event.coordinators &&
                    Array.isArray(event.coordinators) &&
                    event.coordinators.length > 0
                      ? event.coordinators.join(", ")
                      : "No Coordinators"}
                  </p>
                </div>

                <div className="event-links">
                  {event.attachments && (
                    <a
                      href={getFullURL(event.attachments)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="attachment-link"
                    >
                      <i className="fas fa-file-alt"></i> View Attachment
                    </a>
                  )}
                  {event.scanner && (
                    <a
                      href={getFullURL(event.scanner)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="scanner-link"
                    >
                      <i className="fas fa-qrcode"></i> View Scanner
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-events-message">
          <p>No Events Available</p>
        </div>
      )}
    </div>
  );
};

export default EventCards;