import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../../assets/css/snavbar.css';
import logo from '../../assets/images/logo.png';
import axios from 'axios';

const SNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const navigate = useNavigate(); // Define navigate here

  const handleLogout = () => {
    // Clear session storage or call your logout API
    sessionStorage.clear(); // Example: Clearing session storage
    navigate("/"); // Redirect to login page
  };
  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const sessionResponse = await axios.get('http://localhost:5000/api/users/session', {
          withCredentials: true, // Ensure cookies are sent
        });
  
        const email = sessionResponse.data?.email;
        if (!email) {
          console.log('No email found in session API response');
          return;
        }
  
        console.log(`User email from session: ${email}`);
  
        // Now fetch notifications using the email
        fetchNotificationCount(email);
      } catch (error) {
        console.error('Error fetching user session:', error);
      }
    };
  
    const fetchNotificationCount = async (email) => {
      try {
        console.log(`Fetching notifications for: ${email}`);
  
        const response = await axios.get(`http://localhost:5000/api/participation/notifications/count?email=${email}`, {
          withCredentials: true,
        });
  
        console.log('API Response:', response.data);
  
        setNotificationCount(response.data.count);
      } catch (error) {
        console.error('Error fetching notification count:', error);
      }
    };
  
    fetchUserEmail();
    const interval = setInterval(fetchUserEmail, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);
  
  

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav id="navbar" className={scrolled ? 'scrolled' : ''}>
      <div id="logo">
        <img src={logo} alt="Logo" />
        <span>Campus Connect</span>
      </div>
      <ul id="nav-links">
        <li><NavLink to="/student/home" id="nav-item">Home</NavLink></li>
        <li><NavLink to="/student/dashboardcontainer" id="nav-item">Dashboard</NavLink></li>
        <li><NavLink to="/student/profile" id="nav-item">Profile</NavLink></li>
        <li><NavLink to="/student/certificate" id="nav-item">Achievements</NavLink></li>
        <li><NavLink to="/student/notifications" id="nav-item"> Notifications {notificationCount > 0 && <span className="notif-badge">{notificationCount}</span>}</NavLink></li>
        <li><NavLink to="/change" id="nav-item"> Change Password</NavLink></li>
        <li><NavLink to="/" onClick={handleLogout} id="nav-item">Logout</NavLink></li>
      </ul>
    </nav>
  );
};

export default SNavbar;
