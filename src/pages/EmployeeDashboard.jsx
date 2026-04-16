import React, { useState, useEffect } from 'react';
import { workAPI } from '../services/api';
import Loading from '../components/common/Loading';
import { useToast } from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';

const EmployeeDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { success, error } = useToast();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await workAPI.getMyWorkStats();
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
        <h1 style={styles.title} className="fs-3 fs-md-2">Welcome back, {user?.name?.split(' ')[0]}!</h1>
        <p style={styles.subtitle} className="fs-6 text-muted">Here's your work overview</p>
      </div>

      {stats && (
        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-6 col-md-6 col-lg-3">
            <StatCard title="Today's Tasks" value={stats.todayWorks} icon="📋" color="#3498db" />
          </div>
          <div className="col-12 col-sm-6 col-md-6 col-lg-3">
            <StatCard title="Today's Earnings" value={`₹${stats.todayEarnings.toLocaleString()}`} icon="💰" color="#27ae60" />
          </div>
          <div className="col-12 col-sm-6 col-md-6 col-lg-3">
            <StatCard title="Total Works" value={stats.totalWorks} icon="📊" color="#f39c12" />
          </div>
          <div className="col-12 col-sm-6 col-md-6 col-lg-3">
            <StatCard title="Total Earnings" value={`₹${stats.totalEarnings.toLocaleString()}`} icon="🏆" color="#9b59b6" />
          </div>
        </div>
      )}

      <div className="mb-4">
        <h2 style={styles.sectionTitle} className="fs-4 fs-md-3 mb-3">This Month Overview</h2>
        <div className="row g-3">
          <div className="col-12 col-md-6">
            <div style={styles.detailCard} className="h-100 p-3 p-md-4">
              <h3 style={styles.detailTitle}>Works Completed</h3>
              <div style={styles.detailValue}>
                {stats?.monthWorks || 0}
              </div>
              <div style={styles.detailSubtext}>
                {stats?.pendingWorks || 0} pending
              </div>
            </div>
          </div>
          <div className="col-12 col-md-6">
            <div style={styles.detailCard} className="h-100 p-3 p-md-4">
              <h3 style={styles.detailTitle}>Earnings</h3>
              <div style={styles.detailValue}>
                ₹{stats?.monthEarnings.toLocaleString() || '0'}
              </div>
              <div style={styles.detailSubtext}>
                Pending: ₹{stats?.pendingPayments?.toLocaleString() || '0'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.quickActions} className="p-3 p-md-4">
        <h2 style={styles.sectionTitle} className="fs-4 fs-md-3 mb-3">Quick Actions</h2>
        <div className="row g-3">
          <div className="col-12 col-md-4">
            <a href="/e-sevai-final-frontend/employee/works" style={styles.actionBtn} className="w-100 d-flex align-items-center justify-content-center justify-content-md-start">
              <span style={styles.actionIcon}>➕</span>
              <span>Add New Work</span>
            </a>
          </div>
          <div className="col-12 col-md-4">
            <a href="/e-sevai-final-frontend/employee/works" style={styles.actionBtn} className="w-100 d-flex align-items-center justify-content-center justify-content-md-start">
              <span style={styles.actionIcon}>📋</span>
              <span>View My Works</span>
            </a>
          </div>
          <div className="col-12 col-md-4">
            <a href="/e-sevai-final-frontend/employee/reports" style={styles.actionBtn} className="w-100 d-flex align-items-center justify-content-center justify-content-md-start">
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
  detailCard: {
    borderRadius: '12px',
    backgroundColor: 'white',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: '1px solid #e9ecef'
  },
  detailTitle: {
    margin: '0 0 12px 0',
    fontSize: '18px',
    fontWeight: '600',
    color: '#2c3e50'
  },
  detailValue: {
    margin: '0 0 8px 0',
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#27ae60'
  },
  detailSubtext: {
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

export default EmployeeDashboard;