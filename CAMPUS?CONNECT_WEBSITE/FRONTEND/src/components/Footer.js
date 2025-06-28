import React from "react";
import { FaPhoneAlt, FaCopyright, FaUser } from "react-icons/fa"; // Importing some icons
import "../assets/css/footer.css"; // Import the updated CSS for the footer
import { Link } from 'react-router-dom';
const Footer = () => {
  return (
    <footer id="footer">
      <div className="footer-container">
        <div className="footer-item">
          <h4>Campus Connect</h4>
        </div>
        <div className="footer-item">
          <h4>
            <FaPhoneAlt /> Contact
          </h4>
          <p>Phone: (123) 456-7890</p>
        </div>
        <div className="footer-item">
          <h4>
            <FaUser /> Developed By
          </h4>
          <a href="/connectors.html" target="_blank" rel="noopener noreferrer">Connectors</a>

        </div>
        <div className="footer-item">
          <p>
            <FaCopyright /> 2025 My Awesome Company. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
