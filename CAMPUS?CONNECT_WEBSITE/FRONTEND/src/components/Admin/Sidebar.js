import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useNavigate } from "react-router-dom";
import {
  faHomeAlt,
  faUsers,
  faCalendarAlt,
  faPlusCircle,
  faChalkboardTeacher,
  faClipboardList,
  faBars,
  faCertificate,
  faSignOutAlt,
  faIdCard,
  faUser,
  faTrophy,
  faChartBar ,
} from "@fortawesome/free-solid-svg-icons";
import logo from "../../assets/images/logo.png";
import "../../assets/css/Sidebar.css";

function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => setIsCollapsed((prev) => !prev);

  const handleLogout = () => {
    sessionStorage.clear(); // Clear session storage
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
          <Link to="/admin/dashboard" className="sidebar-link">
            <FontAwesomeIcon icon={faHomeAlt} />
            {!isCollapsed && <span>Dashboard</span>}
          </Link>
          <Link to="/admin/student-details" className="sidebar-link">
            <FontAwesomeIcon icon={faUsers} />
            {!isCollapsed && <span>Student List</span>}
          </Link>
          <Link to="/admin/event-details" className="sidebar-link">
            <FontAwesomeIcon icon={faCalendarAlt} />
            {!isCollapsed && <span>Event Details</span>}
          </Link>
          <Link to="/admin/add-event" className="sidebar-link">
            <FontAwesomeIcon icon={faPlusCircle} />
            {!isCollapsed && <span>Add Event</span>}
          </Link>
          <Link to="/admin/faculty-details" className="sidebar-link">
            <FontAwesomeIcon icon={faChalkboardTeacher} />
            {!isCollapsed && <span>Faculty Details</span>}
          </Link>
          <Link to="/admin/participants-details" className="sidebar-link">
            <FontAwesomeIcon icon={faClipboardList} />
            {!isCollapsed && <span>Participation List</span>}
          </Link>
          <Link to="/admin/certificate-generation" className="sidebar-link">
            <FontAwesomeIcon icon={faCertificate} />
            {!isCollapsed && <span>Generate Certificate</span>}
          </Link>
          <Link to="/admin/idcard" className="sidebar-link">
            <FontAwesomeIcon icon={faIdCard} />
            {!isCollapsed && <span>Generate ID Card</span>}
          </Link>
          <Link to="/admin/judge" className="sidebar-link">
            <FontAwesomeIcon icon={faUser} />
            {!isCollapsed && <span>Add Judge</span>}
          </Link>
          <Link to="/admin/judgelist" className="sidebar-link">
            <FontAwesomeIcon icon={faUsers} />
            {!isCollapsed && <span>Judge List</span>}
          </Link>
          <Link to="/admin/WinnersTable" className="sidebar-link">
            <FontAwesomeIcon icon={faTrophy} />
            {!isCollapsed && <span>Winners</span>}
          </Link>
          <Link to="/admin/invitation" className="sidebar-link">
            <FontAwesomeIcon icon={faCertificate} />
            {!isCollapsed && <span>Generate invitation</span>}
          </Link>
          <Link to="/admin/reports" className="sidebar-link">
            <FontAwesomeIcon icon={faChartBar} />
            {!isCollapsed && <span>Report</span>}
          </Link>
          {/* Logout Link */}
          <div className="sidebar-link logout" onClick={handleLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} />
            {!isCollapsed && <span>Logout</span>}
          </div>
        </nav>
      </div>
    </div>
  );
}

export default Sidebar;
