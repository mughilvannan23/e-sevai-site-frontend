import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { HashRouter, Routes, Route, Navigate, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/common/Toast';
import Loading from './components/common/Loading';
import Login from './components/common/Login';

// Import pages
import AdminDashboard from './pages/AdminDashboard';
import AdminWorks from './pages/AdminWorks';
import AdminEmployees from './pages/AdminEmployees';
import AdminReports from './pages/AdminReports';
import AdminProfile from './pages/AdminProfile';
import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployeeWorks from './pages/EmployeeWorks';
import EmployeeReports from './pages/EmployeeReports';





// Protected route wrapper
const ProtectedRoute = ({ requiredRole }) => {
  const { user, logout, isAuthenticated, isAdmin, isEmployee, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) return <Loading text="Checking authentication..." />;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (requiredRole === 'admin' && !isAdmin) {
    return <Navigate to="/employee/dashboard" replace />;
  }

  if (requiredRole === 'employee' && !isEmployee) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCloseSidebar = () => setSidebarOpen(false);

  const isActive = (path) => location.pathname === path;
  const dashboardPath = isAdmin ? '/admin/dashboard' : '/employee/dashboard';

  const NavLinks = () => (
    <>
      {isAdmin && (
        <>
          <Link to="/admin/dashboard" className="nav-link" style={{ ...styles.navLink, ...(isActive('/admin/dashboard') ? styles.activeNavLink : {}) }} onClick={handleCloseSidebar}>
            Dashboard
          </Link>
          <Link to="/admin/employees" className="nav-link" style={{ ...styles.navLink, ...(isActive('/admin/employees') ? styles.activeNavLink : {}) }} onClick={handleCloseSidebar}>
            Employees
          </Link>
          <Link to="/admin/works" className="nav-link" style={{ ...styles.navLink, ...(isActive('/admin/works') ? styles.activeNavLink : {}) }} onClick={handleCloseSidebar}>
            Works List
          </Link>
          <Link to="/admin/reports" className="nav-link" style={{ ...styles.navLink, ...(isActive('/admin/reports') ? styles.activeNavLink : {}) }} onClick={handleCloseSidebar}>
            Reports
          </Link>
          <Link to="/admin/profile" className="nav-link" style={{ ...styles.navLink, ...(isActive('/admin/profile') ? styles.activeNavLink : {}) }} onClick={handleCloseSidebar}>
            Profile
          </Link>
        </>
      )}

      {isEmployee && (
        <>
          <Link to="/employee/dashboard" className="nav-link" style={{ ...styles.navLink, ...(isActive('/employee/dashboard') ? styles.activeNavLink : {}) }} onClick={handleCloseSidebar}>
            Dashboard
          </Link>
          <Link to="/employee/works" className="nav-link" style={{ ...styles.navLink, ...(isActive('/employee/works') ? styles.activeNavLink : {}) }} onClick={handleCloseSidebar}>
            My Works
          </Link>
          <Link to="/employee/reports" className="nav-link" style={{ ...styles.navLink, ...(isActive('/employee/reports') ? styles.activeNavLink : {}) }} onClick={handleCloseSidebar}>
            Reports
          </Link>
        </>
      )}
    </>
  );

  const SidebarContent = () => (
    <>
      <Link to={dashboardPath} style={styles.brandLink}>
        {/* <span style={styles.brandIcon}>🏢</span> */}
        <span style={styles.brandText}>SEVAGAN CSC & E SEVA CENTRE</span>
      </Link>

      <nav className="nav nav-pills flex-column gap-2 mt-4">
        <NavLinks />
      </nav>

      <div className="mt-auto pt-4 px-1">
        <div className="mb-3">
          <div style={styles.userName}>{user?.name}</div>
          <div style={styles.userRole}>{isAdmin ? 'Admin' : user?.employeeId}</div>
        </div>
        <button type="button" className="btn btn-danger w-100" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Header - only visible on mobile */}
      <header className="d-md-none sticky-top w-100" style={styles.mobileHeader}>
        <div className="d-flex align-items-center justify-content-between p-3">
          <Link to={dashboardPath} style={styles.mobileBrandLink}>
            {/* <span style={styles.brandIcon}>🏢</span> */}
            <span style={{ fontSize: '14px', fontWeight: '700', color: 'white' }}>SEVAGAN</span>
          </Link>
          <button className="btn btn-light" onClick={() => setSidebarOpen(true)} style={styles.hamburgerBtn}>
            ☰
          </button>
        </div>
      </header>

      {/* Main Layout: Flex container for sidebar + content */}
      <div className="d-flex flex-column flex-md-row" style={styles.pageWrapper}>
        {/* Desktop Sidebar (hidden on mobile) */}
        <aside className="d-none d-md-flex flex-column flex-md-shrink-0" style={styles.sidebar}>
          <SidebarContent />
        </aside>

        {/* Mobile Offcanvas Sidebar */}
        {sidebarOpen && (
          <>
            <div style={styles.offcanvasBackdrop} onClick={handleCloseSidebar}></div>
            <aside className="d-md-none d-flex flex-column" style={styles.offcanvasSidebarContent}>
              <SidebarContent />
            </aside>
          </>
        )}

        {/* Main Content */}
        <main className="flex-grow-1 p-3 p-md-4 w-100" style={styles.mainContent}>
          <Outlet />
        </main>
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
                <Route path="/admin/profile" element={<AdminProfile />} />
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
  pageWrapper: {
    minHeight: '100vh',
    backgroundColor: '#f8f9fa'
  },
  mobileHeader: {
    backgroundColor: '#2c3e50',
    color: 'white',
    zIndex: 999,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  mobileBrandLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textDecoration: 'none',
    color: 'white'
  },
  hamburgerBtn: {
    fontSize: '20px',
    padding: '6px 12px'
  },
  sidebar: {
    width: '250px',
    minHeight: '100vh',
    backgroundColor: '#2c3e50',
    color: 'white',
    position: 'sticky',
    top: 0,
    padding: '24px 16px',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column'
  },
  offcanvasSidebarContent: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '250px',
    height: '100vh',
    backgroundColor: '#2c3e50',
    color: 'white',
    padding: '24px 16px',
    zIndex: 1050,
    overflowY: 'auto',
    boxShadow: '2px 0 8px rgba(0,0,0,0.2)',
    display: 'flex',
    flexDirection: 'column'
  },
  offcanvasBackdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1040
  },
  brandLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
    color: 'white'
  },
  brandIcon: {
    fontSize: '22px'
  },
  brandText: {
    fontSize: '16px',
    fontWeight: '700'
  },
  navLink: {
    padding: '10px 14px',
    color: 'rgba(255,255,255,0.85)',
    borderRadius: '8px',
    textDecoration: 'none',
    display: 'block'
  },
  activeNavLink: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    color: 'white'
  },
  userName: {
    color: 'white',
    fontWeight: '600',
    fontSize: '14px'
  },
  userRole: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '12px'
  },
  mainContent: {
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
    flex: 1
  },
  content: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%'
  }
};

export default App;