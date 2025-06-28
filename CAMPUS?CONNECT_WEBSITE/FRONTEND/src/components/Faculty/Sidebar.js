import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useNavigate } from "react-router-dom";
import {
  faHomeAlt,
  faUsers,
  faUser,
  faCalendarAlt,
  faPlusCircle,
  faClipboardList,
  faBars,
  faCertificate,
  faSignOutAlt,
  faUserEdit, // Added new icon for profile editing
} from "@fortawesome/free-solid-svg-icons";
import logo from "../../assets/images/logo.png";
import "../../assets/css/Sidebar.css";

function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  
  const toggleSidebar = () => setIsCollapsed((prev) => !prev);
  
  const handleLogout = () => {
    // Clear session storage or call your logout API
    sessionStorage.clear(); // Example: Clearing session storage
    navigate("/"); // Redirect to login page
  };
  
  return (
    <div className="sidebar-wrapper">
      <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
        {/* Sidebar Toggle */}
        <div className="toggle-btn" onClick={toggleSidebar}>
          <FontAwesomeIcon icon={faBars} />
        </div>
        
        {/* Logo Section */}
        <div className="logo-section">
          <img src={logo} alt="Logo" />
          <h4>{!isCollapsed && "Campus Connect"}</h4>
        </div>
        
        {/* Navigation Links */}
        <nav>
          <Link to="/faculty/dashboard" className="sidebar-link">
            <FontAwesomeIcon icon={faHomeAlt} /> {!isCollapsed && <span>Dashboard</span>}
          </Link>
          
          <Link to="/faculty/event-details" className="sidebar-link">
            <FontAwesomeIcon icon={faCalendarAlt} /> {!isCollapsed && <span>Event Details</span>}
          </Link>
          
          <Link to="/faculty/add-event" className="sidebar-link">
            <FontAwesomeIcon icon={faPlusCircle} /> {!isCollapsed && <span>Add Event</span>}
          </Link>
          
          <Link to="/faculty/participations-details" className="sidebar-link">
            <FontAwesomeIcon icon={faClipboardList} /> {!isCollapsed && <span>Attendance List</span>}
          </Link>
          
          <Link to="/faculty/certificate-generation" className="sidebar-link">
            <FontAwesomeIcon icon={faCertificate} /> {!isCollapsed && <span>Generate Certificate</span>}
          </Link>

          <Link to="/change" className="sidebar-link">
            <FontAwesomeIcon icon={faUserEdit} /> {!isCollapsed && <span>Change Password</span>}
          </Link>
          
          {/* Logout Link */}
          <div className="sidebar-link logout" onClick={handleLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} /> {!isCollapsed && <span>Logout</span>}
          </div>
        </nav>
      </div>
    </div>
  );
}

export default Sidebar;