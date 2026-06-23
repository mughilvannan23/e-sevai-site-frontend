import React, { useState, useEffect } from 'react';
import { workAPI } from '../services/api';
import Loading from '../components/common/Loading';
import { useToast } from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';
import { formatWorkStatus } from '../utils/formatters';

const EmployeeReports = () => {
  const [activeTab, setActiveTab] = useState('daily');
  const [loading, setLoading] = useState(false);
  const [works, setWorks] = useState([]);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    month: ''
  });
  const { user } = useAuth();
  const { success, error } = useToast();

  useEffect(() => {
    if (activeTab === 'daily') {
      fetchDailyReport();
    } else if (activeTab === 'monthly') {
      fetchMonthlyReport();
    }
  }, [activeTab, filters.startDate, filters.endDate, filters.month]);

  const fetchDailyReport = async () => {
    if (!filters.startDate || !filters.endDate) return;

    try {
      setLoading(true);
      const worksData = [];

      // Fetch works for each day in the range
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const response = await workAPI.getMyWorks({ date: dateStr });
        if (response.data.success && response.data.works.length > 0) {
          worksData.push({ date: dateStr, works: response.data.works });
        }
      }

      setWorks(worksData);


      // Calculate stats
      const allWorks = worksData.flatMap(d => d.works);
      const totalWorks = allWorks.length;
      const totalEarnings = allWorks.reduce((sum, w) => {
        if (w.paymentStatus === 'Paid') return sum + w.amount;
        if (w.paymentStatus === 'Split') return sum + (w.paidAmount || 0);
        return sum;
      }, 0);
      const pendingAmount = allWorks.reduce((sum, w) => {
        if (w.paymentStatus === 'Pending') return sum + w.amount;
        if (w.paymentStatus === 'Split') return sum + (w.pendingAmount || 0);
        return sum;
      }, 0);

      const completedWorks = allWorks.filter(w => w.workStatus === 'Completed').length;
      const inProgressWorks = allWorks.filter(w => w.workStatus === 'In Progress').length;

      const totalDiscount = allWorks.reduce((sum, w) => sum + (w.totalDiscount || 0), 0);
      setStats({
        totalWorks,
        totalEarnings,
        pendingAmount,
        completedWorks,
        inProgressWorks,
        totalDiscount
      });
    } catch (err) {
      console.error('Error fetching daily report:', err);
      error('Failed to fetch daily report');
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyReport = async () => {
    if (!filters.month) return;

    try {
      setLoading(true);
      const [year, month] = filters.month.split('-');
      const startDate = `${year}-${month}-01`;
      const endDate = new Date(year, parseInt(month), 0).toISOString().split('T')[0];

      const response = await workAPI.getMyWorks({
        startDate,
        endDate
      });

      if (response.data.success) {
        // Group works by date
        const groupedWorks = response.data.works.reduce((acc, work) => {
          const date = new Date(work.date).toISOString().split('T')[0];
          if (!acc[date]) acc[date] = [];
          acc[date].push(work);
          return acc;
        }, {});

        const worksData = Object.entries(groupedWorks).map(([date, works]) => ({
          date,
          works
        }));

        setWorks(worksData);

        // Calculate stats
        const totalWorks = response.data.works.length;
        const totalEarnings = response.data.works.reduce((sum, w) => {
          if (w.paymentStatus === 'Paid') return sum + w.amount;
          if (w.paymentStatus === 'Split') return sum + (w.paidAmount || 0);
          return sum;
        }, 0);
        const pendingAmount = response.data.works.reduce((sum, w) => {
          if (w.paymentStatus === 'Pending') return sum + w.amount;
          if (w.paymentStatus === 'Split') return sum + (w.pendingAmount || 0);
          return sum;
        }, 0);
        const completedWorks = response.data.works.filter(w => w.workStatus === 'Completed').length;
        const inProgressWorks = response.data.works.filter(w => w.workStatus === 'In Progress').length;

        const totalDiscount = response.data.works.reduce((sum, w) => sum + (w.totalDiscount || 0), 0);
        setStats({
          totalWorks,
          totalEarnings,
          pendingAmount,
          completedWorks,
          inProgressWorks,
          totalDiscount
        });
      }
    } catch (err) {
      console.error('Error fetching monthly report:', err);
      error('Failed to fetch monthly report');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerateReport = (e) => {
    e.preventDefault();
    if (activeTab === 'daily') {
      fetchDailyReport();
    } else {
      fetchMonthlyReport();
    }
  };

  const getStatusBadge = (status) => {
    const isPositive = status === 'Paid' || status === 'Completed';
    return (
      <span style={{
        ...styles.badge,
        backgroundColor: isPositive ? '#3b8132' : (status === 'Pending' ? '#e74c3c' : (status === 'Split' ? '#f39c12' : '#f39c12')),
        color: 'white'
      }}>
        {formatWorkStatus(status)}
      </span>
    );
  };

  return (
    <div className="container-fluid p-0">
      <div className="mb-4">
        <h1 style={styles.title} className="fs-3 fs-md-2">My Reports</h1>
        <p style={styles.subtitle} className="fs-6 text-muted">View your work reports and earnings</p>
      </div>

      <div className="d-flex flex-wrap gap-2 mb-4">
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'daily' ? styles.activeTab : {})
          }}
          className="flex-grow-1 flex-sm-grow-0"
          onClick={() => setActiveTab('daily')}
        >
          Date-wise Report
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'monthly' ? styles.activeTab : {})
          }}
          className="flex-grow-1 flex-sm-grow-0"
          onClick={() => setActiveTab('monthly')}
        >
          Monthly Report
        </button>
      </div>

      <div style={styles.reportCard}>
        <div style={styles.filtersCard} className="p-3 p-md-4">
          <form onSubmit={handleGenerateReport} className="d-flex flex-column gap-3">
            <div className="row g-3">
              {activeTab === 'daily' ? (
                <>
                  <div className="col-12 col-md-6 d-flex flex-column gap-2">
                    <label style={styles.label}>From Date</label>
                    <input
                      type="date"
                      name="startDate"
                      value={filters.startDate}
                      onChange={handleFilterChange}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="col-12 col-md-6 d-flex flex-column gap-2">
                    <label style={styles.label}>To Date</label>
                    <input
                      type="date"
                      name="endDate"
                      value={filters.endDate}
                      onChange={handleFilterChange}
                      className="form-control"
                      required
                    />
                  </div>
                </>
              ) : (
                <div className="col-12 col-md-6 d-flex flex-column gap-2">
                  <label style={styles.label}>Select Month</label>
                  <input
                    type="month"
                    name="month"
                    value={filters.month}
                    onChange={handleFilterChange}
                    className="form-control"
                    required
                  />
                </div>
              )}
            </div>
            <button type="submit" style={styles.generateBtn} className="btn w-100 w-sm-auto text-white mt-2">
              Generate Report
            </button>
          </form>
        </div>

        {loading ? (
          <Loading text="Generating report..." />
        ) : works.length > 0 ? (
          <>
            <div style={styles.summaryCard} className="p-3 p-md-4">
              <h3 style={styles.summaryTitle} className="fs-5 mb-3">Summary</h3>
              <div className="row g-3">
                <div className="col-12 col-sm-6 col-lg-3">
                  <div style={styles.summaryItem} className="h-100">
                    <span style={styles.summaryLabel}>Total Works</span>
                    <span style={styles.summaryValue}>{stats?.totalWorks || 0}</span>
                  </div>
                </div>
                <div className="col-12 col-sm-6 col-lg-3">
                  <div style={styles.summaryItem} className="h-100">
                    <span style={styles.summaryLabel}>Total Earnings</span>
                    <span style={styles.summaryValue}>
                      {formatCurrency(stats?.totalEarnings || 0)}
                    </span>
                  </div>
                </div>
                <div className="col-12 col-sm-6 col-lg-3">
                  <div style={styles.summaryItem} className="h-100">
                    <span style={styles.summaryLabel}>Pending Amount</span>
                    <span style={{ ...styles.summaryValue, color: '#e74c3c' }}>
                      {formatCurrency(stats?.pendingAmount || 0)}
                    </span>
                  </div>
                </div>
                <div className="col-12 col-sm-6 col-lg-3">
                  <div style={styles.summaryItem} className="h-100">
                    <span style={styles.summaryLabel}>Collection Rate</span>
                    <span style={styles.summaryValue}>
                      {stats?.totalEarnings > 0
                        ? ((stats.totalEarnings / (stats.totalEarnings + stats.pendingAmount)) * 100).toFixed(0) + '%'
                        : '0%'
                      }
                    </span>
                  </div>
                </div>
                <div className="col-12 col-sm-6 col-lg-3">
                  <div style={styles.summaryItem} className="h-100">
                    <span style={styles.summaryLabel}>Total Discount Given</span>
                    <span style={{ ...styles.summaryValue, color: '#e74c3c' }}>
                      {formatCurrency(stats?.totalDiscount || 0)}
                    </span>
                  </div>
                </div>
                <div className="col-12 col-sm-6 col-lg-3">
                  <div style={styles.summaryItem}>
                    <span style={styles.summaryLabel}>Completed Works</span>
                    <span style={{ ...styles.summaryValue, color: '#3b8132' }}>
                      {stats?.completedWorks || 0}
                    </span>
                  </div>
                </div>

                <div className="col-12 col-sm-6 col-lg-3">
                  <div style={styles.summaryItem}>
                    <span style={styles.summaryLabel}>Pending Works</span>
                    <span style={{ ...styles.summaryValue, color: '#f39c12' }}>
                      {stats?.inProgressWorks || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 p-md-4">
              <h3 style={styles.worksTitle} className="fs-5 mb-3">Detailed Work Entries</h3>
              {works.map((dayData) => (
                <div key={dayData.date} style={styles.daySection}>
                  <div style={styles.dayHeader}>
                    <h4 style={styles.dayTitle}>{formatDate(dayData.date)}</h4>
                    <span style={styles.dayCount}>{dayData.works.length} works</span>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-hover mb-0" style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.th}>Customer</th>
                          <th style={styles.th}>Work Title</th>
                          <th style={styles.th}>Amount</th>
                          <th style={styles.th}>Payment</th>
                          <th style={styles.th}>Work Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dayData.works.map(work => (
                          <tr key={work._id}>
                            <td style={styles.td}>
                              <div className="fw-bold text-truncate" style={{ maxWidth: '150px' }}>{work.customerName}</div>
                              <div className="text-muted small">{work.customerPhone || '-'}</div>
                            </td>
                            <td style={{ ...styles.td, whiteSpace: 'normal', maxWidth: '200px' }}>
                              {work.items && work.items.length > 0
                                ? work.items.map(i => {
                                    const aepsInfo = i.presetChargeType === 'AEPS' ? ` [AEPS: ₹${i.presetAmount || 0}]` : '';
                                    return `${i.title}${aepsInfo} (x${i.quantity || 1})`;
                                  }).join(', ')
                                : work.workTitle}
                            </td>
                            <td style={styles.td}>
                              <div>{formatCurrency(work.totalAmount || work.amount || 0)}</div>
                              {work.paymentStatus === 'Split' && (
                                <div style={{ fontSize: '11px', color: '#e74c3c' }}>
                                  Pending: {formatCurrency(work.pendingAmount || 0)}
                                </div>
                              )}
                            </td>
                            <td style={styles.td}>
                              {getStatusBadge(work.paymentStatus)}
                            </td>
                            <td style={styles.td}>
                              {getStatusBadge(work.workStatus)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={styles.noData}>
            <p>No data available for the selected period.</p>
          </div>
        )}
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
  tab: {
    padding: '12px 24px',
    backgroundColor: '#ffffff',
    border: '1px solid #3b8132',
    color: '#3b8132',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  activeTab: {
    backgroundColor: '#3b8132',
    color: 'white',
    borderColor: '#3b8132'
  },
  reportCard: {
    backgroundColor: 'white',
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    overflow: 'hidden',
    border: '1px solid #e0e0e0'
  },
  filtersCard: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e0e0e0',
    padding: '24px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#2c3e50'
  },
  generateBtn: {
    padding: '10px 24px',
    backgroundColor: '#3b8132',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e0e0e0',
    padding: '24px'
  },
  summaryTitle: {
    fontWeight: '700',
    color: '#3b8132',
    marginBottom: '20px'
  },
  summaryItem: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    border: '1px solid #e0e0e0',
    boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
  },
  summaryLabel: {
    fontSize: '12px',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontWeight: '600'
  },
  summaryValue: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#3b8132'
  },
  worksTitle: {
    fontWeight: '700',
    color: '#3b8132',
    marginBottom: '20px'
  },
  daySection: {
    marginBottom: '24px',
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    overflow: 'hidden',
    border: '1px solid #e0e0e0'
  },
  dayHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #e0e0e0'
  },
  dayTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '700',
    color: '#3b8132'
  },
  dayCount: {
    fontSize: '14px',
    color: '#3b8132',
    backgroundColor: 'rgba(59, 129, 50, 0.1)',
    padding: '4px 12px',
    borderRadius: '20px',
    fontWeight: '600'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    padding: '12px 20px',
    textAlign: 'left',
    backgroundColor: '#ffffff',
    fontWeight: '600',
    color: '#3b8132',
    borderBottom: '2px solid #3b8132',
    fontSize: '14px'
  },
  td: {
    padding: '12px 20px',
    borderBottom: '1px solid #e0e0e0',
    fontSize: '14px',
    backgroundColor: 'white',
    color: '#2c3e50'
  },
  badge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600'
  },
  noData: {
    padding: '60px 40px',
    textAlign: 'center',
    color: '#666',
    fontSize: '16px'
  }
};

export default EmployeeReports;
