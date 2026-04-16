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
      toastError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{...styles.container, overflowX: 'hidden'}}>
      <div style={styles.card} className="m-3 p-3 p-md-4">
        <h2 style={styles.title} className="fs-4 fs-md-3">e-Sevai Login</h2>

        {/* ================= LOGIN FORM ================= */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="mb-3">
            <label className="fw-bold mb-2">Login Type</label><br />
            <div className="d-flex justify-content-center gap-3">
              <label className="d-flex align-items-center">
                <input
                  type="radio"
                  checked={!isEmployee}
                  onChange={() => setIsEmployee(false)}
                  className="me-2"
                /> Admin
              </label>
              <label className="d-flex align-items-center">
                <input
                  type="radio"
                  checked={isEmployee}
                  onChange={() => setIsEmployee(true)}
                  className="me-2"
                /> Employee
              </label>
            </div>
          </div>

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="form-control w-100 mb-3"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            required
            className="form-control w-100 mb-3"
          />

          {error && <p style={styles.error}>{error}</p>}

          <button disabled={loading} style={styles.button} className="btn w-100">
            {loading ? "Loading..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f5f5f5"
  },
  card: {
    background: "#fff",
    borderRadius: 10,
    width: "100%",
    maxWidth: "400px",
    textAlign: "center",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
  },
  title: {
    marginBottom: 20
  },
  form: {
    display: "flex",
    flexDirection: "column"
  },
  button: {
    padding: 10,
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
    transition: "background-color 0.2s"
  },
  error: {
    color: "red",
    fontSize: "14px",
    marginBottom: "10px"
  }
};

export default Login;