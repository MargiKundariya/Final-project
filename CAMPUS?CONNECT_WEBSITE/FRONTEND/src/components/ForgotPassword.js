import React, { useState } from 'react';
import { MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, MDBInput, MDBBtn } from 'mdb-react-ui-kit';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // Track step: 1 = Email, 2 = OTP & New Password
  const navigate = useNavigate();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setNewPassword(e.target.value);
  };

  const handleForgotPasswordRequest = async () => {
    if (!email) {
      alert('Please enter your email');
      return;
    }

    try {
      setLoading(true);
      await axios.post('http://localhost:5000/api/users/forgot-password', { email });
      alert('OTP sent to your email!');
      setStep(2); // Move to OTP & New Password step
    } catch (error) {
      setError(error.response ? error.response.data.message : 'Error sending OTP');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!otp || !newPassword) {
      alert('Please enter OTP and new password');
      return;
    }

    try {
      setLoading(true);
      await axios.post('http://localhost:5000/api/users/reset-password', {
        email,
        otp,
        newPassword,
      });
      alert('Password successfully reset!');
      navigate('/'); // Redirect to login after successful reset
    } catch (error) {
      setError(error.response ? error.response.data.message : 'Error resetting password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='register' style={{ background: 'linear-gradient(to right, #0f2027, #203a43, #2c5364)', height: '100vh'}}>
      <MDBContainer>
        <MDBRow>
          {/* Left Side Text */}
          <MDBCol md='6' className='text-center text-md-start d-flex flex-column justify-content-center'>
            <h1 className="my-5 display-3 fw-bold ls-tight px-3" style={{ color: 'hsl(218, 81%, 95%)' }}>
              Forgot Password<br />
              <span style={{ color: 'hsl(231, 67%, 40%)' }}>CampusConnect!</span>
            </h1>
            <p className='px-3' style={{ color: 'hsl(218, 81%, 85%)' }}>
              Enter your email to receive an OTP, then reset your password to regain access.
            </p>
          </MDBCol>

          {/* Right Side Form */}
          <MDBCol md='6' className='position-relative'>
            <MDBCard className='my-5 bg-glass'>
              <MDBCardBody className='p-5'>
                <img
                  src="CampusConnect Project-DC.png"
                  alt="Website Logo"
                  className="mx-auto d-block mb-4"
                  style={{ width: '150px', height: 'auto' }}
                />

                {step === 1 && (
                  <div>
                    <MDBInput
                      wrapperClass="mb-4"
                      label="Enter your email"
                      id="email"
                      type="email"
                      value={email}
                      onChange={handleEmailChange}
                    />
                    {error && <div style={{ color: 'red' }}>{error}</div>}
                    <MDBBtn
                      className="w-100 mb-4"
                      size="md"
                      onClick={handleForgotPasswordRequest}
                      disabled={loading}
                    >
                      {loading ? 'Sending OTP...' : 'Send OTP'}
                    </MDBBtn>
                  </div>
                )}

                {step === 2 && (
                  <div>
                    <MDBInput
                      wrapperClass="mb-4"
                      label="Enter OTP"
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={handleOtpChange}
                    />
                    <MDBInput
                      wrapperClass="mb-4"
                      label="New Password"
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={handlePasswordChange}
                    />
                    {error && <div style={{ color: 'red' }}>{error}</div>}
                    <MDBBtn
                      className="w-100 mb-4"
                      size="md"
                      onClick={handlePasswordReset}
                      disabled={loading}
                    >
                      {loading ? 'Resetting Password...' : 'Reset Password'}
                    </MDBBtn>
                  </div>
                )}
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    </div>
  );
}

export default ForgotPassword;
