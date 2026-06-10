import axios from 'axios';

// Create axios instance
const rawBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const apiBaseURL = rawBaseURL.replace(/\/$/, '');
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

      // Don't redirect if we are already on the login page or it's a login request
      const isLoginPage = window.location.hash.includes('/login') || window.location.pathname.includes('/login');
      const isLoginRequest = error.config.url.includes('/login');

      if (!isLoginPage && !isLoginRequest) {
        window.location.href = '/#/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  changePassword: (data) => api.put('/auth/change-password', data),
  refreshToken: () => api.post('/auth/refresh-token'),
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
  getAllEmployeeWorks: (params) => api.get('/works/all-works', { params }),
  getWorkById: (id) => api.get(`/works/${id}`),
  updateWork: (id, data) => api.put(`/works/${id}`, data),
  deleteWork: (id) => api.delete(`/works/${id}`),
  getMyWorkStats: () => api.get('/works/stats'),
  getActiveWorkItems: () => api.get('/works/items/active'),
  getShopBalance: () => api.get('/works/employee/shop-balance'),
  sendWhatsAppBill: (id) => api.post(`/works/send-whatsapp-bill/${id}`)
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
  updateProfile: (data) => api.put('/admin/profile', data),
};

// Purchase endpoints
export const purchaseAPI = {
  getAllPurchases: (params) => api.get('/purchases', { params }),
  createPurchase: (data) => api.post('/purchases', data),
  updatePurchase: (id, data) => api.put(`/purchases/${id}`, data),
  deletePurchase: (id) => api.delete(`/purchases/${id}`),
};

export default api;