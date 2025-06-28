import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../assets/css/editfaculty.css';
import logo from '../../assets/images/editfaculty.jpg';

const EditFaculty = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { member } = location.state;

  const [editedFaculty, setEditedFaculty] = useState({
    name: member.name,
    department: member.department,
    mobileNumber: member.mobileNumber,
    email: member.email,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedFaculty((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.put(`http://localhost:5000/api/faculty/${member._id}`, editedFaculty);
      console.log('Updated Faculty:', response.data);
      toast.success('Faculty details updated successfully!');
      setTimeout(() => navigate('/admin/faculty-details'), 2000);
    } catch (error) {
      console.error('Error updating faculty:', error.message);
      toast.error('Failed to update faculty details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/faculty-details');
  };

  return (
    <div className="edit-faculty-container">
      <div className="edit-faculty-card">
        <div className="edit-faculty-header">
          <img src={logo} alt="Faculty Logo" className="faculty-logo" />
          <h1>Edit Faculty Details</h1>
        </div>
        
        <form onSubmit={handleSave}>
          <div className="input-row">
            <div className="input-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={editedFaculty.name}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="Enter full name"
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="department">Department</label>
              <input
                type="text"
                id="department"
                name="department"
                value={editedFaculty.department}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="Enter department"
              />
            </div>
          </div>
          
          <div className="input-row">
            <div className="input-group">
              <label htmlFor="mobileNumber">Mobile Number</label>
              <input
                type="text"
                id="mobileNumber"
                name="mobileNumber"
                value={editedFaculty.mobileNumber}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="Enter mobile number"
                pattern="[0-9]{10}"
                title="Please enter a valid 10-digit mobile number"
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={editedFaculty.email}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="Enter email address"
              />
            </div>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn" id='addco' disabled={loading}>
              {loading ? (
                <span className="loading-spinner"></span>
              ) : (
                'Save Changes'
              )}
            </button>
            <button type="button" id='removeco' onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditFaculty;