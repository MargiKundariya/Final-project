import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Notifications.css'; // Import the CSS file

const Notifications = () => {
  const [pendingParticipations, setPendingParticipations] = useState([]);
  const [error, setError] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios
      .get('http://localhost:5000/api/users/session', { withCredentials: true })
      .then((response) => {
        const { email } = response.data;
        setUserEmail(email);
        fetchPendingParticipations(email);
        setError('');
      })
      .catch((err) => {
        console.error(err);
        // setError('Error fetching session data. Please log in.');
        setLoading(false);
      });
  }, []);

  const fetchPendingParticipations = (email) => {
    axios
      .get(`http://localhost:5000/api/participation/pending?email=${email}`, { withCredentials: true })
      .then((response) => {
        setPendingParticipations(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        // setError('Error fetching notifications');
        setLoading(false);
      });
  };
  const handleResponse = (participationId, status) => {
    axios
      .post('http://localhost:5000/api/participation/response', {
        participationId,
        email: userEmail,
        status,
      }, { withCredentials: true })
      .then(() => {
        setPendingParticipations((prev) =>
          prev.filter((p) => p._id !== participationId)
        );
        toast.success(`You have ${status === 'accepted' ? 'accepted' : 'rejected'} the participation.`);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to process participation. Please try again.');
      });
  };
  

  return (
    <div className="notifications-container">
      <h2 className="notifications-title">Notifications</h2>
      
      {error && error.trim() !== '' && (
        <div className="error-alert">
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="notification-card loading-card">
          <p>Loading notifications...</p>
        </div>
      ) : pendingParticipations.length === 0 ? (
        <div className="notification-card empty-card">
          <p>No pending participations found.</p>
        </div>
      ) : (
        <div className="notifications-list">
          {pendingParticipations.map((participation) => (
            <div key={participation._id} className="notification-card">
              <div className="ncard-header">
                <div className="card-info">
                  <h3 className="event-name">{participation.eventName}</h3>
                  <p className="added-by">Added by: {participation.name}</p>
                </div>
                <span className="status-badge">Pending</span>
              </div>
              
              <div className="card-actions">
                <button
                  className="accept-button"
                  onClick={() => handleResponse(participation._id, 'accepted')}
                >
                  Accept
                </button>
                <button
                  className="reject-button"
                  onClick={() => handleResponse(participation._id, 'rejected')}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;