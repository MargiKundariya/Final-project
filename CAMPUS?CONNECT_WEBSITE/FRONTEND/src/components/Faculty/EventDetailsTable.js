import React from "react";
import "../../assets/css/eventdetailstable.css";
import { toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Base URL for the backend server
const BACKEND_URL = "http://localhost:5000"; // Replace this if your backend is hosted elsewhere

// Utility to ensure proper URL formatting
const getFullURL = (path) => {
  const normalizedPath = path.startsWith("/") ? path.substring(1) : path;
  return `${BACKEND_URL}/${normalizedPath}`;
};

// Function to append AM/PM to the existing time
const addAMPM = (time) => {
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

const EventDetailsTable = ({ events, onDelete, onEdit }) => {
  const handleEditClick = (event) => {
    toast.info(`Editing event: ${event.name}`);
    onEdit(event); // Trigger onEdit function
  };

  const handleDeleteClick = (event) => {
    toast.warn(`Deleting event: ${event.name}`);
    onDelete(event); // Trigger onDelete function
  };

  return (
    <>
      <h2 className="table-title">Event Details</h2>
      {events.length > 0 ? (
        <table className="event-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Date</th>
              <th>Venue</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Description</th>
              <th>Criteria</th>
              <th>Participation Type</th>
              <th>Coordinators</th>
              <th>Attachment</th>
              <th>Scanner</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event._id}>
                <td>{event.name}</td>
                <td>{formatDate(event.date)}</td>
                <td>{event.venue}</td>
                <td>{event.startTime ? addAMPM(event.startTime) : "N/A"}</td>
                <td>{event.endTime ? addAMPM(event.endTime) : "N/A"}</td>
                <div className="scrollable">
                <td>{event.description}</td>
                </div>
                <td>{event.criteria}</td>
                <td>{event.participationType}</td>
                <td>
                  {event.coordinators &&
                  Array.isArray(event.coordinators) &&
                  event.coordinators.length > 0
                    ? event.coordinators.join(", ") // Join multiple coordinator names
                    : "No Coordinators"}
                </td>
                <td>
                  {event.attachments ? (
                    <a
                      href={getFullURL(event.attachments)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Attachment
                    </a>
                  ) : (
                    "No Attachment"
                  )}
                </td>
                <td>
                  {event.scanner ? (
                    <a
                      href={getFullURL(event.scanner)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Scanner
                    </a>
                  ) : (
                    "No Scanner"
                  )}
                </td>
                <td>
                  <div className="button-container">
                    <button
                      id="eedit-btn"
                      className="action-btn"
                      onClick={() => handleEditClick(event)}
                      title="Edit Event"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      id="delete-btn"
                      className="action-btn"
                      onClick={() => handleDeleteClick(event)}
                      title="Delete Event"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="no-events-message">
          <p>No Events Available</p>
        </div>
      )}
    </>
  );
};

export default EventDetailsTable;
