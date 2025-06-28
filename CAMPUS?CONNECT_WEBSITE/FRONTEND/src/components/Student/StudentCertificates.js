import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaCertificate } from "react-icons/fa"; // Import the certificate icon
import "../../assets/css/studentcertificates.css"; // Import the new CSS file

const StudentCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/certificate", {
          withCredentials: true,
        });
        console.log("Certificates fetched:", response.data); // Debug API response
        setCertificates(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch certificates");
        setLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  const handleDownload = async (imageUrl, fileName) => {
    if (!imageUrl || typeof imageUrl !== "string") {
      console.error("Invalid image URL:", imageUrl);
      alert("Invalid image URL for download.");
      return;
    }

    try {
      const url = `http://localhost:5000${imageUrl}`; // Construct the full URL
      const response = await axios.get(url, {
        responseType: "blob", // Fetch binary data
        withCredentials: true,
      });

      // Create a download link and trigger download
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", fileName); // Use fileName for the download
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Error downloading the image:", err);
      alert("Failed to download the image. Please try again.");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div id="certificates-container">
      <h5 id="certificates-heading">
        <FaCertificate className="card-icon" /> {/* Certificate Icon */}
        Certificates
      </h5>
      {certificates.length === 0 ? (
        <p>No certificates found.</p>
      ) : (
        <div>
          {certificates.map((certificate) => (
            <div id="certificate-card" key={certificate._id}>
              <div className="card-heading">
                <h3>{certificate.courseTitle}</h3>
              </div>
              <div className="card-body">
                <p>
                  <strong>Recipient Name:</strong> {certificate.recipientName}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(certificate.date).toLocaleDateString()}
                </p>
                <p>
                  <strong>Event Name:</strong> {certificate.eventName}
                </p>
                <img
                  src={`http://localhost:5000${certificate.imageUrl}`}
                  alt="Certificate"
                />
                <br/>
                <button
                  className="download-btn"
                  onClick={() =>
                    handleDownload(certificate.imageUrl, `${certificate.courseTitle}_Certificate.png`)
                  }
                >
                  Download Certificate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentCertificates;
