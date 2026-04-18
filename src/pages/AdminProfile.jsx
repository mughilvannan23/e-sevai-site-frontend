import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import Loading from '../components/common/Loading';
import { useToast } from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';

const AdminProfile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const { success, error } = useToast();

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        confirmPassword: ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      error('Name is required');
      return;
    }

    if (formData.password && formData.password.length < 6) {
      error('Password must be at least 6 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      error('Passwords do not match');
      return;
    }

    try {
      setLoading(true);

      const updateData = {
        name: formData.name.trim()
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await adminAPI.updateProfile(updateData);

      if (response.data.success) {
        success('Profile updated successfully');
        updateUser(response.data.user);

        // Clear password fields
        setFormData(prev => ({
          ...prev,
          password: '',
          confirmPassword: ''
        }));
      }
    } catch (err) {
      console.error('Profile update error:', err);
      error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <Loading text="Loading profile..." />;
  }

  return (
    <div className="container-fluid p-0">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <h1 style={styles.title} className="fs-3 fs-md-2">Admin Profile</h1>
          <p style={styles.subtitle} className="fs-6 text-muted">Update your profile information</p>
        </div>
      </div>

      <div className="d-flex justify-content-center">
        <div style={styles.card} className="p-4 p-md-5">
          <form onSubmit={handleSubmit} style={styles.form}>
            <div className="text-center mb-4">
              <div style={styles.icon}>👤</div>
              <h3 style={styles.cardTitle}>Profile Settings</h3>
              <p style={styles.cardSubtitle}>Manage your account information</p>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                style={styles.input}
                placeholder="Enter your name"
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                style={{ ...styles.input, backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
                readOnly
                title="Email cannot be changed"
              />
              <small style={styles.helpText}>Email address cannot be modified</small>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>New Password (Optional)</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                style={styles.input}
                placeholder="Enter new password (leave empty to keep current)"
                minLength="6"
              />
              <small style={styles.helpText}>Minimum 6 characters. Leave empty to keep current password.</small>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                style={styles.input}
                placeholder="Confirm new password"
                minLength="6"
              />
            </div>

            <button
              type="submit"
              style={styles.button}
              disabled={loading}
              className="w-100"
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const styles = {
  title: {
    margin: '0 0 8px 0',
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  subtitle: {
    margin: 0,
    color: '#666',
    fontSize: '16px'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '500px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    border: '1px solid #e0e0e0'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  icon: {
    fontSize: '48px',
    marginBottom: '16px'
  },
  cardTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#22863a',
    margin: '0 0 8px 0'
  },
  cardSubtitle: {
    fontSize: '14px',
    color: '#666666',
    margin: '0 0 24px 0'
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
    padding: '12px 16px',
    border: '1px solid #d0d0d0',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
    backgroundColor: '#ffffff'
  },
  helpText: {
    fontSize: '12px',
    color: '#666666',
    marginTop: '4px'
  },
  button: {
    padding: '12px 16px',
    backgroundColor: '#22863a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    marginTop: '8px'
  }
};

export default AdminProfile;