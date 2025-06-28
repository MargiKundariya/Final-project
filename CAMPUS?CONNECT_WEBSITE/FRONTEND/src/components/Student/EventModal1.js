import React from 'react';
import { useNavigate } from 'react-router-dom'; // Updated import
import { toast } from 'react-toastify'; // Import toast
import '../../assets/css/modal.css'; // Ensure you have the necessary CSS for styling
import defaultImage from '../../assets/images/slide2.jpeg'; // Import default image

const EventModal = ({ event, onClose }) => {
  const {
    name,
    attachments,
    date,
    venue,
    startTime,
    endTime,
    description,
    criteria,
    participationType,
    coordinators,
  } = event;

  const navigate = useNavigate(); // Updated hook

  const formatDate = (dateString) => {
    const dateObj = new Date(dateString);
    return dateObj.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const imageToShow =
    attachments && attachments.trim() !== '' ? `http://localhost:5000${attachments}` : defaultImage;

  const handleRegisterClick = () => {
    console.log('Register button clicked for event:', name);

    // Conditional navigation based on participationType
    if (participationType === 'group') {
      navigate('/student/registerforteam', { state: { eventName: name, date: date } });
    } else if (participationType === 'both') {
      navigate('/student/registerforteam', { state: { eventName: name, date: date } });
    } else {
      navigate('/student/registerforevent', { state: { eventName: name, date: date } });
    }

  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>
          X
        </button>
        <div className="modal-image">
          <img src={imageToShow} alt={name} />
        </div>
        <h2 className="modal-title">{name}</h2>

        <div className="modal-details">
          <p>
            <strong>Date:</strong>
            <br />
            {formatDate(date)}
          </p>
          <p>
            <strong>Venue:</strong>
            <br />
            {venue}
          </p>
          <p>
            <strong>Start Time:</strong>
            <br />
            {startTime}
          </p>
          <p>
            <strong>End Time:</strong>
            <br />
            {endTime}
          </p>
          <p>
            <strong>Description:</strong>
            <br />
            {description}
          </p>
          <p>
            <strong>Criteria:</strong>
            <br />
            {criteria}
          </p>
          <p>
            <strong>Participation Type:</strong>
            <br />
            {participationType}
          </p>
          <p>
            <strong>Coordinators:</strong>
            <br />
            {coordinators.join(', ')}
          </p>
        </div>

        <div className="modal-footer">
          <button className="register-btn" onClick={handleRegisterClick}>
            Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
