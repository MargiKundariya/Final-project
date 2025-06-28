import React, { useState,useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ScannerModal from './ScannerModal';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../assets/css/registerforevent.css';

const RegisterForBoth = () => {
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
    team_name: '',
    team_members: [],
  });
  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/users/session', { withCredentials: true });
        console.log('Session response:', response.data); // Debugging step
  
        if (response.data && response.data.name) {
          setParticipationData((prevState) => ({
            ...prevState,
            name: response.data.name,
            email: response.data.email, // Auto-fill name from session
          }));
        } else {
          console.warn('No name found in session');
        }
      } catch (error) {
        console.error('Error fetching session data:', error);
        toast.error('Failed to fetch user session.');
      }
    };
  
    fetchSessionData();
  }, []);
  

  const [newMember, setNewMember] = useState({ name: '', email: '' });
  const [showScannerModal, setShowScannerModal] = useState(false);

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
  
  const handleMemberInputChange = (e) => {
    const { name, value } = e.target;
    setNewMember((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const addTeamMember = () => {
    if (!newMember.name || !newMember.email) {
      toast.error('Please provide both name and email for the team member.');
      return;
    }

    setParticipationData((prevState) => ({
      ...prevState,
      team_members: [...prevState.team_members, newMember],
    }));
    setNewMember({ name: '', email: '' });
    toast.success('Team member added successfully!');
  };

  const removeTeamMember = (index) => {
    setParticipationData((prevState) => ({
      ...prevState,
      team_members: prevState.team_members.filter((_, i) => i !== index),
    }));
    toast.info('Team member removed!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!participationData.name || !participationData.department || !participationData.year || !participationData.contactNumber) {
      toast.error('Please fill in all required fields!');
      return;
    }
     if (!/^\d{10}$/.test(participationData.contactNumber)) {
          toast.error('Contact number must be exactly 10 digits.');
          return;
        }
      

    try {
      const response = await axios.post('http://localhost:5000/api/participation/add', {
        ...participationData,
        eventName,
        date: rawDate,
      });

      if (response.status === 201) {
        toast.success('Registration successful!');
        setShowScannerModal(true);
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
    <div className="register-card-container">
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
            <label htmlFor="email">email</label>
              <input
                type="text"
                id="email"
                name="email"
                value={participationData.email}
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

        {/* Team Info Card */}
        <div className="card team-info-card">
          <div className="card-header">
            <h3>Team Information</h3>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label htmlFor="team_name">Team Name</label>
              <input
                type="text"
                id="team_name"
                name="team_name"
                value={participationData.team_name}
                onChange={handleInputChange}
                required
                autoComplete="off"
                className="form-control"
              />
            </div>

            <div className="team-members-section">
              <h4>Team Members</h4>
              <div className="team-members-list">
                {participationData.team_members.length > 0 ? (
                  participationData.team_members.map((member, index) => (
                    <div key={index} className="team-member-card">
                      <div className="member-info">
                        <span className="member-name">{member.name}</span>
                        <span className="member-email">{member.email}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeTeamMember(index)}
                        className="remove-member-btn"
                      >
                        ×
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="no-members-message">No team members added yet</div>
                )}
              </div>

              <div className="add-member-section">
                <div className="add-member-inputs">
                  <input
                    type="text"
                    id="memberName"
                    name="name"
                    placeholder="Member Name"
                    value={newMember.name}
                    onChange={handleMemberInputChange}
                    autoComplete="off"
                    className="form-control"
                  />
                  <input
                    type="email"
                    id="memberEmail"
                    name="email"
                    placeholder="Member Email"
                    value={newMember.email}
                    onChange={handleMemberInputChange}
                    autoComplete="off"
                    className="form-control"
                  />
                </div>
                <button type="button" onClick={addTeamMember} className="add-member-btn">
                  Add Member
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn">Register</button>
          <button type="button" className="cancel-btn" onClick={handleCancel}>Cancel</button>
        </div>
      </form>

      {showScannerModal && (
        <ScannerModal
          scanner={scanner}
          onClose={closeScannerModal}
        />
      )}
    </div>
  );
};

export default RegisterForBoth;