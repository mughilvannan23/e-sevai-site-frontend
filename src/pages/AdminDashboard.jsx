import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../services/api';
import Loading from '../components/common/Loading.jsx';
import { useToast } from '../components/common/Toast.jsx';
import { useNavigate } from 'react-router-dom';
const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  useEffect(() => {
    fetchStats();
  }, []);


  const navigate = useNavigate();

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
            <StatCard title="Total Employees" value={stats.employees.total} icon="👥" color="#3b8132" />
          </div>
          <div className="col-12 col-sm-6 col-md-6 col-lg-3">
            <StatCard title="Today's Works" value={stats.works.today} icon="📋" color="#3b8132" />
          </div>
          <div className="col-12 col-sm-6 col-md-6 col-lg-3">
            <StatCard title="Today's Revenue" value={`₹${stats.revenue.today.toLocaleString()}`} icon="💰" color="#3b8132" />
          </div>
          <div className="col-12 col-sm-6 col-md-6 col-lg-3">
            <StatCard title="Total Revenue" value={`₹${stats.revenue.total.toLocaleString()}`} icon="📊" color="#3b8132" />
          </div>
          <div className="col-12 col-sm-6 col-md-6 col-lg-3">
            <StatCard
              title="Total Profit"
              value={`${(stats.revenue.profit || 0) >= 0 ? '+' : ''}₹${(stats.revenue.profit || 0).toLocaleString()}`}
              icon="💎"
              color="#3b8132"
            />
          </div>
          <div className="col-12 col-sm-6 col-md-6 col-lg-3">
            <div style={{ ...styles.statCard, borderColor: '#3b8132' }}>
              <div style={{ ...styles.statIcon, backgroundColor: '#3b8132' }}>🏪</div>
              <div style={styles.statContent}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ ...styles.statValue, fontSize: '20px', marginBottom: '0' }}>₹{(stats.revenue.shopBalance || 0).toLocaleString()}</h3>
                    <p style={{ ...styles.statTitle, fontSize: '10px' }}>Cash Balance</p>
                  </div>
                  <div style={{ textAlign: 'right', borderLeft: '1px solid #eee', paddingLeft: '10px' }}>
                    <h3 style={{ ...styles.statValue, fontSize: '20px', marginBottom: '0', color: '#0dcaf0' }}>₹{(stats.revenue.todayGpay || 0).toLocaleString()}</h3>
                    <p style={{ ...styles.statTitle, fontSize: '10px' }}>Today's GPay</p>
                  </div>
                </div>
                <p style={{ ...styles.statTitle, marginTop: '5px', borderTop: '1px solid #eee', paddingTop: '5px' }}>Shop Balance</p>
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-md-6 col-lg-3">
            <div style={{ ...styles.statCard, borderColor: '#f39c12' }}>
              <div style={{ ...styles.statIcon, backgroundColor: '#f39c12' }}>💳</div>
              <div style={styles.statContent}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ ...styles.statValue, fontSize: '20px', marginBottom: '0' }}>{stats.aeps?.count || 0}</h3>
                    <p style={{ ...styles.statTitle, fontSize: '10px' }}>Today's Count</p>
                  </div>
                  <div style={{ textAlign: 'right', borderLeft: '1px solid #eee', paddingLeft: '10px' }}>
                    <h3 style={{ ...styles.statValue, fontSize: '20px', marginBottom: '0', color: '#f39c12' }}>₹{(stats.aeps?.amount || 0).toLocaleString()}</h3>
                    <p style={{ ...styles.statTitle, fontSize: '10px' }}>Today's Amount</p>
                  </div>
                </div>
                <p style={{ ...styles.statTitle, marginTop: '5px', borderTop: '1px solid #eee', paddingTop: '5px' }}>Today's AEPS</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4">
        <h2 style={styles.sectionTitle} className="fs-4 fs-md-3 mb-3">Revenue Overview</h2>
        <div className="row g-3">
          <div className="col-12 col-md-6 col-lg-3">
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
          <div className="col-12 col-md-6 col-lg-3"
            onClick={() => navigate('/admin/works', { state: { paymentStatus: 'Pending' } })}
            style={{ cursor: 'pointer' }}>
            <div style={styles.revenueCard} className="p-3 p-md-4 h-100">
              <h3 style={styles.revenueTitle}>Pending Payments</h3>
              <div style={{ ...styles.revenueValue, color: '#e74c3c' }}>
                {stats?.revenue.pending || 0} Customers
              </div>
              <div style={styles.revenueWorks}>
                Follow up required
              </div>
            </div>
          </div>
          <div className="col-12 col-md-6 col-lg-3"
            onClick={() => navigate('/admin/works', { state: { workStatus: 'Pending' } })}
            style={{ cursor: 'pointer' }}>
            <div style={styles.revenueCard} className="p-3 p-md-4 h-100">
              <h3 style={styles.revenueTitle}>Pending Works</h3>
              <div style={{ ...styles.revenueValue, color: '#f39c12' }}>
                {stats?.works.pending || 0}
              </div>
              <div style={styles.revenueWorks}>
                Action needed
              </div>
            </div>
          </div>
          <div className="col-12 col-md-6 col-lg-3"
            onClick={() => navigate('/admin/works', { state: { workStatus: 'Completed' } })}
            style={{ cursor: 'pointer' }}>
            <div style={{ ...styles.revenueCard, borderColor: '#3b8132' }} className="p-3 p-md-4 h-100">
              <h3 style={{ ...styles.revenueTitle, color: '#3b8132' }}>Completed Works</h3>
              <div style={{ ...styles.revenueValue, color: '#3b8132' }}>
                {stats?.works.completed || 0}
              </div>
              <div style={styles.revenueWorks}>
                Successfully finished
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.quickActions} className="p-3 p-md-4">
        <h2 style={styles.sectionTitle} className="fs-4 fs-md-3 mb-3">Quick Actions</h2>
        <div className="row g-3">
          <div className="col-12 col-md-4">
            <Link to="/admin/works" style={styles.actionBtn} className="w-100 d-flex align-items-center justify-content-center justify-content-md-start">
              <span style={styles.actionIcon}>📋</span>
              <span>Manage Works</span>
            </Link>
          </div>
          <div className="col-12 col-md-4">
            <Link to="/admin/employees" style={styles.actionBtn} className="w-100 d-flex align-items-center justify-content-center justify-content-md-start">
              <span style={styles.actionIcon}>👥</span>
              <span>Manage Employees</span>
            </Link>
          </div>
          <div className="col-12 col-md-4">
            <Link to="/admin/reports" style={styles.actionBtn} className="w-100 d-flex align-items-center justify-content-center justify-content-md-start">
              <span style={styles.actionIcon}>📊</span>
              <span>View Reports</span>
            </Link>
          </div>
          <div className="col-12 col-md-4">
            <Link to="/admin/purchases" style={styles.actionBtn} className="w-100 d-flex align-items-center justify-content-center justify-content-md-start">
              <span style={styles.actionIcon}>🛒</span>
              <span>Manage Purchases</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  title: {
    margin: '0 0 8px 0',
    fontWeight: '700',
    color: '#3b8132',
    letterSpacing: '0.5px'
  },
  subtitle: {
    margin: 0,
    color: '#666'
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    padding: '24px',
    borderRadius: '10px',
    border: '1px solid #e0e0e0',
    backgroundColor: 'white',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    height: '100%',
    transition: 'transform 0.2s ease'
  },
  statIcon: {
    width: '60px',
    height: '60px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    marginRight: '20px',
    flexShrink: 0,
    color: 'white'
  },
  statContent: {
    flex: 1
  },
  statValue: {
    margin: '0 0 4px 0',
    fontSize: '28px',
    fontWeight: '800',
    color: '#3b8132'
  },
  statTitle: {
    margin: 0,
    fontSize: '13px',
    color: '#666',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  sectionTitle: {
    fontWeight: '700',
    color: '#3b8132',
    marginBottom: '20px'
  },
  revenueCard: {
    borderRadius: '10px',
    backgroundColor: 'white',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    border: '1px solid #e0e0e0',
    transition: 'all 0.2s ease'
  },
  revenueTitle: {
    margin: '0 0 12px 0',
    fontSize: '18px',
    fontWeight: '700',
    color: '#3b8132'
  },
  revenueValue: {
    margin: '0 0 8px 0',
    fontSize: '32px',
    fontWeight: '800',
    color: '#3b8132'
  },
  revenueWorks: {
    margin: 0,
    fontSize: '14px',
    color: '#666'
  },
  quickActions: {
    backgroundColor: 'white',
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    border: '1px solid #e0e0e0',
    padding: '24px'
  },
  actionBtn: {
    gap: '12px',
    padding: '16px',
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    textDecoration: 'none',
    color: '#3b8132',
    fontWeight: '700',
    transition: 'all 0.2s ease',
    border: '1px solid #3b8132',
    display: 'flex',
    alignItems: 'center'
  },
  actionIcon: {
    fontSize: '20px'
  }
};

export default AdminDashboard;