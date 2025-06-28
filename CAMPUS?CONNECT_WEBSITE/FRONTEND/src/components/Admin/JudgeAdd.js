import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../assets/css/judgeAdd.css';

const JudgeAdd = () => {
  const [formData, setFormData] = useState({
    name: '',
    mobileNumber: '',
    department: '',
    email: '',
    password: '',
    gender: '',
    role: 'judge',
    imageUrl: '',
    details: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [mobileError, setMobileError] = useState('');

  const navigate = useNavigate();
  const nameRef = useRef();
  const fileInputRef = useRef();

  useEffect(() => {
    nameRef.current.focus();
  }, []);

  const validateMobileNumber = (number) => {
    const mobilePattern = /^\d{10}$/;
    return mobilePattern.test(number);
  };
  

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'mobileNumber') {
      if (!validateMobileNumber(value)) {
        setMobileError('Invalid Phone Number.');
      } else {
        setMobileError('');
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({
      ...prev,
      imageUrl: file,
    }));

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    if (!validateMobileNumber(formData.mobileNumber)) {
      setErrorMessage('Please enter a valid mobile number.');
      setLoading(false);
      return;
    }

    const { name, mobileNumber, department, email, password, gender, role, details } = formData;
    if (!name || !mobileNumber || !department || !email || !password || !gender || !role || !details) {
      setErrorMessage('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('name', name);
    formDataToSend.append('mobileNumber', mobileNumber);
    formDataToSend.append('department', department);
    formDataToSend.append('email', email);
    formDataToSend.append('password', password);
    formDataToSend.append('gender', gender);
    formDataToSend.append('role', role);
    formDataToSend.append('details', details);
    if (formData.imageUrl) {
      formDataToSend.append('judgephoto', formData.imageUrl);
    }

    try {
      const response = await axios.post('http://localhost:5000/api/faculty/register', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Judge registered successfully:', response.data);
      toast.success('Judge registered successfully!');
      navigate('/admin/judgelist');
    } catch (error) {
      const errorMsg = error.response ? error.response.data.message : 'Error registering judge';
      console.error('Error registering judge:', errorMsg);
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/dashboard');
  };

  return (
    <div className="judge-add-container">
      <div className="judge-add-card">
        <div className="judge-add-header">
          <h1>Add New Judge</h1>
          <p>Enter the details of the judge you want to add</p>
        </div>

        {errorMessage && (
          <div className="error-alert">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-layout">
            <div className="form-column">
              <div className="input-group">
                <label htmlFor="name">Full Name <span className="required">*</span></label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} ref={nameRef} required />
              </div>

              <div className="input-group">
                <label htmlFor="mobileNumber">Mobile Number <span className="required">*</span></label>
                <input type="text" id="mobileNumber" name="mobileNumber" maxLength={10} value={formData.mobileNumber} onChange={handleChange} required />
                
              </div>

              <div className="input-group">
                <label htmlFor="department">Department <span className="required">*</span></label>
                <input type="text" id="department" name="department" value={formData.department} onChange={handleChange} required />
              </div>

              <div className="input-group">
                <label htmlFor="email">Email Address <span className="required">*</span></label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
              </div>

              <div className="input-group">
                <label htmlFor="password">Password <span className="required">*</span></label>
                <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-column">
              <div className="input-group">
                <label htmlFor="gender">Gender <span className="required">*</span></label>
                <select id="gender" name="gender" value={formData.gender} onChange={handleChange} required>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div className="input-group">
                <label htmlFor="details">Details <span className="required">*</span></label>
                <textarea id="details" name="details" value={formData.details} onChange={handleChange} required></textarea>
              </div>

              <div className="input-group file-upload-group">
                <label htmlFor="imageUrl">Profile Image <span className="required">*</span></label>
                <input type="file" id="imageUrl" name="imageUrl" accept="image/*" onChange={handleFileChange} ref={fileInputRef} required />
                {imagePreview && <div className="image-preview"><img src={imagePreview} alt="Profile preview" /></div>}
              </div>
            </div>
          </div>

          <div className="form-actions" id='form-actions'>
            <button type="submit" className="btn" id='addco' disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  <span>Processing...</span>
                </>
              ) : (
                'Add Judge'
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

export default JudgeAdd;
