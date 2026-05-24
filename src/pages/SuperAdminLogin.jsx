import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';

const SuperAdminLogin = () => {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { superAdminLogin, isAuthenticated, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    if (isAuthenticated && isSuperAdmin) {
      navigate('/super-admin/dashboard');
    }
  }, [isAuthenticated, isSuperAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (mobile.length !== 10) {
      showToast('Please enter a valid 10-digit mobile number', 'error');
      return;
    }

    if (!password) {
      showToast('Please enter your password', 'error');
      return;
    }

    try {
      setIsLoading(true);
      await superAdminLogin({ mobile, password });
      showToast('Welcome back, Super Admin!', 'success');
      navigate('/super-admin/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      showToast(error.response?.data?.message || 'Invalid super admin credentials', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginCard}>
        <div style={styles.header}>
          <div style={styles.logoCircle}>🛡️</div>
          <h2 style={styles.title}>Super Admin</h2>
          <p style={styles.subtitle}>Secure Access Gateway</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Mobile Number</label>
            <input
              type="text"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
              placeholder="Enter mobile number"
              style={styles.input}
              maxLength="10"
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              style={styles.input}
              required
            />
          </div>

          <button 
            type="submit" 
            style={{
              ...styles.button,
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Verifying...' : 'Login Securely'}
          </button>
        </form>

        <div style={styles.footer}>
          <Link to="/login" style={styles.backLink}>
            ← Back to Standard Login
          </Link>
          <p style={styles.version}>System v2.0 • Enterprise Edition</p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    fontFamily: "'Inter', sans-serif"
  },
  loginCard: {
    width: '100%',
    maxWidth: '400px',
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    padding: '40px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px'
  },
  logoCircle: {
    width: '64px',
    height: '64px',
    backgroundColor: '#f1f5f9',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    margin: '0 auto 16px'
  },
  title: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 4px 0'
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  input: {
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    fontSize: '16px',
    color: '#0f172a',
    transition: 'all 0.2s ease',
    outline: 'none'
  },
  button: {
    marginTop: '12px',
    padding: '14px',
    borderRadius: '12px',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: '600',
    border: 'none',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
  },
  footer: {
    marginTop: '32px',
    textAlign: 'center'
  },
  backLink: {
    fontSize: '14px',
    color: '#64748b',
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'color 0.2s ease'
  },
  version: {
    marginTop: '16px',
    fontSize: '10px',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.1em'
  }
};

export default SuperAdminLogin;
