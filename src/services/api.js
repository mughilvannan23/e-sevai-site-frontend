import axios from 'axios';

// Create axios instance
const rawBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const apiBaseURL = rawBaseURL.replace(/\/$/, '');
const baseURL = apiBaseURL.endsWith('/api') ? apiBaseURL : `${apiBaseURL}/api`;

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  adminLogin: (data) => api.post('/auth/admin/login', data),
  employeeLogin: (data) => api.post('/auth/employee/login', data),
  getProfile: () => api.get('/auth/profile'),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// User endpoints
export const userAPI = {
  createEmployee: (data) => api.post('/users', data),
  getEmployees: (params) => api.get('/users', { params }),
  getEmployeeById: (id) => api.get(`/users/${id}`),
  updateEmployee: (id, data) => api.put(`/admin/employees/${id}`, data),
  deleteEmployee: (id) => api.delete(`/users/${id}`),
  getEmployeeStats: () => api.get('/users/stats'),
};

// Work endpoints
export const workAPI = {
  createWork: (data) => api.post('/works', data),
  getMyWorks: (params) => api.get('/works', { params }),
  getWorkById: (id) => api.get(`/works/${id}`),
  updateWork: (id, data) => api.put(`/works/${id}`, data),
  deleteWork: (id) => api.delete(`/works/${id}`),
  getMyWorkStats: () => api.get('/works/stats'),
  getActiveWorkItems: () => api.get('/works/items/active'),
};

// Admin endpoints
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getAllWorks: (params) => api.get('/admin/works', { params }),
  getEmployeePerformance: (params) => api.get('/admin/employee-performance', { params }),
  getRevenueReport: (params) => api.get('/admin/revenue-report', { params }),
  downloadRevenueExcel: (params) => api.get('/admin/revenue-report/download/excel', { params, responseType: 'blob' }),
  downloadRevenuePDF: (params) => api.get('/admin/revenue-report/download/pdf', { params, responseType: 'blob' }),
  createWorkItem: (data) => api.post('/admin/work-items', data),
  getWorkItems: () => api.get('/admin/work-items'),
  updateWorkItem: (id, data) => api.put(`/admin/work-items/${id}`, data),
  deleteWorkItem: (id) => api.delete(`/admin/work-items/${id}`),
};

export default api;