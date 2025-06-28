import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../../assets/css/snavbar.css';
import logo from '../../assets/images/logo.png';

const SNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate(); // Define navigate here

  const handleLogout = () => {
    // Clear session storage or call your logout API
    sessionStorage.clear(); // Example: Clearing session storage
    navigate("/"); // Redirect to login page
  };

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
      <li><NavLink to="/judge/invitation" id="nav-item">Invitations</NavLink></li>
      <li><NavLink to="/judge/participation" id="nav-item">Participation</NavLink></li>
      <li><NavLink to="/" onClick={handleLogout} id="nav-item">Logout</NavLink></li>
      </ul>
    </nav>
  );
};

export default SNavbar;
