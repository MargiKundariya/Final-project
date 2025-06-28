import React, { useState } from 'react';
import { 
  MDBInput, 
  MDBBtn, 
  MDBIcon, 
  MDBSpinner,
  MDBCheckbox
} from 'mdb-react-ui-kit';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Clear previous error messages
    setError('');
  
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields.', { toastId: 'empty-fields' });
      return;
    }
  
    setLoading(true);
  
    try {
      const response = await axios.post(
        'http://localhost:5000/api/users/login',
        formData,
        { withCredentials: true }
      );
  
      const { role } = response.data;
  
      // Role-specific welcome messages
      const roleMessages = {
        Admin: { message: 'Welcome Admin!', toastId: 'role-Admin' },
        faculty: { message: 'Welcome Faculty!', toastId: 'role-faculty' },
        student: { message: 'Welcome Student!', toastId: 'role-student' },
        judge: { message: 'Welcome Judge!', toastId: 'role-judge' },
      };
  
      if (roleMessages[role]) {
        const { message, toastId } = roleMessages[role];
        
        // Check if the toast is already active
        if (!toast.isActive(toastId)) {
          toast.success(message, { toastId });
        }
        
        const roleRoutes = {
          Admin: '/admin/dashboard',
          faculty: '/faculty/dashboard',
          student: '/student/dashboardcontainer',
          judge: '/judge/participation',
        };
        navigate(roleRoutes[role]);
      } else {
        toast.error('Unknown role', { toastId: 'unknown-role' });
      }
    } catch (error) {
      const errorMessage =
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Error logging in';
      if (!toast.isActive('login-error')) {
        toast.error(errorMessage, { toastId: 'login-error' });
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    navigate('/forgot');
  };

  return (
    <form onSubmit={handleSubmit} className="cc-login-form">
      <div className="cc-form-inputs mb-4">
        <MDBInput
          wrapperClass="mb-4"
          label="Email"
          id="email"
          type="email"
          onChange={handleChange}
          value={formData.email}
          required
        />
        
        <MDBInput
          wrapperClass="mb-4"
          label="Password"
          id="password"
          type="password"
          onChange={handleChange}
          value={formData.password}
          required
        />
      </div>

      <MDBBtn
        type="submit"
        className="w-100 mb-4 cc-submit-btn"
        size="lg"
        disabled={loading}
        style={{ backgroundColor: '#1266f1', borderRadius: '8px' }}
      >
        {loading ? (
          <>
            <MDBSpinner size='sm' className='me-2' /> 
            Logging In...
          </>
        ) : (
          'Sign In'
        )}
      </MDBBtn>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <a 
          href="/forgot" 
          onClick={handleForgotPassword}
          className="text-primary fw-bold cc-forgot-link"
        >
          Forgot Password?
        </a>
      </div>

      {error && (
        <div className="alert alert-danger mb-4 cc-error-alert" role="alert">
          <MDBIcon fas icon="exclamation-triangle" className="me-2" />
          {error}
        </div>
      )}

    </form>
  );
}

export default Login;