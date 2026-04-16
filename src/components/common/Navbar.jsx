import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Navbar, Nav, Container } from 'react-bootstrap';

const NavigationBar = () => {
  const { user, logout, isAdmin, isEmployee } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <Navbar expand="lg" style={styles.navbar} variant="dark">
      {/* 🔥 CENTER FIX */}
      <Container fluid="lg" className="px-3">
        
        <Navbar.Brand as={Link} to="/" style={styles.brandLink}>
          <span style={styles.brandIcon}>🏢</span>
          <span style={styles.brandText}>e-Sevai Office</span>
        </Navbar.Brand>
        
        {user && <Navbar.Toggle aria-controls="basic-navbar-nav" />}

        {user && (
          <Navbar.Collapse id="basic-navbar-nav">
            
            {/* 🔥 MENU CENTER ON DESKTOP */}
            <Nav className="mx-auto d-flex flex-column flex-lg-row align-items-start align-items-lg-center gap-2 gap-lg-3">
              
              {isAdmin && (
                <>
                  <Nav.Link as={Link} to="/admin/dashboard"
                    style={{ ...styles.navLink, ...(isActive('/admin/dashboard') ? styles.activeLink : {}) }}>
                    Dashboard
                  </Nav.Link>

                  <Nav.Link as={Link} to="/admin/works"
                    style={{ ...styles.navLink, ...(isActive('/admin/works') ? styles.activeLink : {}) }}>
                    All Works
                  </Nav.Link>

                  <Nav.Link as={Link} to="/admin/employees"
                    style={{ ...styles.navLink, ...(isActive('/admin/employees') ? styles.activeLink : {}) }}>
                    Employees
                  </Nav.Link>

                  <Nav.Link as={Link} to="/admin/reports"
                    style={{ ...styles.navLink, ...(isActive('/admin/reports') ? styles.activeLink : {}) }}>
                    Reports
                  </Nav.Link>
                </>
              )}

              {isEmployee && (
                <>
                  <Nav.Link as={Link} to="/employee/dashboard"
                    style={{ ...styles.navLink, ...(isActive('/employee/dashboard') ? styles.activeLink : {}) }}>
                    Dashboard
                  </Nav.Link>

                  <Nav.Link as={Link} to="/employee/works"
                    style={{ ...styles.navLink, ...(isActive('/employee/works') ? styles.activeLink : {}) }}>
                    My Works
                  </Nav.Link>

                  <Nav.Link as={Link} to="/employee/reports"
                    style={{ ...styles.navLink, ...(isActive('/employee/reports') ? styles.activeLink : {}) }}>
                    Reports
                  </Nav.Link>
                </>
              )}
            </Nav>

            {/* 🔥 RIGHT SIDE */}
            <Nav className="d-flex flex-column flex-lg-row align-items-start align-items-lg-center gap-2">
              
              <div className="text-lg-end">
                <div style={styles.userName}>{user.name}</div>
                <div style={styles.userRole}>
                  {isAdmin ? 'Admin' : user.employeeId}
                </div>
              </div>

              <button
                onClick={handleLogout}
                style={styles.logoutBtn}
                className="btn w-100 w-lg-auto"
              >
                Logout
              </button>
            </Nav>

          </Navbar.Collapse>
        )}
      </Container>
    </Navbar>
  );
};

const styles = {
  navbar: {
    backgroundColor: '#2c3e50',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 1000
  },
  brandLink: {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    color: 'white'
  },
  brandIcon: {
    fontSize: '22px',
    marginRight: '8px'
  },
  brandText: {
    fontSize: '16px',
    fontWeight: 'bold'
  },
  navLink: {
    padding: '6px 12px',
    color: 'rgba(255,255,255,0.8)',
    borderRadius: '4px',
    fontSize: '14px'
  },
  activeLink: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: 'white'
  },
  userName: {
    color: 'white',
    fontSize: '14px',
    fontWeight: '500'
  },
  userRole: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '12px'
  },
  logoutBtn: {
    padding: '6px 12px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  }
};

export default NavigationBar;