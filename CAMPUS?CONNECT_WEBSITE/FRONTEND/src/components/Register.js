import React, { useState } from 'react';
import { 
  MDBInput, 
  MDBBtn, 
  MDBRadio, 
  MDBRow, 
  MDBCol,
  MDBIcon,
  MDBSpinner,
  MDBInputGroup,
  MDBDropdown,
  MDBDropdownToggle,
  MDBDropdownMenu,
  MDBDropdownItem,
  MDBTypography
} from 'mdb-react-ui-kit';
import Axios from 'axios';

function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    mno: '',
    gender: '',
    id: '',
    division: '',
    role: 'student', // Default role
    otp: '',
    isOtpSent: false,
    isOtpVerified: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formStep, setFormStep] = useState(1);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const roles = ['student', 'faculty', 'Admin', 'judge'];

  const handleChange = (e) => {
    const { id, value, name } = e.target;
    const fieldName = id || name;
    setFormData({ ...formData, [fieldName]: value });

    // Clear error when field is changed
    setError('');
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleRoleSelect = (role) => {
    setFormData({ ...formData, role });
  };

  const goToNextStep = () => {
    setFormStep(formStep + 1);
  };

  const goToPreviousStep = () => {
    setFormStep(formStep - 1);
  };

  const validateEmail = (email) => {
    return email.endsWith('@vtcbcsr.edu.in');
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const validateStep1 = () => {
    const { firstName, lastName, email, password, confirmPassword } = formData;
    
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields.');
      return false;
    }
    
    if (!validateEmail(email)) {
      setError('Email must be a valid @vtcbcsr.edu.in email address');
      return false;
    }
    
    if (!validatePassword(password)) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };
  const validatePhoneNumber = (mno) => {
    return /^\d{10}$/.test(mno.trim());
  };
  
  const validateStep2 = () => {
    const { mno, gender, id, division } = formData;
    
    if (!mno || !gender || !id || !division) {
      setError('Please fill in all required fields.');
      return false;
    }
    if (!validatePhoneNumber(mno)) {
      setError('Mobile number must be exactly 10 digits and numeric.');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formStep === 1) {
      if (validateStep1()) {
        goToNextStep();
      }
      return;
    }

    if (formStep === 2) {
      if (!validateStep2()) {
        return;
      }
    }

    const { 
      firstName, 
      middleName, 
      lastName, 
      email, 
      password, 
      mno, 
      gender, 
      id, 
      division, 
      role, 
      otp, 
      isOtpSent 
    } = formData;

    const fullName = `${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`;
    
    setLoading(true);

    try {
      // Send registration data for OTP
      if (!isOtpSent) {
        const data = {
          name: fullName,
          email,
          password,
          mobileNumber: mno,
          gender,
          id,
          division,
          role,
        };

        const response = await Axios.post('http://localhost:5000/api/users/register', data);
        setFormData({ ...formData, isOtpSent: true });
        setFormStep(3); // Move to OTP verification step
      } 
      // OTP verification
      else if (isOtpSent && !formData.isOtpVerified) {
        const otpData = {
          email,
          otp,
        };

        const response = await Axios.post('http://localhost:5000/api/users/verify-otp', otpData);
        setFormData({ ...formData, isOtpVerified: true });
        setFormStep(4); // Move to success step
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error processing your request');
    } finally {
      setLoading(false);
    }
  };

  // Render different form steps
  const renderFormStep = () => {
    switch (formStep) {
      case 1:
        return (
          <>
            <MDBTypography tag='h5' className='mb-4 cc-form-title'>Basic Information</MDBTypography>
            <MDBRow>
              <MDBCol col='6'>
                <MDBInput 
                  wrapperClass='mb-4' 
                  label='First Name*' 
                  id='firstName' 
                  type='text' 
                  onChange={handleChange}
                  value={formData.firstName}
                  required
                />
              </MDBCol>
              <MDBCol col='6'>
                <MDBInput 
                  wrapperClass='mb-4' 
                  label='Last Name*' 
                  id='lastName' 
                  type='text' 
                  onChange={handleChange}
                  value={formData.lastName}
                  required
                />
              </MDBCol>
            </MDBRow>
            <MDBInput 
              wrapperClass='mb-4' 
              label='Middle Name (Optional)' 
              id='middleName' 
              type='text' 
              onChange={handleChange}
              value={formData.middleName}
            />
            <MDBInput 
              wrapperClass='mb-4' 
              label='Email*' 
              id='email' 
              type='email' 
              onChange={handleChange}
              value={formData.email}
              required
            />
            <MDBInputGroup className='mb-4 cc-password-group'>
              <MDBInput 
                label='Password*' 
                id='password' 
                type={passwordVisible ? 'text' : 'password'} 
                onChange={handleChange}
                value={formData.password}
                required
              />
            </MDBInputGroup>
            <MDBInput 
              wrapperClass='mb-4' 
              label='Confirm Password*' 
              id='confirmPassword' 
              type='password' 
              onChange={handleChange}
              value={formData.confirmPassword}
              required
            />
            <MDBBtn 
              className='w-100 mb-4 cc-submit-btn' 
              size='lg' 
              onClick={handleSubmit}
              disabled={loading}
              style={{ backgroundColor: '#1266f1', borderRadius: '8px' }}
            >
              Next
            </MDBBtn>
          </>
        );
      
      case 2:
        return (
          <>
            <MDBTypography tag='h5' className='mb-4 cc-form-title'>Additional Information</MDBTypography>
            <MDBInput 
              wrapperClass='mb-4' 
              label='Mobile Number*' 
              id='mno' 
              type='text' 
              onChange={handleChange}
              maxLength={10}
              value={formData.mno}
              required
            />

            <div className='mb-4 cc-gender-group'>
              <MDBTypography tag='h6' className='mb-2'>Gender*</MDBTypography>
              <MDBRow>
                <MDBCol col='6'>
                  <MDBRadio style={{ padding: '0px' }}
                    name='gender' 
                    id='gender' 
                    value='male' 
                    label='Male' 
                    onChange={handleChange}
                    checked={formData.gender === 'male'}
                  />
                </MDBCol>
                <MDBCol col='6'>
                  <MDBRadio  style={{ padding: '0px' }}
                    name='gender'
                    id='gender' 
                    value='female' 
                    label='Female' 
                    onChange={handleChange}
                    checked={formData.gender === 'female'}
                  />
                </MDBCol>
              </MDBRow>
            </div>

            <MDBRow>
              <MDBCol col='6'>
                <MDBInput 
                  wrapperClass='mb-4' 
                  label='ID*' 
                  id='id' 
                  type='text' 
                  onChange={handleChange}
                  value={formData.id}
                  required
                />
              </MDBCol>
              <MDBCol col='6'>
                <MDBInput 
                  wrapperClass='mb-4' 
                  label='Division*' 
                  id='division' 
                  type='text' 
                  onChange={handleChange}
                  value={formData.division}
                  required
                />
              </MDBCol>
            </MDBRow>

            <div className='mb-4 cc-role-dropdown'>
              <MDBTypography tag='h6' className='mb-2'>Role*</MDBTypography>
              <MDBDropdown>
                <MDBDropdownToggle className='cc-dropdown-toggle' disabled>{formData.role}</MDBDropdownToggle>
                <MDBDropdownMenu>
                  {roles.map((role) => (
                    <MDBDropdownItem key={role} link onClick={() => handleRoleSelect(role)}>
                      {role}
                    </MDBDropdownItem>
                  ))}
                </MDBDropdownMenu>
              </MDBDropdown>
            </div>

            <div className='d-flex justify-content-between'>
              <MDBBtn 
                color='light' 
                size='lg' 
                onClick={goToPreviousStep}
                style={{ borderRadius: '8px' }}
                className='cc-back-btn'
              >
                Back
              </MDBBtn>
              <MDBBtn 
                className='cc-submit-btn' 
                size='lg' 
                onClick={handleSubmit}
                disabled={loading}
                style={{ backgroundColor: '#1266f1', borderRadius: '8px' }}
              >
                {loading ? (
                  <>
                    <MDBSpinner size='sm' className='me-2' /> 
                    Sending...
                  </>
                ) : (
                  'Send OTP'
                )}
              </MDBBtn>
            </div>
          </>
        );
      
      case 3:
        return (
          <div className='text-center cc-otp-container'>
            <MDBIcon fas icon="envelope-open-text" className="mb-4" size="4x" style={{ color: '#1266f1' }} />
            <MDBTypography tag='h5' className='mb-4 cc-form-title'>Verify Your Email</MDBTypography>
            <p className='mb-4'>We've sent a verification code to your email address. Please enter the code below.</p>
            
            <MDBInput 
              wrapperClass='mb-4' 
              label='Enter OTP' 
              id='otp' 
              type='text' 
              onChange={handleChange}
              value={formData.otp}
              required
            />

            <MDBBtn 
              className='w-100 mb-3 cc-submit-btn' 
              size='lg' 
              onClick={handleSubmit}
              disabled={loading}
              style={{ backgroundColor: '#1266f1', borderRadius: '8px' }}
            >
              {loading ? (
                <>
                  <MDBSpinner size='sm' className='me-2' /> 
                  Verifying...
                </>
              ) : (
                'Verify OTP'
              )}
            </MDBBtn>
          </div>
        );
      
      case 4:
        return (
          <div className='text-center cc-success-container'>
            <MDBIcon fas icon="check-circle" className="mb-4" size="4x" style={{ color: '#00b74a' }} />
            <MDBTypography tag='h5' className='mb-4 cc-form-title'>Registration Successful!</MDBTypography>
            <p className='mb-4'>Your account has been created successfully. You can now log in with your email and password.</p>
            
            <MDBBtn 
              className='w-100 mb-3 cc-submit-btn' 
              size='lg' 
              onClick={() => window.location.reload()}
              style={{ backgroundColor: '#1266f1', borderRadius: '8px' }}
            >
              Go to Login
            </MDBBtn>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="cc-register-form">
      {error && (
        <div className="alert alert-danger mb-4 cc-error-alert" role="alert">
          <MDBIcon fas icon="exclamation-triangle" className="me-2" />
          {error}
        </div>
      )}
      
      {formStep < 4 && (
        <div className="cc-progress-container mb-4">
          <div className="cc-progress-steps">
            {[1, 2, 3].map((step) => (
              <div 
                key={step} 
                className={`cc-progress-step ${formStep >= step ? 'cc-active' : ''}`}
              >
                {step}
              </div>
            ))}
          </div>
          <div className="cc-progress-bar">
            <div 
              className="cc-progress-bar-fill" 
              style={{ width: `${(formStep - 1) * 50}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {renderFormStep()}
    </form>
  );
}

export default Register;