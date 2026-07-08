import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from './Toast';
import { useNavigate } from 'react-router-dom';

const Login = ({ variant = 'default', initialMobile = '' }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ loginId: initialMobile, password: '' });
  const [loading, setLoading] = useState(false);

  const { login, error, clearError } = useAuth();
  const { error: toastError, success } = useToast();

  React.useEffect(() => {
    if (initialMobile) {
      setFormData((prev) => ({ ...prev, loginId: initialMobile }));
    }
  }, [initialMobile]);

  // Handle login input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'loginId') {
      setFormData(prev => ({ ...prev, [name]: value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // ✅ LOGIN SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const trimmedId = formData.loginId.trim();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedId);
    const isMobile = /^\d{10}$/.test(trimmedId);

    if (!isEmail && !isMobile) {
      toastError('Please enter a valid Email Address or 10-digit Mobile Number');
      return;
    }

    clearError();
    setLoading(true);

    try {
      const result = await login(formData);
      success('Login successful!');

      if (result.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/employee/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Invalid credentials';
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  const isLandingVariant = variant === 'landing';

  return (
    <>
      <style>{`
        .login-input:focus {
          border-color: #3b8132 !important;
          box-shadow: 0 0 0 3px rgba(59, 129, 50, 0.1) !important;
        }
        .login-button:hover:not(:disabled) {
          background-color: #2e6427 !important;
        }
      `}</style>
      <div style={{ ...styles.container, minHeight: isLandingVariant ? 'auto' : '100vh', backgroundColor: isLandingVariant ? 'transparent' : '#ffffff', background: isLandingVariant ? 'transparent' : 'radial-gradient(circle at top right, #eaf4e9, #ffffff)' }}>
        <div style={{ ...styles.card, width: isLandingVariant ? '100%' : '100%', maxWidth: isLandingVariant ? '460px' : '420px', boxShadow: isLandingVariant ? '0 16px 40px rgba(15, 23, 42, 0.08)' : '0 10px 25px rgba(0, 0, 0, 0.05)', border: isLandingVariant ? '1px solid rgba(59, 129, 50, 0.12)' : '1px solid #e0e0e0' }} className="p-4 p-md-5">
          <div style={styles.header}>
            <h1 style={styles.title}>SEVAGAN CSC & <br/>E-SEVA CENTRE</h1>
            <p style={styles.subtitle}>Employee Management System</p>
          </div>

          {/* ================= LOGIN FORM ================= */}
          <form onSubmit={handleSubmit} style={styles.form}>


            {/* Identifier Input */}
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="loginId">Email Address or Mobile Number</label>
              <input
                id="loginId"
                type="text"
                name="loginId"
                placeholder="Enter Email or Mobile Number"
                value={formData.loginId}
                onChange={handleInputChange}
                required
                className="form-control w-100 login-input"
                style={styles.input}
              />
            </div>

            {/* Password Input */}
            <div style={styles.formGroup}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ ...styles.label, marginBottom: 0 }} htmlFor="password">Password</label>
                <a href="#/forgot-password" style={{ fontSize: '13px', color: '#3b8132', textDecoration: 'none', fontWeight: '500' }}>Forgot Password?</a>
              </div>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="form-control w-100 login-input"
                style={styles.input}
              />
            </div>

            {/* Error Message */}
            {error && <div style={styles.error}>{error}</div>}

            {/* Login Button */}
            <button 
              disabled={loading} 
              style={{...styles.button, opacity: loading ? 0.7 : 1}}
              className="btn w-100 fw-bold login-button"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>

      {!isLandingVariant && (
        <button
          type="button"
          onClick={() => navigate('/')}
          className="btn btn-outline-secondary d-flex align-items-center justify-content-center"
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 2000,
            borderRadius: 999,
            padding: '10px 14px',
            boxShadow: '0 8px 18px rgba(0,0,0,0.12)'
          }}
          title="Back to Home"
        >
          Back to Home
        </button>
      )}

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
    position: 'relative',
    zIndex: 10
  },
  header: {
    marginBottom: '32px',
    textAlign: 'center'
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#3b8132',
    margin: '0 0 8px 0',
    letterSpacing: '0.5px'
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
  },
  error: {
    color: '#e74c3c',
    fontSize: '13px',
    padding: '8px 12px',
    backgroundColor: '#fff5f5',
    borderRadius: '10px',
    border: '1px solid #ffcfcf'
  }
};

export default Login;


// ithula irukkura desgin exact ha venu cemara image vena content and logic ethuvom change pannatha ellame exact ha irukku desgin
