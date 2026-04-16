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

  // Check if user is authenticated on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (loginData, isEmployee = false) => {
    console.log('[AuthContext] login called with:', { loginData, isEmployee });
    try {
      setLoading(true);
      setError(null);

      console.log('[AuthContext] Calling API:', isEmployee ? 'employeeLogin' : 'adminLogin');

      const response = isEmployee
        ? await authAPI.employeeLogin(loginData)
        : await authAPI.adminLogin(loginData);

      console.log('[AuthContext] API response:', response);
      console.log('[AuthContext] response.data:', response.data);

      if (response.data.success) {
        // Login successful (both admin and employee)
        console.log(`[AuthContext] ${isEmployee ? 'Employee' : 'Admin'} login successful`);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      } else {
        // Response was not successful
        const errorMessage = response.data.message || 'Login failed';
        console.error('[AuthContext] Login failed:', errorMessage);
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('[AuthContext] Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
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

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    clearError,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isEmployee: user?.role === 'employee'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};