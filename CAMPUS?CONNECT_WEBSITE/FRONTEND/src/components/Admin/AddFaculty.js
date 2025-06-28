import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/css/addFaculty.css"; // Import CSS file

const AddFaculty = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    department: "",
    password: "",
    gender: "",
    role: "faculty",
  });

  const navigate = useNavigate();
  const nameRef = useRef();

  useEffect(() => {
    nameRef.current.focus();
  }, []);

  const handleCancel = () => {
    navigate("/admin/dashboard");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const { name, email, mobileNumber, department, password, gender } = formData;
    
    if (name.trim().length < 3) {
      toast.error("Full name must be at least 3 characters long.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      return false;
    }

    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobileNumber)) {
      toast.error("Mobile number must be exactly 10 digits.");
      return false;
    }

    if (department.trim() === "") {
      toast.error("Department cannot be empty.");
      return false;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return false;
    }

    if (!gender) {
      toast.error("Please select a gender.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return; // Stop submission if validation fails
    }

    try {
      const response = await axios.post("http://localhost:5000/api/faculty/register", formData);
      
      if (response.status === 201) {
        toast.success("Faculty added successfully!");

        // Reset form fields after successful submission
        setFormData({
          name: "",
          email: "",
          mobileNumber: "",
          department: "",
          password: "",
          gender: "",
          role: "faculty",
        });
      }
    } catch (error) {
      console.error("Error adding faculty:", error);
      toast.error("Error adding faculty. Please try again.", { position: toast.POSITION.TOP_CENTER });
    }
  };

  return (
    <div className="add-faculty-container">
      <div className="add-faculty-card">
        <div className="add-faculty-header">
          <h2>Add New Faculty</h2>
          <p>Enter the details of the new faculty member</p>
        </div>
        
        <form onSubmit={handleSubmit} className="add-faculty-form">
          <div className="form-row">
            <div className="form-field">
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
            
            <div className="form-field">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="mobileNumber">Mobile Number</label>
              <input
                type="text"
                id="mobileNumber"
                name="mobileNumber"
                placeholder="Enter mobile number"
                value={formData.mobileNumber}
                onChange={handleChange}
                maxLength="10"
                pattern="[0-9]*"
                required
              />
            </div>
            
            <div className="form-field">
            <label htmlFor="department">Department </label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
              >
                <option value="">Select Department</option>
                <option value="BBA">BBA</option>
                <option value="BCA">BCA</option>
              </select>
            </div>


          </div>

          <div className="form-row">
            <div className="form-field">
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
            
            <div className="form-field">
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
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="role">Role</label>
              <input
                type="text"
                id="role"
                name="role"
                value={formData.role}
                className="readonly-field"
                readOnly
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn" id='addco'>
              Add Faculty
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

export default AddFaculty;
