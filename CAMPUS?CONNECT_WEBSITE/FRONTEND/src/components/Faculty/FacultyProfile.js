import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/css/facultyProfile.css"; // You'll need to create this CSS file

// Get faculty ID from session storage
const facultyId = sessionStorage.getItem("userId"); // Adjust based on your session storage key

console.log("Faculty ID from session storage:", facultyId);
console.log("Session Storage Data:", sessionStorage);


const FacultyProfile = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  
  // Profile data state
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    department: "",
    gender: "",
    role: "faculty",
  });
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Get faculty ID from session storage
  const facultyId = sessionStorage.getItem("userId"); // Adjust based on your session storage key
  const nameRef = useRef();

  // Fetch faculty data on component mount
  useEffect(() => {
    const fetchFacultyData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`http://localhost:5000/api/users/${facultyId}`, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}` // Adjust based on your auth setup
          }
        });
        
        if (response.status === 200) {
          setProfileData(response.data);
        }
      } catch (error) {
        console.error("Error fetching faculty data:", error);
        toast.error("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    if (facultyId) {
      fetchFacultyData();
    }
  }, [facultyId]);

  useEffect(() => {
    if (isEditing && nameRef.current) {
      nameRef.current.focus();
    }
  }, [isEditing]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.put(
        `http://localhost:5000/api/users/update/${facultyId}`,
        profileData,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`
          }
        }
      );
      
      if (response.status === 200) {
        toast.success("Profile updated successfully!");
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post(
        `http://localhost:5000/api/users/change-password/${facultyId}`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`
          }
        }
      );
      
      if (response.status === 200) {
        toast.success("Password changed successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setPasswordVisible(false);
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Failed to change password. Please try again.");
    }
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const togglePasswordSection = () => {
    setPasswordVisible(!passwordVisible);
  };

  if (isLoading) {
    return <div className="loading">Loading profile data...</div>;
  }

  return (
    <div className="faculty-profile-container">
      <div className="faculty-profile-card">
        <h2>Faculty Profile</h2>
        <form onSubmit={handleProfileSubmit}>
          <input type="text" name="name" value={profileData.name} onChange={handleProfileChange} disabled={!isEditing} ref={nameRef} />
          <input type="email" name="email" value={profileData.email} onChange={handleProfileChange} disabled={!isEditing} />
          <input type="text" name="mobileNumber" value={profileData.mobileNumber} onChange={handleProfileChange} disabled={!isEditing} />
          <button type="button" onClick={toggleEdit}>{isEditing ? "Cancel" : "Edit Profile"}</button>
          {isEditing && <button type="submit">Save Changes</button>}
        </form>
        <div>
          <h3 onClick={togglePasswordSection}>Change Password</h3>
          {passwordVisible && (
            <form onSubmit={handlePasswordSubmit}>
              <input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} />
              <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} />
              <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} />
              <button type="submit">Update Password</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyProfile;
