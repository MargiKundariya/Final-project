import React, { useState, useEffect } from 'react';
import { MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, MDBInput, MDBBtn } from 'mdb-react-ui-kit';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ChangePassword() {
  const [email, setEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/users/session', {
          withCredentials: true,
        });
        if (res.data && res.data.email) {
          setEmail(res.data.email);
        } else {
          toast.error('No logged-in user found. Please login again.', {
            position: "top-right",
            autoClose: 3000,
          });
          navigate('/');
        }
      } catch (err) {
        toast.error('Failed to fetch session. Please login again.', {
          position: "top-right",
          autoClose: 3000,
        });
        navigate('/');
      }
    };

    fetchSession();
  }, [navigate]);

  const handleChangePassword = async () => {
    setError('');

    if (!email || !oldPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      toast.error('Please fill in all fields.', {
        position: "top-right",
        autoClose: 4000,
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      toast.error('New password and confirm password do not match.', {
        position: "top-right",
        autoClose: 4000,
      });
      return;
    }

    if (oldPassword === newPassword) {
      setError('New password cannot be the same as old password.');
      toast.error('New password cannot be the same as old password.', {
        position: "top-right",
        autoClose: 4000,
      });
      return;
    }

    try {
      setLoading(true);
      toast.info('Processing your request...', {
        position: "top-right",
        autoClose: 2000,
      });

      await axios.post('http://localhost:5000/api/users/change-password', {
        email,
        oldPassword,
        newPassword,
      });

      toast.success('Password changed successfully!', {
        position: "top-right",
        autoClose: 5000,
        onClose: () => navigate('/'),
      });

      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error changing password';
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleChangePassword();
    }
  };

  return (
    <div style={{ background: 'linear-gradient(to right, #0f2027, #203a43, #2c5364)', minHeight: '100vh', padding: '40px 0' }}>
      <MDBContainer>
        <MDBRow>
          <MDBCol md='6' className="d-flex flex-column justify-content-center px-4">
            <h1 style={{ color: '#fff', fontWeight: '800', marginBottom: '30px' }}>
              Change Your Password
              <span style={{ color: '#48cae4', display: 'block', marginTop: '10px' }}>CampusConnect!</span>
            </h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '18px' }}>
              Update your password for better security and access to your account.
            </p>
          </MDBCol>

          <MDBCol md='6'>
            <MDBCard style={{ borderRadius: '15px', boxShadow: '0 10px 30px rgba(0, 31, 63, 0.25)', border: 'none' }}>
              <MDBCardBody style={{ padding: '40px 35px' }}>
                <img
                  src="CampusConnect Project-DC.png"
                  alt="Website Logo"
                  style={{ width: '150px', height:'auto', display: 'block', margin: '0 auto' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    toast.warning('Logo image could not be loaded', {
                      position: "top-right",
                      autoClose: 3000,
                    });
                  }}
                />

                {/* Email - disabled */}
                <MDBInput
                  wrapperClass="mb-4"
                  label="Email"
                  id="email"
                  type="email"
                  value={email}
                  disabled
                />

                <MDBInput
                  wrapperClass="mb-4"
                  label="Old Password"
                  id="oldPassword"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                />

                <MDBInput
                  wrapperClass="mb-4"
                  label="New Password"
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                />

                <MDBInput
                  wrapperClass="mb-4"
                  label="Confirm New Password"
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                />

                {error && <div style={{ color: '#dc3545', textAlign: 'center', marginBottom: '15px' }}>{error}</div>}

                <MDBBtn
                  className="w-100"
                  size="lg"
                  onClick={handleChangePassword}
                  disabled={loading}
                  style={{
                    background: 'linear-gradient(135deg, #0077b6 0%, #023e8a 100%)',
                    borderRadius: '30px',
                    padding: '12px 20px',
                    fontWeight: '600',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    opacity: loading ? '0.7' : '1',
                  }}
                  onMouseOver={(e) => {
                    if (!loading) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 31, 63, 0.35)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!loading) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 31, 63, 0.3)';
                    }
                  }}
                >
                  {loading ? 'Changing Password...' : 'Change Password'}
                </MDBBtn>

                <div style={{ textAlign: 'center', marginTop: '15px' }}>
                  <a
                    href="/"
                    style={{ color: '#0077b6', textDecoration: 'none' }}
                    onClick={(e) => {
                      e.preventDefault();
                      toast.info('Redirecting to login page...', {
                        position: "top-right",
                        autoClose: 2000,
                        onClose: () => navigate('/'),
                      });
                      setTimeout(() => {
                        navigate('/');
                      }, 1000);
                    }}
                  >
                    Back to Login
                  </a>
                </div>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    </div>
  );
}

export default ChangePassword;
