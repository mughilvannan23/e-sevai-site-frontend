import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/common/Toast';
import Loading from './components/common/Loading';
import Navbar from './components/common/Navbar';
import Login from './components/common/Login';

// Import pages
import AdminDashboard from './pages/AdminDashboard';
import AdminWorks from './pages/AdminWorks';
import AdminEmployees from './pages/AdminEmployees';
import AdminReports from './pages/AdminReports';
import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployeeWorks from './pages/EmployeeWorks';
import EmployeeReports from './pages/EmployeeReports';





// Protected route wrapper
const ProtectedRoute = ({ requiredRole }) => {
  const { isAuthenticated, isAdmin, isEmployee, loading } = useAuth();

  if (loading) return <Loading text="Checking authentication..." />;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (requiredRole === 'admin' && !isAdmin) {
    return <Navigate to="/employee/dashboard" replace />;
  }

  if (requiredRole === 'employee' && !isEmployee) {
    return <Navigate to="/admin/dashboard" replace />;
  }





  return (
    <>
      <Navbar />
      <div style={styles.content}>
        <Outlet />
      </div>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <HashRouter>
          <div style={styles.app}>
            <Routes>
              {/* Public */}
              <Route path="/login" element={<Login />} />

              {/* Admin */}
              <Route element={<ProtectedRoute requiredRole="admin" />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/works" element={<AdminWorks />} />
                <Route path="/admin/employees" element={<AdminEmployees />} />
                <Route path="/admin/reports" element={<AdminReports />} />
              </Route>

              {/* Employee */}
              <Route element={<ProtectedRoute requiredRole="employee" />}>
                <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
                <Route path="/employee/works" element={<EmployeeWorks />} />
                <Route path="/employee/reports" element={<EmployeeReports />} />
              </Route>

              {/* Redirects */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </HashRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

const styles = {
  app: {
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    overflowX: 'hidden'
  },
  content: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%'
  }
};

export default App;