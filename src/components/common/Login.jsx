import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from './Toast';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  const [isEmployee, setIsEmployee] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const { login, error, clearError } = useAuth();
  const { error: toastError, success } = useToast();

  // Handle login input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ✅ LOGIN SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setLoading(true);

    try {
      const result = await login(formData, isEmployee);
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

  return (
    <>
      <style>{`
        .login-input:focus {
          border-color: #22863a !important;
          box-shadow: 0 0 0 3px rgba(34, 134, 58, 0.1) !important;
        }
        .login-button:hover:not(:disabled) {
          background-color: #1a6a2e !important;
        }
      `}</style>
      <div style={styles.container}>
        <div style={styles.card} className="p-4 p-md-5">
          <div style={styles.header}>
            <h1 style={styles.title}>SEVAGAN CSC & <br/>E-SEVA CENTRE</h1>
            <p style={styles.subtitle}>Employee Management System</p>
          </div>

          {/* ================= LOGIN FORM ================= */}
          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Login Type Selection */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Login Type</label>
              <div className="d-flex justify-content-center gap-4 mt-2">
                <label style={styles.radioLabel} className="d-flex align-items-center">
                  <input
                    type="radio"
                    checked={!isEmployee}
                    onChange={() => setIsEmployee(false)}
                    style={styles.radio}
                    className="me-2"
                  />
                  Admin
                </label>
                <label style={styles.radioLabel} className="d-flex align-items-center">
                  <input
                    type="radio"
                    checked={isEmployee}
                    onChange={() => setIsEmployee(true)}
                    style={styles.radio}
                    className="me-2"
                  />
                  Employee
                </label>
              </div>
            </div>

            {/* Email Input */}
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="form-control w-100 login-input"
                style={styles.input}
              />
            </div>

            {/* Password Input */}
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="password">Password</label>
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
    background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 50%, #a5d6a7 100%)',
    backgroundImage: `
      linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 50%, #a5d6a7 100%),
      url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><defs><style>.leaf{fill:%231a6a2e;opacity:0.12}</style></defs><g><path class="leaf" d="M50 20 Q60 25 65 40 Q60 55 50 60 Q40 55 45 40 Q40 25 50 20" transform="rotate(25 55 40)"/><path class="leaf" d="M120 30 Q130 35 135 50 Q130 65 120 70 Q110 65 115 50 Q110 35 120 30" transform="rotate(-35 125 50)"/><path class="leaf" d="M30 100 Q45 105 55 125 Q45 140 30 145 Q15 140 25 125 Q15 105 30 100" transform="rotate(45 40 125)"/><path class="leaf" d="M150 110 Q165 115 175 135 Q165 150 150 155 Q135 150 145 135 Q135 115 150 110" transform="rotate(-50 160 135)"/><path class="leaf" d="M70 160 Q80 165 85 180 Q80 190 70 195 Q60 190 65 180 Q60 165 70 160" transform="rotate(20 75 180)"/><path class="leaf" d="M140 20 Q148 22 152 35 Q148 45 140 48 Q132 45 136 35 Q132 22 140 20" transform="rotate(-25 145 35)"/><path class="leaf" d="M20 50 Q28 52 32 65 Q28 75 20 78 Q12 75 16 65 Q12 52 20 50" transform="rotate(60 25 65)"/><path class="leaf" d="M170 150 Q180 155 185 170 Q180 180 170 185 Q160 180 165 170 Q160 155 170 150" transform="rotate(-40 175 170)"/><path class="leaf" d="M100 170 Q112 175 120 190 Q112 200 100 205 Q88 200 96 190 Q88 175 100 170" transform="rotate(30 110 190)"/><path class="leaf" d="M60 60 Q68 62 72 75 Q68 85 60 88 Q52 85 56 75 Q52 62 60 60" transform="rotate(-20 65 75)"/></g></svg>')
    `,
    backgroundSize: 'cover, 600px 600px',
    backgroundPosition: 'center, 0 0',
    backgroundAttachment: 'fixed'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
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
    color: '#22863a',
    margin: '0 0 8px 0'
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
    padding: '10px 12px',
    border: '1px solid #d0d0d0',
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease'
  },
  radio: {
    accentColor: '#22863a'
  },
  radioLabel: {
    fontSize: '14px',
    color: '#2c3e50',
    cursor: 'pointer',
    fontWeight: '500'
  },
  button: {
    padding: '11px 16px',
    backgroundColor: '#22863a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    marginTop: '8px'
  },
  error: {
    color: '#d32f2f',
    fontSize: '13px',
    padding: '8px 12px',
    backgroundColor: '#ffebee',
    borderRadius: '4px',
    border: '1px solid #ffcdd2'
  }
};

export default Login;


// ithula irukkura desgin exact ha venu cemara image vena content and logic ethuvom change pannatha ellame exact ha irukku desgin