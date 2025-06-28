import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ScannerModal from './ScannerModal';
import '../../assets/css/registerforevent.css';

const RegisterForEvent = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { eventName, date: rawDate, scanner } = location.state || {};
  const formattedDate = rawDate
    ? new Date(rawDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  const [participationData, setParticipationData] = useState({
    name: '',
    department: '',
    course: '',
    year: '',
    contactNumber: '',
  });

  const [showScannerModal, setShowScannerModal] = useState(false);

  // Fetch session name
  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/users/session', { withCredentials: true });
        if (response.data && response.data.name) {
          setParticipationData((prevState) => ({
            ...prevState,
            name: response.data.name, // Auto-fill name
          }));
        }
      } catch (error) {
        console.error('Error fetching session data:', error);
        toast.error('Failed to fetch user session.');
      }
    };

    fetchSessionData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
  
    if (name === 'contactNumber') {
      // Allow only digits while typing
      if (!/^\d*$/.test(value)) {
        return;
      }
      // Limit to 10 digits
      if (value.length > 10) {
        return;
      }
    }
  
    setParticipationData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Validate contact number
    if (!/^\d{10}$/.test(participationData.contactNumber)) {
      toast.error('Contact number must be exactly 10 digits.');
      return;
    }
  
    try {
      const response = await axios.post('http://localhost:5000/api/participation/addsingle', {
        ...participationData,
        eventName,
        date: rawDate,
      });
  
      if (response.status === 201) {
        toast.success('Registration successful!');
        setTimeout(() => {
          setShowScannerModal(true);
        }, 500);
      } else {
        toast.error('Registration failed!');
      }
    } catch (error) {
      console.error('Error registering for event:', error.response || error.message);
      toast.error('Registration failed: ' + (error.response?.data?.message || error.message));
    }
  };
  
  const handleCancel = () => {
    navigate('/student/dashboardcontainer');
  };

  const closeScannerModal = () => {
    setShowScannerModal(false);
    navigate('/student/dashboardcontainer');
  };

  return (
    <div className="register-card-container" id="register-card-container">
      <div className="register-card-header">
        <h2>Register for Event</h2>
        <div className="event-info-badges">
          <span className="event-badge">{eventName || 'Event'}</span>
          <span className="date-badge">{formattedDate || 'Date TBD'}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="registration-card-form">
        {/* Event Info Card */}
        <div className="card event-info-card">
          <div className="card-header">
            <h3>Event Information</h3>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label htmlFor="eventName">Event Name</label>
              <input
                type="text"
                id="eventName"
                name="eventName"
                value={eventName || ''}
                disabled
                autoComplete="off"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="eventDate">Event Date</label>
              <input
                type="text"
                id="eventDate"
                name="date"
                value={formattedDate}
                disabled
                autoComplete="off"
                className="form-control"
              />
            </div>
          </div>
        </div>

        {/* Personal Info Card */}
        <div className="card personal-info-card">
          <div className="card-header">
            <h3>Personal Information</h3>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={participationData.name}
                disabled // Prevent manual editing
                autoComplete="off"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="department">Department</label>
              <select
                id="department"
                name="department"
                value={participationData.department}
                onChange={handleInputChange}
                required
                className="form-control"
              >
                <option value="">Select Department</option>
                <option value="BBA">BBA</option>
                <option value="BCA">BCA</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="year">Year</label>
              <select
                id="year"
                name="year"
                value={participationData.year}
                onChange={handleInputChange}
                required
                className="form-control"
              >
                <option value="">Select Year</option>
                <option value="1st">1st</option>
                <option value="2nd">2nd</option>
                <option value="3rd">3rd</option>
              </select>
            </div>

            {/* <div className="form-group">
              <label htmlFor="year">Year</label>
              <input
                type="text"
                id="year"
                name="year"
                value={participationData.year}
                onChange={handleInputChange}
                required
                placeholder="(ex:1st)"
                autoComplete="off"
                className="form-control"
              />
            </div> */}

            <div className="form-group">
              <label htmlFor="contactNumber">Contact Number</label>
              <input
                type="text"
                id="contactNumber"
                name="contactNumber"
                value={participationData.contactNumber}
                onChange={handleInputChange}
                required
                autoComplete="off"
                className="form-control"
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn">
            Register
          </button>
          <button type="button" className="cancel-btn" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </form>

      {showScannerModal && <ScannerModal scanner={scanner} onClose={closeScannerModal} />}
    </div>
  );
};

export default RegisterForEvent;
