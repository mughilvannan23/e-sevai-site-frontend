import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import Loading from '../components/common/Loading';
import { useToast } from '../components/common/Toast';

const AdminReports = () => {
  const [activeTab, setActiveTab] = useState('revenue');
  const [loading, setLoading] = useState(false);
  const [revenueData, setRevenueData] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    groupBy: 'day'
  });
  const { success, error } = useToast();

  useEffect(() => {
    if (activeTab === 'revenue' && filters.startDate && filters.endDate) {
      fetchRevenueReport();
    } else if (activeTab === 'performance') {
      fetchPerformanceReport();
    }
  }, [activeTab, filters]);

  const fetchRevenueReport = async () => {
    if (!filters.startDate || !filters.endDate) return;

    try {
      setLoading(true);
      const response = await adminAPI.getRevenueReport(filters);
      if (response.data.success) {
        setRevenueData(response.data.revenueData);
      }
    } catch (err) {
      console.error('Error fetching revenue report:', err);
      error('Failed to fetch revenue report');
    } finally {
      setLoading(false);
    }
  };

  const fetchPerformanceReport = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getEmployeePerformance(filters);
      if (response.data.success) {
        setPerformanceData(response.data.performanceData);
      }
    } catch (err) {
      console.error('Error fetching performance report:', err);
      error('Failed to fetch performance report');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleRevenueReport = (e) => {
    e.preventDefault();
    fetchRevenueReport();
  };

  const handleDownloadExcel = async () => {
    if (!filters.startDate || !filters.endDate) {
      error('Please select both start and end dates');
      return;
    }
    try {
      success('Initiating Excel download...');
      const response = await adminAPI.downloadRevenueExcel(filters);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Revenue_Report.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      success('Excel downloaded successfully');
    } catch (err) {
      console.error('Error downloading Excel:', err);
      error('Failed to download Excel report');
    }
  };

  const handleDownloadPDF = async () => {
    if (!filters.startDate || !filters.endDate) {
      error('Please select both start and end dates');
      return;
    }
    try {
      success('Initiating PDF download...');
      const response = await adminAPI.downloadRevenuePDF(filters);
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Revenue_Report.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      success('PDF downloaded successfully');
    } catch (err) {
      console.error('Error downloading PDF:', err);
      error('Failed to download PDF report');
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

  const getRevenueChartData = () => {
    if (!revenueData.length) return null;

    const labels = revenueData.map(item => item.period);
    const totalRevenue = revenueData.map(item => item.totalRevenue);
    const pendingRevenue = revenueData.map(item => item.pendingRevenue);

    return { labels, totalRevenue, pendingRevenue };
  };

  const getPerformanceChartData = () => {
    if (!performanceData.length) return null;

    const labels = performanceData.map(emp => emp.employee.name);
    const totalWorks = performanceData.map(emp => emp.stats.totalWorks);
    const completedWorks = performanceData.map(emp => emp.stats.completedWorks);

    return { labels, totalWorks, completedWorks };
  };

  return (
    <div className="container-fluid p-0">
      <div className="mb-4">
        <h1 style={styles.title} className="fs-3 fs-md-2">Reports</h1>
        <p style={styles.subtitle} className="fs-6 text-muted">Analytics and performance reports</p>
      </div>

      <div className="d-flex flex-wrap gap-2 mb-4">
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'revenue' ? styles.activeTab : {})
          }}
          className="flex-grow-1 flex-sm-grow-0"
          onClick={() => setActiveTab('revenue')}
        >
          Revenue Report
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'performance' ? styles.activeTab : {})
          }}
          className="flex-grow-1 flex-sm-grow-0"
          onClick={() => setActiveTab('performance')}
        >
          Employee Performance
        </button>
      </div>

      {activeTab === 'revenue' && (
        <div style={styles.reportCard}>
          <div style={styles.filtersCard}>
            <form onSubmit={handleRevenueReport} className="d-flex flex-column">
              <div className="row g-3">
                <div className="col-12 col-sm-6 col-md-4 d-flex flex-column gap-2">
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
                <div className="col-12 col-sm-6 col-md-4 d-flex flex-column gap-2">
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
                <div className="col-12 col-md-4 d-flex flex-column gap-2">
                  <label style={styles.label}>Group By</label>
                  <select
                    name="groupBy"
                    value={filters.groupBy}
                    onChange={handleFilterChange}
                    className="form-select"
                  >
                    <option value="day">Day</option>
                    <option value="month">Month</option>
                    <option value="year">Year</option>
                  </select>
                </div>
              </div>
              <button type="submit" style={styles.generateBtn} className="btn w-100 w-md-auto text-white mt-3">
                Generate Report
              </button>
            </form>
          </div>

          {loading ? (
            <Loading text="Generating revenue report..." />
          ) : revenueData.length > 0 ? (
            <>
              <div style={styles.chartContainer} className="p-3 p-md-4">
                <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start mb-4 gap-3">
                  <div className="d-flex flex-column gap-2">
                    <h3 style={styles.chartTitle}>Revenue Overview</h3>
                    <div className="d-flex flex-wrap gap-2">
                      <button onClick={handleDownloadExcel} style={styles.downloadBtn} className="btn">
                        Download Excel (.xlsx)
                      </button>
                      <button onClick={handleDownloadPDF} style={{ ...styles.downloadBtn, backgroundColor: '#e74c3c' }} className="btn">
                        Download PDF (.pdf)
                      </button>
                    </div>
                  </div>
                  <div className="d-flex flex-wrap gap-3">
                    <span style={styles.legendItem}>
                      <span style={{ ...styles.legendColor, backgroundColor: '#3498db' }}></span>
                      Total Revenue
                    </span>
                    <span style={styles.legendItem}>
                      <span style={{ ...styles.legendColor, backgroundColor: '#e74c3c' }}></span>
                      Pending Revenue
                    </span>
                  </div>
                </div>
                <div style={styles.chart}>
                  {revenueData.map((item) => (
                    <div key={item.period} style={styles.chartBar}>
                      <div style={styles.barLabel}>{item.period}</div>
                      <div style={styles.barContainer}>
                        <div
                          style={{
                            ...styles.bar,
                            backgroundColor: '#3498db',
                            width: `${(item.totalRevenue / Math.max(...revenueData.map(d => d.totalRevenue))) * 100}%`
                          }}
                        >
                          {formatCurrency(item.totalRevenue)}
                        </div>
                        <div
                          style={{
                            ...styles.bar,
                            backgroundColor: '#e74c3c',
                            width: `${(item.pendingRevenue / Math.max(...revenueData.map(d => d.totalRevenue))) * 100}%`
                          }}
                        >
                          {formatCurrency(item.pendingRevenue)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={styles.summaryCard} className="p-3 p-md-4">
                <h3 style={styles.summaryTitle} className="fs-5 mb-3">Summary</h3>
                <div className="row g-3">
                  <div className="col-12 col-sm-6 col-md-4 col-lg">
                    <div style={styles.summaryItem} className="h-100">
                      <span style={styles.summaryLabel} className="d-block mb-1">Expected Revenue</span>
                      <span style={styles.summaryValue}>
                        {formatCurrency(revenueData.reduce((sum, item) => sum + item.totalRevenue, 0))}
                      </span>
                    </div>
                  </div>
                  <div className="col-12 col-sm-6 col-md-4 col-lg">
                    <div style={styles.summaryItem} className="h-100">
                      <span style={styles.summaryLabel} className="d-block mb-1">Actual Revenue</span>
                      <span style={{
                        ...styles.summaryValue,
                        color: revenueData.reduce((sum, item) => sum + item.totalRevenue, 0) !== revenueData.reduce((sum, item) => sum + item.enteredTotalRevenue, 0) ? '#e67e22' : '#2c3e50'
                      }}>
                        {formatCurrency(revenueData.reduce((sum, item) => sum + item.enteredTotalRevenue, 0))}
                      </span>
                    </div>
                  </div>
                  <div className="col-12 col-sm-6 col-md-4 col-lg">
                    <div style={styles.summaryItem} className="h-100">
                      <span style={styles.summaryLabel} className="d-block mb-1">Pending Expected</span>
                      <span style={{ ...styles.summaryValue, color: '#e74c3c' }}>
                        {formatCurrency(revenueData.reduce((sum, item) => sum + item.pendingRevenue, 0))}
                      </span>
                    </div>
                  </div>
                  <div className="col-12 col-sm-6 col-md-6 col-lg">
                    <div style={styles.summaryItem} className="h-100">
                      <span style={styles.summaryLabel} className="d-block mb-1">Total Works</span>
                      <span style={styles.summaryValue}>
                        {revenueData.reduce((sum, item) => sum + item.totalWorks, 0)}
                      </span>
                    </div>
                  </div>
                  <div className="col-12 col-sm-12 col-md-6 col-lg">
                    <div style={styles.summaryItem} className="h-100">
                      <span style={styles.summaryLabel} className="d-block mb-1">Paid Works</span>
                      <span style={styles.summaryValue}>
                        {revenueData.reduce((sum, item) => sum + item.paidWorks, 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={styles.tableCard} className="p-3 p-md-4">
                <h3 style={styles.tableTitle} className="fs-5 mb-3">Detailed Report</h3>
                <div className="table-responsive">
                  <table className="table table-hover mb-0" style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Period</th>
                        <th style={styles.th}>Expected (Admin)</th>
                        <th style={styles.th}>Actual (Employee)</th>
                        <th style={styles.th}>Expected Pending</th>
                        <th style={styles.th}>Total Works</th>
                        <th style={styles.th}>Paid Works</th>
                        <th style={styles.th}>Pending Works</th>
                      </tr>
                    </thead>
                    <tbody>
                      {revenueData.map((item) => (
                        <tr key={item.period}>
                          <td style={styles.td}>{item.period}</td>
                          <td style={styles.td}>{formatCurrency(item.totalRevenue)}</td>
                          <td style={{ ...styles.td, color: item.totalRevenue !== item.enteredTotalRevenue ? '#e67e22' : 'inherit', fontWeight: item.totalRevenue !== item.enteredTotalRevenue ? 'bold' : 'normal' }}>
                            {formatCurrency(item.enteredTotalRevenue)}
                            {item.totalRevenue !== item.enteredTotalRevenue && (
                              <div style={{ fontSize: '11px' }}>
                                Diff: {formatCurrency(item.enteredTotalRevenue - item.totalRevenue)}
                              </div>
                            )}
                          </td>
                          <td style={{ ...styles.td, color: '#e74c3c' }}>{formatCurrency(item.pendingRevenue)}</td>
                          <td style={styles.td}>{item.totalWorks}</td>
                          <td style={styles.td}>{item.paidWorks}</td>
                          <td style={styles.td}>{item.pendingWorks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div style={styles.noData}>
              <p>Please select a date range and click "Generate Report" to view revenue data.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'performance' && (
        <div style={styles.reportCard}>
          {loading ? (
            <Loading text="Generating performance report..." />
          ) : performanceData.length > 0 ? (
            <div className="p-3 p-md-4">
              <div className="row g-3">
                {performanceData.map((emp) => (
                  <div key={emp.employee._id || emp.employee.employeeId} className="col-12 col-md-6 col-lg-4">
                    <div style={styles.performanceCard} className="h-100">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div style={styles.employeeInfo}>
                          <h4 style={styles.employeeName} className="fs-5">{emp.employee.name}</h4>
                          <p style={styles.employeeId}>{emp.employee.employeeId}</p>
                        </div>
                        <div style={styles.employeeStats}>
                          <div style={styles.stat} className="mb-2">
                            <span style={styles.statLabel}>Total Works</span>
                            <span style={styles.statValue} className="ms-2">{emp.stats.totalWorks}</span>
                          </div>
                          <div style={styles.stat}>
                            <span style={styles.statLabel}>Completion Rate</span>
                            <span style={styles.statValue} className="ms-2">{emp.stats.completionRate}%</span>
                          </div>
                        </div>
                      </div>

                      <div style={styles.progressContainer}>
                        <div style={styles.progressLabel}>
                          <span>Work Progress</span>
                          <span>{emp.stats.completedWorks}/{emp.stats.totalWorks}</span>
                        </div>
                        <div style={styles.progressBar}>
                          <div
                            style={{
                              ...styles.progressFill,
                              backgroundColor: '#27ae60',
                              width: `${emp.stats.totalWorks > 0 ? (emp.stats.completedWorks / emp.stats.totalWorks) * 100 : 0}%`
                            }}
                          ></div>
                        </div>
                      </div>

                      <div style={styles.paymentContainer}>
                        <div style={styles.paymentLabel}>
                          <span>Payment Collection</span>
                          <span>{emp.stats.paidAmount}/{emp.stats.totalAmount}</span>
                        </div>
                        <div style={styles.progressBar}>
                          <div
                            style={{
                              ...styles.progressFill,
                              backgroundColor: '#3498db',
                              width: `${emp.stats.totalAmount > 0 ? (emp.stats.paidAmount / emp.stats.totalAmount) * 100 : 0}%`
                            }}
                          ></div>
                        </div>
                      </div>

                      <div style={styles.amounts}>
                        <div style={styles.amountItem}>
                          <span style={styles.amountLabel}>Total Amount</span>
                          <span style={styles.amountValue}>{formatCurrency(emp.stats.totalAmount)}</span>
                        </div>
                        <div style={styles.amountItem}>
                          <span style={styles.amountLabel}>Paid Amount</span>
                          <span style={{ ...styles.amountValue, color: '#27ae60' }}>{formatCurrency(emp.stats.paidAmount)}</span>
                        </div>
                        <div style={styles.amountItem}>
                          <span style={styles.amountLabel}>Pending Amount</span>
                          <span style={{ ...styles.amountValue, color: '#e74c3c' }}>{formatCurrency(emp.stats.pendingAmount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={styles.noData}>
              <p>No performance data available.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  header: {
    marginBottom: '30px'
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  subtitle: {
    margin: 0,
    color: '#666',
    fontSize: '16px'
  },
  tabs: {
    display: 'flex',
    gap: '10px',
    marginBottom: '30px'
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
    padding: '20px',
    borderBottom: '1px solid #e9ecef'
  },
  filtersForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  filtersRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px'
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#333'
  },
  input: {
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px'
  },
  select: {
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: 'white'
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
  downloadBtn: {
    padding: '8px 16px',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  chartContainer: {
    padding: '24px'
  },
  chartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px'
  },
  chartTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  legend: {
    display: 'flex',
    gap: '16px'
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#666'
  },
  legendColor: {
    width: '12px',
    height: '12px',
    borderRadius: '3px'
  },
  chart: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  chartBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  barLabel: {
    width: '100px',
    fontSize: '12px',
    color: '#666',
    fontWeight: '500'
  },
  barContainer: {
    flex: 1,
    height: '24px',
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    overflow: 'hidden',
    display: 'flex'
  },
  bar: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: '8px',
    fontSize: '12px',
    color: 'white',
    fontWeight: '600'
  },
  summaryCard: {
    padding: '24px',
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #e9ecef'
  },
  summaryTitle: {
    margin: '0 0 16px 0',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px'
  },
  summaryItem: {
    backgroundColor: 'white',
    padding: '16px',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  summaryLabel: {
    fontSize: '14px',
    color: '#666'
  },
  summaryValue: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  tableCard: {
    padding: '24px'
  },
  tableTitle: {
    margin: '0 0 16px 0',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  tableWrapper: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    padding: '12px',
    textAlign: 'left',
    backgroundColor: '#f8f9fa',
    fontWeight: '600',
    color: '#2c3e50',
    borderBottom: '2px solid #e9ecef',
    fontSize: '14px'
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid #e9ecef',
    fontSize: '14px'
  },
  noData: {
    padding: '40px',
    textAlign: 'center',
    color: '#666',
    fontSize: '16px'
  },
  performanceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    padding: '24px'
  },
  performanceCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: '1px solid #e9ecef',
    padding: '20px'
  },
  employeeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px'
  },
  employeeInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  employeeName: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  employeeId: {
    fontSize: '12px',
    color: '#666'
  },
  employeeStats: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  stat: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px'
  },
  statLabel: {
    fontSize: '12px',
    color: '#666'
  },
  statValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#2c3e50'
  },
  progressContainer: {
    marginBottom: '16px'
  },
  progressLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
    fontSize: '12px',
    color: '#666'
  },
  progressBar: {
    height: '8px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    transition: 'width 0.3s ease'
  },
  paymentContainer: {
    marginBottom: '16px'
  },
  paymentLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
    fontSize: '12px',
    color: '#666'
  },
  amounts: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  amountItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px'
  },
  amountLabel: {
    fontSize: '12px',
    color: '#666'
  },
  amountValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#2c3e50'
  }
};

export default AdminReports;