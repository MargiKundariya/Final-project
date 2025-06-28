import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../assets/css/profile.css";

const Profile = () => {
  const [profile, setProfile] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [participations, setParticipations] = useState([]);
  const [participationsLoading, setParticipationsLoading] = useState(true);

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  };

  // Format event date for display
  const formatEventDate = (date) => {
    if (!date) return "N/A";
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  useEffect(() => {
    // Fetch profile data
    axios
      .get("http://localhost:5000/api/profile", { withCredentials: true })
      .then((response) => {
        const fetchedProfile = response.data;
        setProfile(fetchedProfile);
        setFormData({ ...fetchedProfile, dob: formatDate(fetchedProfile.dob) });
        
        // After getting the profile, fetch participation data
        fetchParticipations(fetchedProfile.email);
      })
      .catch((error) => {
        console.error("Error fetching profile:", error);
        if (error.response?.status === 401) {
          alert("You are not authorized. Please login.");
          window.location.href = "/";
        }
      });
  }, []);

  // Function to fetch user's participations
  const fetchParticipations = (email) => {
    if (!email) {
      setParticipationsLoading(false);
      return;
    }
    
    setParticipationsLoading(true);
    axios
      .get(`http://localhost:5000/api/participation/user?email=${email}`, { withCredentials: true })
      .then((response) => {
        setParticipations(response.data);
        setParticipationsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching participations:", error);
        setParticipationsLoading(false);
      });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSave = async () => {
    const updatedFormData = new FormData();
    Object.keys(formData).forEach((key) => {
      updatedFormData.append(key, formData[key]);
    });
    if (selectedFile) {
      updatedFormData.append("image", selectedFile);
    }

    try {
      const response = await axios.post("http://localhost:5000/api/profile", updatedFormData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfile(response.data);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      if (error.response?.status === 401) {
        alert("You are not authorized. Please login.");
        window.location.href = "/login";
      }
    }
  };

  return (
    <div id="profile-container">
      <div id="profile-header">
      <div id="profile-avatar">
        {profile.imageUrl ? (
          <img id="profile-image" src={`http://localhost:5000${profile.imageUrl}`} alt="Profile" />
        ) : (
          <span>{profile.name ? profile.name.charAt(0).toUpperCase() : "A"}</span>
        )}
      </div>
        <h2 id="profile-name">{profile.name || "Default"}</h2>
        <h6 id="profile-email">{profile.email || "Default Email"}</h6>
      </div>
      <div id="profile-info">
        <div className="profile-field" id="profile-name">
          <label htmlFor="name">Full Name</label>
          <input id="name" type="text" name="name" value={formData.name || ""} onChange={handleChange} disabled={!isEditing} />
        </div><br/>
        <div className="profile-field" id="profile-dob">
          <label htmlFor="dob">Date of Birth</label>
          <input id="dob" type="date" name="dob" value={formData.dob || ""} onChange={handleChange} disabled={!isEditing} />
        </div>
        <div className="profile-field" id="profile-contact">
          <label htmlFor="contact">Phone</label>
          <input id="contact" type="text" name="contact" value={formData.contact || ""} onChange={handleChange} disabled={!isEditing} />
        </div>
        <div className="profile-field" id="profile-address">
          <label htmlFor="address">Address</label>
          <input id="address" type="text" name="address" value={formData.address || ""} onChange={handleChange} disabled={!isEditing} />
        </div>
        <div className="profile-field" id="profile-bloodGroup">
          <label htmlFor="bloodGroup">Blood Group</label>
          <input id="bloodGroup" type="text" name="bloodGroup" value={formData.bloodGroup || ""} onChange={handleChange} disabled={!isEditing} />
        </div>
        <div className="profile-field" id="profile-role">
          <label htmlFor="role">Role</label>
          <input id="role" type="text" name="role" value={formData.role || ""} disabled />
        </div>
        {isEditing && (
          <div className="profile-field" id="profile-image-upload">
            <label htmlFor="image">Profile Picture</label>
            <input id="image" type="file" name="image" onChange={handleFileChange} />
          </div>
        )}
        <div id="profile-buttons">
          {!isEditing ? (
            <button id="edit-btn" onClick={() => setIsEditing(true)}>Edit Profile</button>
          ) : (
            <>
              <button id="save-btn" onClick={handleSave}>Save</button>
              <button id="cancel-btn" onClick={() => { setFormData(profile); setIsEditing(false); }}>Cancel</button>
            </>
          )}
        </div>
      </div>

      {/* User Participations Section
      <div id="user-participations">
        <h3 className="section-title">My Events</h3>
        
        {participationsLoading ? (
          <div className="loading-message">Loading your events...</div>
        ) : participations.length === 0 ? (
          <div className="empty-message">You haven't participated in any events yet.</div>
        ) : (
          <div className="participations-list">
            {participations.map((participation) => (
              <div className="participation-card" key={participation._id}>
                <div className="participation-header">
                  <h4 className="event-name">{participation.eventName}</h4>
                  <span className={`status-badge ${participation.status}`}>
                    {participation.status}
                  </span>
                </div>
                <div className="participation-details">
                  <div className="detail-item">
                    <span className="detail-label">Date:</span>
                    <span className="detail-value">{formatEventDate(participation.eventDate)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Location:</span>
                    <span className="detail-value">{participation.eventLocation || "Not specified"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Organizer:</span>
                    <span className="detail-value">{participation.organizerName || "Unknown"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div> */}
    </div>
  );
};

export default Profile;