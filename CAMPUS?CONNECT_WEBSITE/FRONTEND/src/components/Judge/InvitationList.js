import React, { useEffect, useState } from "react";
import axios from "axios";

const InvitationList = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/invitations", {
          withCredentials: true,
        });
        setInvitations(response.data);
      } catch (err) {
        // setError("Failed to load invitations. Please try again.");
        console.error("Error fetching invitations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInvitations();
  }, []);

  // Function to handle image download
  const handleDownload = async (imageUrl, fileName) => {
    try {
      const response = await axios.get(`http://localhost:5000${imageUrl}`, {
        responseType: "blob",
        withCredentials: true,
      });

      const blob = new Blob([response.data], { type: "image/png" });
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Error downloading the invitation.");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Your Invitations</h2>

      {loading && <p style={styles.loading}>Loading invitations...</p>}
      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.grid}>
        {invitations.length > 0 ? (
          invitations.map((invitation) => (
            <div key={invitation._id} style={styles.card}>
              <img
                src={`http://localhost:5000${invitation.invitationImage}`}
                alt="Invitation"
                style={styles.image}
                onError={(e) => (e.target.src = "/fallback-image.png")} // Fallback in case of error
              />
              <h3 style={styles.eventName}>{invitation.eventName}</h3>
              <p style={styles.details}>
                📅 Date: <strong>{invitation.eventDate}</strong>
              </p>
              <p style={styles.details}>
                ⏰ Time: <strong>{invitation.eventTime}</strong>
              </p>
              <button
                style={styles.downloadButton}
                onClick={() =>
                  handleDownload(invitation.invitationImage, `${invitation.eventName}_Invitation.png`)
                }
              >
                Download Invitation
              </button>
            </div>
          ))
        ) : (
          !loading && <p style={styles.noData}>No invitations found.</p>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    textAlign: "center",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f4f4f4",
    minHeight: "100vh",
  },
  heading: {
    fontSize: "28px",
    color: "#333",
    marginBottom: "20px",
  },
  loading: {
    fontSize: "18px",
    color: "#555",
  },
  error: {
    fontSize: "18px",
    color: "red",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
    justifyContent: "center",
    padding: "10px",
  },
  card: {
    backgroundColor: "white",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    borderRadius: "10px",
    padding: "15px",
    textAlign: "center",
    transition: "transform 0.3s ease-in-out",
  },
  image: {
    width: "15%",
    borderRadius: "10px",
    maxHeight: "250px",
    objectFit: "cover",
  },
  eventName: {
    fontSize: "22px",
    color: "#2c3e50",
    margin: "10px 0",
  },
  details: {
    fontSize: "16px",
    color: "#555",
    margin: "5px 0",
  },
  downloadButton: {
    display: "inline-block",
    marginTop: "10px",
    padding: "10px 15px",
    fontSize: "14px",
    color: "white",
    backgroundColor: "#007BFF",
    border: "none",
    cursor: "pointer",
    borderRadius: "5px",
    transition: "background 0.3s",
  },
  noData: {
    fontSize: "18px",
    color: "#777",
  },
};

export default InvitationList;
