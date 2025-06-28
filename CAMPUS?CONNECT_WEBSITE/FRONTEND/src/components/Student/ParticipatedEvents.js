import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../assets/css/participatedEvents.css";

const ParticipatedEvents = () => {
  const [participations, setParticipations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentName, setStudentName] = useState("");
  const [totalEvents, setTotalEvents] = useState(0);
  useEffect(() => {
    (async () => {
      try {
        const sessionResponse = await axios.get("http://localhost:5000/api/users/session", {
          withCredentials: true,
        });
  
        if (sessionResponse.data && sessionResponse.data.name) {
          const name = sessionResponse.data.name;
          setStudentName(name);
  
          const participationsResponse = await axios.get(
            `http://localhost:5000/api/participation/user?name=${encodeURIComponent(name)}`,
            { withCredentials: true }
          );
  
          console.log("Participations data:", participationsResponse.data);
  
          if (participationsResponse.data && participationsResponse.data.success) {
            const filteredParticipations = participationsResponse.data.participations.filter(event => {
              const isMyEvent = event.name.trim().toLowerCase() === name.trim().toLowerCase();
              const teamMembers = event.team_members || [];
            
              // ✅ CASE 1: I created the event
              if (isMyEvent) {
                // Show it if no team members OR none are pending
                const hasPendingMember = teamMembers.some(member => member.status === "pending");
                return teamMembers.length === 0 || !hasPendingMember;
              }
            
              // ✅ CASE 2: I am a team member
              const myMembership = teamMembers.find(
                member => member.name.trim().toLowerCase() === name.trim().toLowerCase()
              );
              if (!myMembership) return false;
            
              return myMembership.status === "accepted";
            });
            
            setParticipations(filteredParticipations);
            setTotalEvents(filteredParticipations.length);
          }
  
          setLoading(false);
        } else {
          throw new Error("User session not found");
        }
      } catch (err) {
        console.error("Error fetching data:", err.response || err.message);
        setError(err.response?.data?.message || "Failed to fetch participations.");
        setLoading(false);
      }
    })();
  }, []); // ✅ Still keep empty dependency array
  

  // ✅ Single function definition
  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";

    const parsedDate = new Date(dateString);
    if (isNaN(parsedDate.getTime())) return "Invalid date"; // Handle invalid dates

    return parsedDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return <div className="loading-container">Loading your events...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="participated-events-container">
      <h2 className="page-title">My Events</h2>
      <div className="total-events">
        <p><strong>Total Participated Events:</strong> {totalEvents}</p>
      </div>

      {participations.length === 0 ? (
        <div className="no-events-container">
          <p>You haven't participated in any events yet.</p>
        </div>
      ) : (
        <div className="events-grid">
          {participations.map((event) => (
            <div key={event._id} className="event-card">
              <div className="event-header">
                <h3 className="event-name" id="event-name">{event.eventName || "Unnamed Event"}</h3>
              </div>

              <div className="event-details">
                <div className="detail-row">
                <span className="detail-label">
                {(
                  event.team_members?.some(
                    member => member.name.trim().toLowerCase() === studentName.trim().toLowerCase()
                  ) && event.name.trim().toLowerCase() !== studentName.trim().toLowerCase()
                )
                  ? "Added by:"
                  : "Name:"}

                  </span>

                  <span className="detail-value">{event.name}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Date:</span>
                  <span className="detail-value">{formatDate(event.date)}</span> 
                </div>
                <div className="detail-row">
                  <span className="detail-label">Score:</span>
                  <span className="detail-value">{event.marks}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ParticipatedEvents;
