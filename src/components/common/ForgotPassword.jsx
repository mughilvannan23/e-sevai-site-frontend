import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { useToast } from './Toast';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loginId, setLoginId] = useState('');
  const [otp, setOtp] = useState('');
  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
  
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer;
    if (resendDisabled && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setResendDisabled(false);
    }
    return () => clearInterval(timer);
  }, [resendDisabled, countdown]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    const trimmedId = loginId.trim();
    
    if (!trimmedId) {
      toastError('Please enter Email or Mobile Number');
      return;
    }

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedId);
    if (!isEmail) {
      toastError('For security reasons, password reset is available only through your registered email.');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.forgotPassword({ loginId: trimmedId });
      if (response.data.success) {
        success('OTP sent to your registered email');
        setStep(2);
        startResendTimer();
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toastError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.verifyOTP({ email: loginId.trim().toLowerCase(), otp });
      if (response.data.success) {
        success('OTP verified successfully');
        setStep(3);
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      const response = await authAPI.resendOTP({ email: loginId.trim().toLowerCase() });
      if (response.data.success) {
        success('OTP resent successfully');
        startResendTimer();
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const startResendTimer = () => {
    setResendDisabled(true);
    setCountdown(30);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const { newPassword, confirmPassword } = passwords;
    
    if (newPassword.length < 6) {
      toastError('Password must be at least 6 characters long');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toastError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.resetPassword({
        email: loginId.trim().toLowerCase(),
        otp,
        newPassword,
        confirmPassword
      });
      if (response.data.success) {
        success('Password changed successfully');
        navigate('/');
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .forgot-input:focus {
          border-color: #3b8132 !important;
          box-shadow: 0 0 0 3px rgba(59, 129, 50, 0.1) !important;
        }
        .forgot-button:hover:not(:disabled) {
          background-color: #2e6427 !important;
        }
      `}</style>
      <div style={styles.container}>
        <div style={styles.card} className="p-4 p-md-5">
          <div style={styles.header}>
            <h1 style={styles.title}>Forgot Password</h1>
            <p style={styles.subtitle}>
              {step === 1 && "Enter your registered email address"}
              {step === 2 && "Enter the verification code sent to your email"}
              {step === 3 && "Create a new secure password"}
            </p>
          </div>

          {step === 1 && (
            <form onSubmit={handleSendOTP} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="loginId">Email Address or Mobile Number</label>
                <input
                  id="loginId"
                  type="text"
                  placeholder="Enter Email Address"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  required
                  className="form-control w-100 forgot-input"
                  style={styles.input}
                />
              </div>
              <button 
                disabled={loading} 
                style={{...styles.button, opacity: loading ? 0.7 : 1}}
                className="btn w-100 fw-bold forgot-button"
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOTP} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="otp">Enter Verification Code</label>
                <input
                  id="otp"
                  type="text"
                  maxLength="6"
                  placeholder="6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  required
                  className="form-control w-100 forgot-input text-center"
                  style={{...styles.input, letterSpacing: '4px', fontSize: '18px', fontWeight: 'bold'}}
                />
              </div>
              <button 
                disabled={loading} 
                style={{...styles.button, opacity: loading ? 0.7 : 1}}
                className="btn w-100 fw-bold forgot-button"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
              
              <div style={{ textAlign: 'center', marginTop: '15px' }}>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resendDisabled || loading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: resendDisabled ? '#999' : '#3b8132',
                    cursor: resendDisabled ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}
                >
                  {resendDisabled ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="newPassword">New Password</label>
                <input
                  id="newPassword"
                  type="password"
                  placeholder="Enter new password"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                  required
                  className="form-control w-100 forgot-input"
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                  required
                  className="form-control w-100 forgot-input"
                  style={styles.input}
                />
              </div>
              <button 
                disabled={loading} 
                style={{...styles.button, opacity: loading ? 0.7 : 1}}
                className="btn w-100 fw-bold forgot-button"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <a href="#/" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>
              ← Back to Login
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: '#ffffff',
    background: 'radial-gradient(circle at top right, #eaf4e9, #ffffff)'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e0e0e0',
  },
  header: {
    marginBottom: '32px',
    textAlign: 'center'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#3b8132',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#666666',
    margin: '0',
    fontWeight: '500'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: '4px'
  },
  input: {
    padding: '12px',
    border: '1px solid #d0d0d0',
    borderRadius: '10px',
    fontSize: '14px',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease'
  },
  button: {
    padding: '12px 16px',
    backgroundColor: '#3b8132',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginTop: '8px'
  }
};

export default ForgotPassword;
