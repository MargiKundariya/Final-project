import React from 'react';
import '../../assets/css/scannerModal.css';
import defaultImage from '../../assets/images/download.jpeg'; // Fallback image

const ScannerModal = ({ scanner, onClose }) => {
  // Construct the correct image URL + cache-buster
  const imageToShow =
    scanner && scanner.trim() !== ''
      ? `http://localhost:5000${scanner}?t=${new Date().getTime()}` // Add a timestamp to prevent caching
      : defaultImage;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>X</button>
        <h2>Event Scanner</h2>

        <div className="modal-image">
          <img src={imageToShow} alt="Scanner" className='scanner' onError={(e) => (e.target.src = defaultImage)}/>
        </div>

        {scanner && scanner.trim() !== '' && (
          <p>
            <a href={imageToShow} target="_blank" rel="noopener noreferrer">
              Open Scanner Image
            </a>
          </p>
        )}
      </div>
    </div>
  );
};

export default ScannerModal;
