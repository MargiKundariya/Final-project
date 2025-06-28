import React, { useEffect, useState } from "react";
import axios from "axios";
 // For styling the component

const IDCardDisplay = () => {
  const [idCards, setIDCards] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch ID card details from the backend
    const fetchIDCards = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/id-cards/get", {
          withCredentials: true,
        });

        console.log("ID Cards Response:", response.data);

        // Check if the response contains an array of ID cards
        if (response.data.idCard && response.data.idCard.length > 0) {
          setIDCards(response.data.idCard); // Set all ID cards
        } else {
          setError("No ID cards available.");
        }
      } catch (err) {
        console.error("Error fetching ID cards:", err.response || err.message);
        setError("Failed to fetch ID cards.");
      }
    };

    fetchIDCards();
  }, []);

  if (error) {
    return <p>{error}</p>;
  }

  if (idCards.length === 0) {
    return <p>Loading ID cards...</p>;
  }
  const handleDownload = async (filePath, fileName) => {
    try {
      const response = await axios.get(`http://localhost:5000${filePath}`, {
        responseType: "blob", // Fetch binary data
        withCredentials: true, // Include cookies or authentication headers
      });
  
      // Use FileSaver.js or create a Blob URL to save the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName); // File name for the download
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Error downloading the file:", err);
      alert("Failed to download the file. Please try again.");
    }
  };
  
  

  return (
    <div className="id-card-container">
      {idCards.map((idCard) => (
        <div key={idCard._id} className="id-card-image-container">
          <img
            src={`http://localhost:5000${idCard.filePath}`} // Displaying only the ID card image
            alt={idCard.name}
            className="id-card-image"
          />
          {/* Add a download button below each image */}
          <button
            className="download-btn"
            onClick={() => handleDownload(idCard.filePath, `${idCard.name}_ID.png`)} // Trigger download on click
          >
            Download ID Card
          </button>
        </div>
      ))}
    </div>
  );
};

export default IDCardDisplay;
