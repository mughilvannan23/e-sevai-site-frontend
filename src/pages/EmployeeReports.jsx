import React, { useState, useEffect } from 'react';
import { workAPI } from '../services/api';
import Loading from '../components/common/Loading';
import { useToast } from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';

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
      const totalEarnings = allWorks.filter(w => w.paymentStatus === 'Paid').reduce((sum, w) => sum + w.amount, 0);
      const pendingAmount = allWorks.filter(w => w.paymentStatus === 'Pending').reduce((sum, w) => sum + w.amount, 0);

      setStats({ totalWorks, totalEarnings, pendingAmount });
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
        const totalEarnings = response.data.works.filter(w => w.paymentStatus === 'Paid').reduce((sum, w) => sum + w.amount, 0);
        const pendingAmount = response.data.works.filter(w => w.paymentStatus === 'Pending').reduce((sum, w) => sum + w.amount, 0);

        setStats({ totalWorks, totalEarnings, pendingAmount });
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
    return `₹${amount.toLocaleString()}`;
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
    const isPaid = status === 'Paid';
    return (
      <span style={{
        ...styles.badge,
        backgroundColor: isPaid ? '#27ae60' : '#e74c3c',
        color: 'white'
      }}>
        {status}
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
                        ? ((stats.totalEarnings / (stats.totalEarnings + stats.pendingAmount)) * 100).toFixed(1) + '%'
                        : '0%'
                      }
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
                        </tr>
                      </thead>
                      <tbody>
                        {dayData.works.map(work => (
                          <tr key={work._id}>
                            <td style={styles.td}>{work.customerName}</td>
                            <td style={styles.td}>{work.workTitle}</td>
                            <td style={styles.td}>{formatCurrency(work.amount)}</td>
                            <td style={styles.td}>
                              {getStatusBadge(work.paymentStatus)}
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
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  subtitle: {
    margin: 0
  },
  tab: {
    padding: '12px 24px',
    backgroundColor: '#f8f9fa',
    border: '1px solid #e9ecef',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  activeTab: {
    backgroundColor: '#3498db',
    color: 'white',
    borderColor: '#3498db'
  },
  reportCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    overflow: 'hidden'
  },
  filtersCard: {
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #e9ecef'
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#333'
  },
  generateBtn: {
    padding: '10px 24px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  summaryCard: {
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #e9ecef'
  },
  summaryTitle: {
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  summaryItem: {
    backgroundColor: 'white',
    padding: '16px',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  summaryLabel: {
    fontSize: '12px',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  summaryValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  worksTitle: {
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  daySection: {
    marginBottom: '24px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    overflow: 'hidden'
  },
  dayHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: '#e9ecef'
  },
  dayTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600',
    color: '#2c3e50'
  },
  dayCount: {
    fontSize: '14px',
    color: '#666',
    backgroundColor: 'white',
    padding: '4px 12px',
    borderRadius: '20px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    padding: '12px',
    textAlign: 'left',
    backgroundColor: 'white',
    fontWeight: '600',
    color: '#2c3e50',
    borderBottom: '2px solid #e9ecef',
    fontSize: '14px'
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid #e9ecef',
    fontSize: '14px',
    backgroundColor: 'white'
  },
  badge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500'
  },
  noData: {
    padding: '40px',
    textAlign: 'center',
    color: '#666',
    fontSize: '16px'
  }
};

export default EmployeeReports;