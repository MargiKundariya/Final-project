import React from 'react';
import Profile from './Profile'; // Import your Profile component
import IDCardDisplay from './IDCardDisplay';
import ParticipatedEvents from './ParticipatedEvents';
import '../../assets/css/mainprofile.css'; // Import the CSS file
import { FiUser, FiCreditCard, FiCheckCircle } from 'react-icons/fi'; // Import icons from react-icons

function MainProfile() {
  return (
    <div id="main-container">
      {/* Profile Section */}
      <div id="profile-card">
        <h5 className="card-heading">
          <FiUser className="card-icon" /> {/* Profile Icon */}
          Profile
        </h5>
        <Profile />
      </div>

      {/* Main Content Section */}
      <div id="main-content">
        {/* ID Card Component */}
        <div id="idcard-card">
          <h5 className="card-heading">
            <FiCreditCard className="card-icon" /> {/* ID Card Icon */}
            Id Card
          </h5>
          <IDCardDisplay />
        </div>
        
        {/* Participated Events Component */}
        <div id="participated-events">
          <h5 className="card-heading">
            <FiCheckCircle className="card-icon" /> {/* Events Icon */}
            Participated Events
          </h5>
          <ParticipatedEvents />
        </div>
      </div>
    </div>
  );
}

export default MainProfile;