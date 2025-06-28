import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../assets/css/facultyForm.css';

const FacultyAdd = () => {
  const [formData, setFormData] = useState({
    name: '',
    mobileNumber: '',
    department: '',
    email: '',
    password: '',
    gender: '',
    role: '',
  });

  const navigate = useNavigate();
  const nameRef = useRef();

  useEffect(() => {
    nameRef.current.focus();
  }, []);


  const handleChange = (e) => {
    const { name, value } = e.target;
  
    if (name === "mobileNumber") {
      if (!/^\d*$/.test(value)) {
        toast.error("Mobile number must contain only digits.");
        return;
      }
      if (value.length > 10) {
        toast.error("Mobile number must be exactly 10 digits.");
        return;
      }
    }
  
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, mobileNumber, department, email, password, gender, role } = formData;
    if (!name || !mobileNumber || !department || !email || !password || !gender || !role) {
      toast.error('Please fill in all required fields.');
      return;
    }
    if (!/^\d{10}$/.test(mobileNumber)) {
      toast.error("Mobile number must be exactly 10 digits.");
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/faculty/register', formData);
      toast.success('Faculty registered successfully!');
      setTimeout(() => navigate('/admin/faculty-details'), 2000); // Navigate after a delay
    } catch (error) {
      const errorMsg = error.response ? error.response.data.message : 'Error registering faculty';
      toast.error(errorMsg);
    }
  };

  const handleCancel = () => {
    navigate('/admin/faculty-details');
  };

  return (
    <div className="form-wrapper" id="form-wrapper">
      {/* <ToastContainer /> */}
      <div className="form-container" id="form-container">
        <h3>Add Faculty</h3>
        <div className="form-content" id="form-content">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter full name"
                value={formData.name}
                onChange={handleChange}
                ref={nameRef}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="mobileNumber">Mobile Number</label>
              <input
                type="text"
                id="mobileNumber"
                name="mobileNumber"
                placeholder="Enter mobile number"
                value={formData.mobileNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="department">Department</label>
              <input
                type="text"
                id="department"
                name="department"
                placeholder="Enter department"
                value={formData.department}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="role">Role</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="">Select Role</option>
                <option value="Admin">Admin</option>
                <option value="faculty">Faculty</option>
              </select>
            </div>
            <div className="form-group text-center">
              <button type="submit" className="btn" id="addevent">
                ADD FACULTY
              </button>
              <button type="button" className="btn" id="removebtn" onClick={handleCancel}>
                CANCEL
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FacultyAdd;
