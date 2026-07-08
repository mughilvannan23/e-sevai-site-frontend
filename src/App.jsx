import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { HashRouter, Routes, Route, Navigate, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/common/Toast';
import Loading from './components/common/Loading';
import LiveClock from './components/common/LiveClock';

const LandingPage = React.lazy(() => import('./components/common/LandingPage'));
const Login = React.lazy(() => import('./components/common/Login'));
const ForgotPassword = React.lazy(() => import('./components/common/ForgotPassword'));

// Import pages with React.lazy
const AddWorkPage = React.lazy(() => import('./pages/AddWorkPage'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const AdminEmployees = React.lazy(() => import('./pages/AdminEmployees'));
const AdminProfile = React.lazy(() => import('./pages/AdminProfile'));
const AdminPurchases = React.lazy(() => import('./pages/AdminPurchases'));
const AdminReports = React.lazy(() => import('./pages/AdminReports'));
const AdminWorks = React.lazy(() => import('./pages/AdminWorks'));
const AllEmployeeWorks = React.lazy(() => import('./pages/AllEmployeeWorks'));
const EmployeeDashboard = React.lazy(() => import('./pages/EmployeeDashboard'));
const EmployeeReports = React.lazy(() => import('./pages/EmployeeReports'));
const EmployeeWorks = React.lazy(() => import('./pages/EmployeeWorks'));
const SuperAdminDashboard = React.lazy(() => import('./pages/SuperAdminDashboard'));
const DurationTracking = React.lazy(() => import('./pages/DurationTracking'));

const NavLinks = ({ collapsed = false, isSuperAdmin, isAdmin, isEmployee, isActive, handleCloseSidebar }) => (
  <div style={{ opacity: collapsed ? 0 : 1, transition: 'opacity 0.2s ease', pointerEvents: collapsed ? 'none' : 'auto' }}>
    {isSuperAdmin && (
      <>
        <Link to="/superadmin/dashboard" className="nav-link" style={{ ...styles.navLink, ...(isActive('/superadmin/dashboard') ? styles.activeNavLink : {}) }} onClick={handleCloseSidebar} title="Shop Management">
          <span style={styles.navIcon}>⚙️</span>
          <span>Shop Management</span>
        </Link>
      </>
    )}

    {isAdmin && (
      <>
        <Link to="/admin/dashboard" className="nav-link" style={{ ...styles.navLink, ...(isActive('/admin/dashboard') ? styles.activeNavLink : {}) }} onClick={handleCloseSidebar} title="Dashboard">
          <span style={styles.navIcon}>📊</span>
          <span>Dashboard</span>
        </Link>
        <Link to="/admin/employees" className="nav-link" style={{ ...styles.navLink, ...(isActive('/admin/employees') ? styles.activeNavLink : {}) }} onClick={handleCloseSidebar} title="Employees">
          <span style={styles.navIcon}>👥</span>
          <span>Employees</span>
        </Link>
        <Link to="/admin/works" className="nav-link" style={{ ...styles.navLink, ...(isActive('/admin/works') ? styles.activeNavLink : {}) }} onClick={handleCloseSidebar} title="Works List">
          <span style={styles.navIcon}>💼</span>
          <span>Works List</span>
        </Link>
        <Link to="/admin/reports" className="nav-link" style={{ ...styles.navLink, ...(isActive('/admin/reports') ? styles.activeNavLink : {}) }} onClick={handleCloseSidebar} title="Reports">
          <span style={styles.navIcon}>📈</span>
          <span>Reports</span>
        </Link>
        <Link to="/admin/durations" className="nav-link" style={{ ...styles.navLink, ...(isActive('/admin/durations') ? styles.activeNavLink : {}) }} onClick={handleCloseSidebar} title="Duration Tracking">
          <span style={styles.navIcon}>⏳</span>
          <span>Expiry Tracking</span>
        </Link>
        <Link to="/admin/purchases" className="nav-link" style={{ ...styles.navLink, ...(isActive('/admin/purchases') ? styles.activeNavLink : {}) }} onClick={handleCloseSidebar} title="Purchase">
          <span style={styles.navIcon}>🛒</span>
          <span>Purchase</span>
        </Link>
        <Link to="/admin/profile" className="nav-link" style={{ ...styles.navLink, ...(isActive('/admin/profile') ? styles.activeNavLink : {}) }} onClick={handleCloseSidebar} title="Profile">
          <span style={styles.navIcon}>👤</span>
          <span>Profile</span>
        </Link>
      </>
    )}

    {isEmployee && (
      <>
        <Link to="/employee/dashboard" className="nav-link" style={{ ...styles.navLink, ...(isActive('/employee/dashboard') ? styles.activeNavLink : {}) }} onClick={handleCloseSidebar} title="Dashboard">
          <span style={styles.navIcon}>📊</span>
          <span>Dashboard</span>
        </Link>
        <Link to="/add-work" className="nav-link" style={{ ...styles.navLink, ...(isActive('/add-work') ? styles.activeNavLink : {}) }} onClick={handleCloseSidebar} title="Add New Entry">
          <span style={styles.navIcon}>➕</span>
          <span>Add New Entry</span>
        </Link>
        <Link to="/employee/works" className="nav-link" style={{ ...styles.navLink, ...(isActive('/employee/works') ? styles.activeNavLink : {}) }} onClick={handleCloseSidebar} title="All Works">
          <span style={styles.navIcon}>📝</span>
          <span>All Works</span>
        </Link>
        <Link to="/employee/all-works" className="nav-link" style={{ ...styles.navLink, ...(isActive('/employee/all-works') ? styles.activeNavLink : {}) }} onClick={handleCloseSidebar} title="All Employee Works">
          <span style={styles.navIcon}>🏢</span>
          <span>All Employee Works</span>
        </Link>
        <Link to="/employee/reports" className="nav-link" style={{ ...styles.navLink, ...(isActive('/employee/reports') ? styles.activeNavLink : {}) }} onClick={handleCloseSidebar} title="Reports">
          <span style={styles.navIcon}>📉</span>
          <span>Reports</span>
        </Link>
        <Link to="/employee/durations" className="nav-link" style={{ ...styles.navLink, ...(isActive('/employee/durations') ? styles.activeNavLink : {}) }} onClick={handleCloseSidebar} title="Duration Tracking">
          <span style={styles.navIcon}>⏳</span>
          <span>Expiry Tracking</span>
        </Link>
      </>
    )}
  </div>
);

const SidebarContent = ({ mobile = false, isHovered, isSuperAdmin, isAdmin, isEmployee, isActive, handleCloseSidebar, user, dashboardPath, handleLogout }) => {
  const collapsed = !mobile && !isHovered;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
      width: mobile ? '250px' : (isHovered ? '250px' : '40px'),
      transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      <div style={{
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '250px',
      }}>
        <div className="d-flex align-items-center justify-content-between mb-2">
          <Link to={dashboardPath} style={{ ...styles.brandLink, opacity: collapsed ? 0 : 1, transition: 'opacity 0.2s' }}>
            <span style={styles.brandText}>{user?.shopName?.toUpperCase() || 'SEVAGAN CENTRE'}</span>
          </Link>
          {collapsed && (
            <div style={{
              position: 'absolute',
              left: '0',
              width: '40px',
              textAlign: 'center',
              fontSize: '24px',
              color: 'rgba(255,255,255,0.7)',
              marginTop: '-10px'
            }}>
              ⋮
            </div>
          )}
        </div>

        <nav className="nav nav-pills flex-column gap-2 mt-4">
          <NavLinks collapsed={collapsed} isSuperAdmin={isSuperAdmin} isAdmin={isAdmin} isEmployee={isEmployee} isActive={isActive} handleCloseSidebar={handleCloseSidebar} />
        </nav>

        <div className="mt-auto pt-4 px-1" style={{ opacity: collapsed ? 0 : 1, transition: 'opacity 0.2s' }}>
          <div className="mb-3">
            <div style={styles.userName}>{user?.name}</div>
            <div style={styles.userRole}>{isSuperAdmin ? 'Super Admin' : (isAdmin ? 'Admin' : user?.employeeId)}</div>
          </div>
          <button type="button" className="btn btn-danger w-100" onClick={handleLogout} title="Logout">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};
// Protected route wrapper
const ProtectedRoute = ({ requiredRole }) => {
  const { user, logout, isAuthenticated, isAdmin, isEmployee, isSuperAdmin, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) return <Loading text="Checking authentication..." />;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (requiredRole === 'admin' && !isAdmin) {
    if (isSuperAdmin) return <Navigate to="/superadmin/dashboard" replace />;
    return <Navigate to="/employee/dashboard" replace />;
  }

  if (requiredRole === 'employee' && !isEmployee) {
    if (isSuperAdmin) return <Navigate to="/superadmin/dashboard" replace />;
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (requiredRole === 'superadmin' && !isSuperAdmin) {
    return <Navigate to={isAdmin ? "/admin/dashboard" : "/employee/dashboard"} replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCloseSidebar = () => setSidebarOpen(false);

  const isActive = (path) => location.pathname === path;
  const dashboardPath = isSuperAdmin ? '/superadmin/dashboard' : (isAdmin ? '/admin/dashboard' : '/employee/dashboard');

  return (
    <>
      {/* Mobile Header - only visible on mobile */}
      <header className="d-md-none sticky-top w-100" style={styles.mobileHeader}>
        <div className="d-flex align-items-center justify-content-between p-3">
          <Link to={dashboardPath} style={styles.mobileBrandLink}>
            {/* <span style={styles.brandIcon}>🏢</span> */}
            <span style={{ fontSize: '14px', fontWeight: '700', color: 'white' }}>{user?.shopName?.toUpperCase() || 'SEVAGAN'}</span>
          </Link>
          <button className="btn btn-light" onClick={() => setSidebarOpen(true)} style={styles.hamburgerBtn}>
            ☰
          </button>
        </div>
      </header>

      {/* Main Layout: Flex container for sidebar + content */}
      <div className="d-flex flex-column flex-md-row" style={styles.pageWrapper}>
        {/* Desktop Sidebar (hidden on mobile) */}
        <aside
          className="d-none d-md-flex flex-column flex-md-shrink-0"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            ...styles.sidebar,
            width: isHovered ? '250px' : '40px',
            padding: 0, // Padding moved to inner container in SidebarContent
            transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            overflow: 'visible'
          }}
        >
          <SidebarContent 
            isHovered={isHovered} 
            isSuperAdmin={isSuperAdmin} 
            isAdmin={isAdmin} 
            isEmployee={isEmployee} 
            isActive={isActive} 
            handleCloseSidebar={handleCloseSidebar} 
            user={user} 
            dashboardPath={dashboardPath} 
            handleLogout={handleLogout} 
          />
        </aside>

        {/* Mobile Offcanvas Sidebar */}
        {sidebarOpen && (
          <>
            <div style={styles.offcanvasBackdrop} onClick={handleCloseSidebar}></div>
            <aside className="d-md-none d-flex flex-column" style={styles.offcanvasSidebarContent}>
              <SidebarContent 
                mobile={true} 
                isHovered={isHovered} 
                isSuperAdmin={isSuperAdmin} 
                isAdmin={isAdmin} 
                isEmployee={isEmployee} 
                isActive={isActive} 
                handleCloseSidebar={handleCloseSidebar} 
                user={user} 
                dashboardPath={dashboardPath} 
                handleLogout={handleLogout} 
              />
            </aside>
          </>
        )}

        {/* Main Content */}
        <main
          className="flex-grow-1 p-3 p-md-4"
          style={{
            ...styles.mainContent,
            marginLeft: 0,
            transition: 'all 0.3s ease'
          }}
        >
          <div style={styles.content}>
            <Outlet />
          </div>
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
            <React.Suspense fallback={<Loading text="Loading..." />}>
              <Routes>
                {/* Public */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/landing" element={<LandingPage />} />

                {/* Admin */}
                <Route element={<ProtectedRoute requiredRole="admin" />}>
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/works" element={<AdminWorks />} />
                  <Route path="/admin/employees" element={<AdminEmployees />} />
                  <Route path="/admin/reports" element={<AdminReports />} />
                  <Route path="/admin/durations" element={<DurationTracking />} />
                  <Route path="/admin/purchases" element={<AdminPurchases />} />
                  <Route path="/admin/profile" element={<AdminProfile />} />
                </Route>

                {/* Super Admin */}
                <Route element={<ProtectedRoute requiredRole="superadmin" />}>
                  <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
                </Route>

                {/* Employee */}
                <Route element={<ProtectedRoute requiredRole="employee" />}>
                  <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
                  <Route path="/employee/works" element={<EmployeeWorks />} />
                  <Route path="/employee/all-works" element={<AllEmployeeWorks />} />
                  <Route path="/employee/reports" element={<EmployeeReports />} />
                  <Route path="/employee/durations" element={<DurationTracking />} />
                  <Route path="/add-work" element={<AddWorkPage />} />
                </Route>

                {/* Redirects */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </React.Suspense>
            <LiveClock />
          </div>
        </HashRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

const styles = {
  app: {
    minHeight: '100vh',
    backgroundColor: '#ffffff',
    overflowX: 'hidden'
  },
  pageWrapper: {
    minHeight: '100vh',
    backgroundColor: '#ffffff'
  },
  mobileHeader: {
    backgroundColor: '#3b8132',
    color: 'white',
    zIndex: 999,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
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
    padding: '6px 12px',
    borderRadius: '10px'
  },
  sidebar: {
    width: '250px',
    minHeight: '100vh',
    backgroundColor: '#3b8132',
    color: 'white',
    position: 'sticky',
    top: 0,
    padding: '24px 16px',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1000,
    boxShadow: '4px 0 12px rgba(0,0,0,0.1)'
  },
  offcanvasSidebarContent: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '250px',
    height: '100vh',
    backgroundColor: '#3b8132',
    color: 'white',
    padding: '24px 16px',
    zIndex: 1050,
    overflowY: 'auto',
    boxShadow: '2px 0 12px rgba(0,0,0,0.2)',
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
    fontWeight: '700',
    letterSpacing: '0.5px'
  },
  navLink: {
    padding: '12px 16px',
    color: 'rgba(255,255,255,0.85)',
    borderRadius: '10px',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s ease',
    marginBottom: '4px'
  },
  activeNavLink: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: 'white',
    fontWeight: '600'
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
  navIcon: {
    fontSize: '18px',
    minWidth: '24px',
    display: 'inline-flex',
    justifyContent: 'center',
    marginRight: '12px'
  },
  mainContent: {
    backgroundColor: '#ffffff',
    minHeight: '100vh',
    flex: 1,
    overflowX: 'hidden'
  },
  content: {
    padding: '10px',
    maxWidth: '100%',
    margin: '0',
    width: '100%'
  }
};

export default App;
