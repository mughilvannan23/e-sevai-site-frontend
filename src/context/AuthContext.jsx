import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showWarning, setShowWarning] = useState(false);

  // Check if user is authenticated on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        const decodedUser = JSON.parse(userData);
        // Parse JWT to check expiration
        const jwtPayload = JSON.parse(atob(token.split('.')[1]));
        const isExpired = Date.now() >= jwtPayload.exp * 1000;
        
        if (isExpired) {
          console.log('[AuthContext] Token expired, logging out');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        } else {
          setUser(decodedUser);
        }
      } catch (error) {
        console.error('Error parsing user data or token:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Periodic check for token expiration
  useEffect(() => {
    if (!user) return;

    const checkToken = () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const jwtPayload = JSON.parse(atob(token.split('.')[1]));
          const timeUntilExpiry = jwtPayload.exp * 1000 - Date.now();
          
          if (timeUntilExpiry <= 0) {
            setShowWarning(false);
            logout();
            window.location.href = '/#/login';
          } else if (timeUntilExpiry <= 60000 && timeUntilExpiry > 0) { // 1 minute before expiry
            setShowWarning(true);
          }
        } catch (e) {
          // ignore
        }
      }
    };

    const intervalId = setInterval(checkToken, 10000); // Check every 10 seconds
    return () => clearInterval(intervalId);
  }, [user]);

  const handleContinueSession = async () => {
    try {
      const response = await authAPI.refreshToken();
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        setShowWarning(false);
      }
    } catch (error) {
      console.error('Failed to refresh token', error);
      setShowWarning(false);
      logout();
      window.location.href = '/#/login';
    }
  };

  const handleLogoutNow = () => {
    setShowWarning(false);
    logout();
    window.location.href = '/#/login';
  };

  const login = async (loginData) => {
    console.log('[AuthContext] login called with mobile:', loginData.mobile);
    try {
      setLoading(true);
      setError(null);

      const response = await authAPI.login(loginData);

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      } else {
        const errorMessage = response.data.message || 'Login failed';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('[AuthContext] Login error:', error);
      const errorMessage = error.response?.data?.message || 'Invalid credentials';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };


  const logout = () => {
    console.log('[AuthContext] logout called');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setError(null);
  };

  const updateUser = (updatedUserData) => {
    console.log('[AuthContext] updateUser called with:', updatedUserData);
    const updatedUser = { ...user, ...updatedUserData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    updateUser,
    clearError,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isEmployee: user?.role === 'employee',
    isSuperAdmin: user?.role === 'superadmin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {showWarning && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            maxWidth: '400px',
            textAlign: 'center'
          }}>
            <h4 style={{ color: '#e74c3c', marginBottom: '16px' }}>Session Expiring</h4>
            <p style={{ marginBottom: '24px', color: '#555' }}>
              Your session is about to expire.<br/>
              Do you want to continue your session?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                onClick={handleLogoutNow}
                className="btn btn-outline-danger"
                style={{ minWidth: '100px' }}
              >
                Logout
              </button>
              <button 
                onClick={handleContinueSession}
                className="btn btn-primary"
                style={{ minWidth: '100px', backgroundColor: '#3b8132', borderColor: '#3b8132' }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};
