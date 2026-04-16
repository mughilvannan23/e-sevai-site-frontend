import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import Loading from '../components/common/Loading.jsx';
import { useToast } from '../components/common/Toast.jsx';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDashboardStats();
      if (response.data.success) {
        setStats(response.data.stats);
      } else {
        error('Failed to fetch dashboard stats');
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      error('Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <div style={{ ...styles.statCard, borderColor: color }}>
      <div style={{ ...styles.statIcon, backgroundColor: color }}>
        {icon}
      </div>
      <div style={styles.statContent}>
        <h3 style={styles.statValue}>{value}</h3>
        <p style={styles.statTitle}>{title}</p>
      </div>
    </div>
  );

  if (loading) {
    return <Loading text="Loading dashboard..." />;
  }

  return (
    <div className="container-fluid p-0">
      <div className="mb-4">
        <h1 style={styles.title} className="fs-3 fs-md-2">Admin Dashboard</h1>
        <p style={styles.subtitle} className="fs-6 text-muted">Overview of office management system</p>
      </div>

      {stats && (
        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-6 col-md-6 col-lg-3">
            <StatCard title="Total Employees" value={stats.employees.total} icon="👥" color="#3498db" />
          </div>
          <div className="col-12 col-sm-6 col-md-6 col-lg-3">
            <StatCard title="Today's Works" value={stats.works.today} icon="📋" color="#2ecc71" />
          </div>
          <div className="col-12 col-sm-6 col-md-6 col-lg-3">
            <StatCard title="Today's Revenue" value={`₹${stats.revenue.today.toLocaleString()}`} icon="💰" color="#f39c12" />
          </div>
          <div className="col-12 col-sm-6 col-md-6 col-lg-3">
            <StatCard title="Total Revenue" value={`₹${stats.revenue.total.toLocaleString()}`} icon="📊" color="#9b59b6" />
          </div>
        </div>
      )}

      <div className="mb-4">
        <h2 style={styles.sectionTitle} className="fs-4 fs-md-3 mb-3">Revenue Overview</h2>
        <div className="row g-3">
          <div className="col-12 col-md-6">
            <div style={styles.revenueCard} className="p-3 p-md-4 h-100">
              <h3 style={styles.revenueTitle}>This Month</h3>
              <div style={styles.revenueValue}>
                ₹{stats?.revenue.month.toLocaleString() || '0'}
              </div>
              <div style={styles.revenueWorks}>
                {stats?.works.month || 0} works completed
              </div>
            </div>
          </div>
          <div className="col-12 col-md-6">
            <div style={styles.revenueCard} className="p-3 p-md-4 h-100">
              <h3 style={styles.revenueTitle}>Pending Payments</h3>
              <div style={{ ...styles.revenueValue, color: '#e74c3c' }}>
                ₹{stats?.revenue.pending.toLocaleString() || '0'}
              </div>
              <div style={styles.revenueWorks}>
                Follow up required
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.quickActions} className="p-3 p-md-4">
        <h2 style={styles.sectionTitle} className="fs-4 fs-md-3 mb-3">Quick Actions</h2>
        <div className="row g-3">
          <div className="col-12 col-md-4">
            <a href="/e-sevai-final-frontend/admin/works" style={styles.actionBtn} className="w-100 d-flex align-items-center justify-content-center justify-content-md-start">
              <span style={styles.actionIcon}>📋</span>
              <span>Manage Works</span>
            </a>
          </div>
          <div className="col-12 col-md-4">
            <a href="/e-sevai-final-frontend/admin/employees" style={styles.actionBtn} className="w-100 d-flex align-items-center justify-content-center justify-content-md-start">
              <span style={styles.actionIcon}>👥</span>
              <span>Manage Employees</span>
            </a>
          </div>
          <div className="col-12 col-md-4">
            <a href="/e-sevai-final-frontend/admin/reports" style={styles.actionBtn} className="w-100 d-flex align-items-center justify-content-center justify-content-md-start">
              <span style={styles.actionIcon}>📊</span>
              <span>View Reports</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  title: {
    margin: '0 0 8px 0',
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  subtitle: {
    margin: 0
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    padding: '20px',
    borderRadius: '12px',
    border: '2px solid',
    backgroundColor: 'white',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    height: '100%'
  },
  statIcon: {
    width: '60px',
    height: '60px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    marginRight: '20px',
    flexShrink: 0
  },
  statContent: {
    flex: 1
  },
  statValue: {
    margin: '0 0 4px 0',
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  statTitle: {
    margin: 0,
    fontSize: '14px',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  revenueCard: {
    borderRadius: '12px',
    backgroundColor: 'white',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: '1px solid #e9ecef'
  },
  revenueTitle: {
    margin: '0 0 12px 0',
    fontSize: '18px',
    fontWeight: '600',
    color: '#2c3e50'
  },
  revenueValue: {
    margin: '0 0 8px 0',
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#27ae60'
  },
  revenueWorks: {
    margin: 0,
    fontSize: '14px',
    color: '#666'
  },
  quickActions: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: '1px solid #e9ecef'
  },
  actionBtn: {
    gap: '12px',
    padding: '16px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    textDecoration: 'none',
    color: '#2c3e50',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    border: '1px solid #e9ecef'
  },
  actionIcon: {
    fontSize: '20px'
  }
};

export default AdminDashboard;