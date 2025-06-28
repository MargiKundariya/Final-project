import React, { useState } from 'react';
import { 
  MDBContainer, 
  MDBRow, 
  MDBCol, 
  MDBCard, 
  MDBCardBody,
  MDBCardHeader,
  MDBIcon
} from 'mdb-react-ui-kit';
import Login from './Login';
import Register from './Register';
import '../assets/css/LoginRegister.css';

function LoginRegister() {
  const [isLogin, setIsLogin] = useState(true);

  const toggleForm = () => setIsLogin(!isLogin);

  return (
    <div className='cc-login-register-page'>
      <MDBContainer>
        <MDBRow className='d-flex align-items-center'>
          {/* Left Side Content */}
          <MDBCol md='6' className='text-center text-md-start d-flex flex-column justify-content-center'>
            <div className="cc-animated cc-fade-in">
              <h1 className="my-5 display-3 fw-bold ls-tight" style={{ color: '#fff' }}>
                {isLogin ? 'Welcome Back to' : 'Join Us at'}<br />
                <span style={{ color: '#8ACDEA' }}>CampusConnect!</span>
              </h1>
              <p className='px-3 mb-5' style={{ color: '#e0e0e0', fontSize: '1.1rem' }}>
                {isLogin
                  ? 'Log in to explore upcoming activities, register for events, and stay connected with your campus community.'
                  : 'Sign up to discover events, join clubs, and make the most of your college experience with CampusConnect.'}
              </p>
              <div className="d-none d-md-block">
                <div className="cc-feature-item mb-4">
                  <MDBIcon fas icon="calendar-alt" size='2x' className="me-3" style={{ color: '#8ACDEA' }} />
                  <span style={{ color: '#fff', fontSize: '1.1rem' }}>Stay updated with campus events</span>
                </div>
                <div className="cc-feature-item mb-4">
                  <MDBIcon fas icon="users" size='2x' className="me-3" style={{ color: '#8ACDEA' }} />
                  <span style={{ color: '#fff', fontSize: '1.1rem' }}>Connect with clubs and organizations</span>
                </div>
                <div className="cc-feature-item">
                  <MDBIcon fas icon="bell" size='2x' className="me-3" style={{ color: '#8ACDEA' }} />
                  <span style={{ color: '#fff', fontSize: '1.1rem' }}>Get notifications for important updates</span>
                </div>
              </div>
            </div>
          </MDBCol>

          {/* Right Side Form */}
          <MDBCol md='6' className='position-relative'>
            <div className="cc-animated cc-fade-in">
              <MDBCard className='my-5 cc-bg-glass cc-shadow-5'>
                <MDBCardHeader className='text-center py-4 bg-transparent border-0'>
                  <img
                    src="/CampusConnect Project-DC.png"
                    alt="CampusConnect Logo"
                    className="mx-auto d-block"
                    style={{ width: '180px', height: 'auto' }}
                  />
                  <h3 className='mt-3 mb-0 fw-bold' style={{ color: 'rgb(34, 55, 172)', fontSize: '2rem' }}>
                    {isLogin ? 'Sign In' : 'Create Account'}
                  </h3>
                </MDBCardHeader>
                <MDBCardBody className='p-5'>
                  <div className="cc-form-container">
                    {isLogin ? (
                      <Login />
                    ) : (
                      <Register />
                    )}
                  </div>

                  <div className='text-center mt-4'>
                    <p className='mb-0' id='signup'>
                      {isLogin ? (
                        <>
                          Don't have an account?{' '}
                          <span className='text-primary fw-bold cc-toggle-link' onClick={toggleForm}>
                            Sign Up
                          </span>
                        </>
                      ) : (
                        <>
                          Already have an account?{' '}
                          <span className='text-primary fw-bold cc-toggle-link' onClick={toggleForm}>
                            Log In
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                </MDBCardBody>
              </MDBCard>
            </div>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    </div>
  );
}

export default LoginRegister;