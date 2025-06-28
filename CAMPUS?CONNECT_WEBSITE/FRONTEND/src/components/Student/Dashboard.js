import React, { useState, useEffect } from 'react';
import '../../assets/css/dashboard.css';
import logo from '../../assets/css/slide2.jpeg';
import EventModal from './EventModal';
import axios from 'axios';

const Dashboard = ({ event, filter }) => {
  const { name, description, startDate, endDate, location, attachments, status } = event;
  const [showModal, setShowModal] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const fetchLikeStatus = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/like/status/${event._id}`, { withCredentials: true });
        setIsLiked(response.data.liked);
      } catch (error) {
        console.error('Error fetching like status:', error);
      }
    };

    fetchLikeStatus();
  }, [event._id]);

  const handleModalToggle = () => setShowModal(!showModal);

  const imageUrl = attachments ? `http://localhost:5000${attachments}` : logo;

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    const options = { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const handleLikeToggle = async (e) => {
    e.stopPropagation();
    const newLikeStatus = !isLiked;
    setIsLiked(newLikeStatus);

    try {
      await axios.post('http://localhost:5000/api/like', {
        eventId: event._id,
        liked: newLikeStatus,
      }, { withCredentials: true });
    } catch (error) {
      console.error('Error updating like status:', error);
    }
  };

  const isCompleted = filter === 'completed' || event?.status === 'completed';

  return (
    <>
      <div className="event-card" style={{ position: 'relative' }}>
        {/* Show "Completed" header */}
        {isCompleted && (
  <div
  style={{
    
      position: 'absolute',
      top: '10px',
      right: '10px',
      backgroundColor: '#22c55e', // A slightly more modern green
      color: 'white',
      fontWeight: 'bold',
      padding: '8px 16px',
      borderRadius: '6px',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
      zIndex: 10,
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    
  }}
  >
    ✔ Completed
  </div>
)}

        <div className="event-card-image-container">
          <img
            src={imageUrl}
            alt={name}
            className="event-card-image"
            onError={(e) => (e.target.src = logo)}
          />
        </div>

        <div className="event-card-content">
          <h3 className="event-card-title">{name}</h3>
          <p className="event-card-description">{description || 'No description available'}</p>

          <div className="event-card-details">
            {startDate && <div className="event-card-detail"><span>📅</span> {formatDate(startDate)}</div>}
            {endDate && <div className="event-card-detail"><span>🕒</span> {formatDate(endDate)}</div>}
            {location && <div className="event-card-detail"><span>📍</span> {location}</div>}
          </div>

          <div className="event-card-actions">
            <button className={`event-card-like-button ${isLiked ? 'liked' : ''}`} onClick={handleLikeToggle}>
              {isLiked ? '❤️ Liked' : '🤍 Like'}
            </button>
            <button className="event-card-more-button" onClick={handleModalToggle}>
              View Details
            </button>
          </div>
        </div>
      </div>

      {showModal && <EventModal event={event} onClose={handleModalToggle} />}
    </>
  );
};

export default Dashboard;
