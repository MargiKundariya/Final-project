import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../assets/css/eventmodal.css';
import defaultImage from '../../assets/images/slide2.jpeg';

const EventModal = ({ event, onClose }) => {
  const { 
    name, 
    description, 
    date,
    startTime,
    endTime,
    venue,
    coordinators,
    attachments,
    criteria,
    participationType
  } = event;
  const navigate = useNavigate();
  const modalRef = useRef();
  
  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    const dateObj = new Date(dateString);
    return dateObj.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  };
  
  // Format full date time function
  const formatDateTime = (dateString, timeString) => {
    if (!dateString) return 'TBD';
    const dateObj = new Date(dateString);
    
    // Set time if provided
    if (timeString) {
      const [hours, minutes] = timeString.split(':');
      dateObj.setHours(parseInt(hours, 10));
      dateObj.setMinutes(parseInt(minutes, 10));
    }
    
    return dateObj.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: 'numeric', 
      minute: 'numeric'
    });
  };

  // Calculate time remaining or time elapsed
  const getTimeStatus = () => {
    if (!date) return { text: 'Date TBD', class: 'neutral' };
    
    const now = new Date();
    const start = new Date(date);
    if (startTime) {
      const [hours, minutes] = startTime.split(':');
      start.setHours(parseInt(hours, 10));
      start.setMinutes(parseInt(minutes, 10));
    }
    
    let end = null;
    if (date && endTime) {
      end = new Date(date);
      const [hours, minutes] = endTime.split(':');
      end.setHours(parseInt(hours, 10));
      end.setMinutes(parseInt(minutes, 10));
    }
    
    // Event has ended
    if (end && now > end) {
      return { text: 'Event has ended', class: 'ended' };
    }
    
    // Event is happening now
    if (now >= start && (!end || now <= end)) {
      return { text: 'Event is happening now', class: 'ongoing' };
    }
    
    // Event is in the future
    const diffTime = Math.abs(start - now);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return { 
        text: `Starts in ${diffDays} day${diffDays !== 1 ? 's' : ''} ${diffHours} hour${diffHours !== 1 ? 's' : ''}`,
        class: 'upcoming'
      };
    } else {
      return { 
        text: `Starts in ${diffHours} hour${diffHours !== 1 ? 's' : ''}`,
        class: 'soon'
      };
    }
  };

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    // Add body class to prevent scrolling
    document.body.classList.add('modal-open');
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.classList.remove('modal-open');
    };
  }, [onClose]);

  // Prevent modal from closing when clicking inside
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  // Calculate attendance percentage
  // const attendancePercentage = maxAttendees && currentAttendees 
  //   ? Math.min(Math.round((currentAttendees / maxAttendees) * 100), 100)
  //   : null;

  // Handle the image URL properly
  const imageUrl = attachments && attachments.trim() !== '' 
    ? `http://localhost:5000${attachments}` 
    : defaultImage;

  const timeStatus = getTimeStatus();

  // Handle register button click
  const handleRegisterClick = () => {
    console.log('Register button clicked for event:', name);

    // Conditional navigation based on participationType
    if (participationType === 'Group') {
      navigate('/student/registerforteam', { state: { eventName: name, date: date } });
    } else if (participationType === 'Both') {
      navigate('/student/registerforboth', { state: { eventName: name, date: date } });
    } else {
      navigate('/student/registerforevent', { state: { eventName: name, date: date } });
    }
  };

  return (
    <div className="event-modal-overlay" onClick={onClose}>
      <div className="event-modal-content" ref={modalRef} onClick={handleModalClick}>
        <button className="event-modal-close" onClick={onClose}>×</button>
        
        <div className="event-modal-image-container">
          <img 
            src={imageUrl} 
            alt={name} 
            className="event-modal-image"
            onError={(e) => (e.target.src = defaultImage)}
          />
          
          <div className={`event-modal-time-status ${timeStatus.class}`}>
            {timeStatus.text}
          </div>
        </div>

        <div className="event-modal-details">
          <h2 className="event-modal-title">{name}</h2>

          <div className="event-modal-info-grid">
            {date && (
              <div className="event-modal-info-item">
                <span className="event-modal-info-label">Date</span>
                <span className="event-modal-info-value">{formatDate(date)}</span>
              </div>
            )}
            
            {startTime && (
              <div className="event-modal-info-item">
                <span className="event-modal-info-label">Start Time</span>
                <span className="event-modal-info-value">
              {new Date(`2000-01-01T${startTime}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
              </span>

              </div>
            )}
            
            {endTime && (
              <div className="event-modal-info-item">
                <span className="event-modal-info-label">End Time</span>
                <span className="event-modal-info-value">
  {new Date(`2000-01-01T${endTime}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
</span>

              </div>
            )}
            
            {venue && (
              <div className="event-modal-info-item">
                <span className="event-modal-info-label">Venue</span>
                <span className="event-modal-info-value">{venue}</span>
              </div>
            )}
            
            {participationType && (
              <div className="event-modal-info-item">
                <span className="event-modal-info-label">Participation Type</span>
                <span className="event-modal-info-value">{participationType}</span>
              </div>
            )}
            
            {coordinators && coordinators.length > 0 && (
              <div className="event-modal-info-item">
                <span className="event-modal-info-label">Coordinators</span>
                <span className="event-modal-info-value">{coordinators.join(', ')}</span>
              </div>
            )}
          </div>

          {/* {(maxAttendees || currentAttendees) && (
            <div className="event-modal-attendance">
              <div className="event-modal-attendance-header">
                <span className="event-modal-attendance-label">Attendance</span>
                <span className="event-modal-attendance-count">
                  {currentAttendees || 0} / {maxAttendees || 'Unlimited'}
                </span>
              </div>
              
              {attendancePercentage !== null && (
                <div className="event-modal-progress-container">
                  <div 
                    className="event-modal-progress-bar" 
                    style={{ width: `${attendancePercentage}%` }}
                  ></div>
                </div>
              )}
            </div>
          )} */}

          {description && (
            <div className="event-modal-description">
              <h3 className="event-modal-section-title">About This Event</h3>
              <p>{description}</p>
            </div>
          )}

          {criteria && (
            <div className="event-modal-description">
              <h3 className="event-modal-section-title">Criteria</h3>
              <p>{criteria.join(', ')}</p>
            </div>
          )}

          {/* {additionalInfo && (
            <div className="event-modal-additional-info">
              <h3 className="event-modal-section-title">Additional Information</h3>
              <p>{additionalInfo}</p>
            </div>
          )} */}

            <div className="event-modal-actions">
            <button 
  className="event-modal-register-button" 
  onClick={handleRegisterClick}
  disabled={['ended', 'ongoing'].includes(timeStatus.class)}
  style={{
    cursor: ['ended', 'ongoing'].includes(timeStatus.class) ? 'not-allowed' : 'pointer',
    opacity: ['ended', 'ongoing'].includes(timeStatus.class) ? 0.5 : 1
  }}
>
  Register
</button>

              <button className="event-modal-close-button" onClick={onClose}>
                Close
              </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default EventModal;