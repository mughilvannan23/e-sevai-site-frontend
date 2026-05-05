import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import Loading from '../components/common/Loading';
import { useToast } from '../components/common/Toast';
import { formatWorkStatus } from '../utils/formatters';

const AdminReports = () => {
  const [activeTab, setActiveTab] = useState('revenue');
  const [loading, setLoading] = useState(false);
  const [revenueData, setRevenueData] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [detailedWorks, setDetailedWorks] = useState([]);
  const [reportSummary, setReportSummary] = useState({
    totalWorkCharge: 0,
    totalServiceCharge: 0,
    totalBaseCost: 0,
    totalOtherCharges: 0,
    totalActualCollected: 0,
    totalNetProfit: 0
  });
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    groupBy: 'day',
    searchName: '',
    searchPhone: '',
    employeeName: '',
    paymentStatus: '',
    workStatus: ''
  });
  const [selectedNote, setSelectedNote] = useState('');
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedWork, setSelectedWork] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    if (activeTab === 'revenue' && filters.startDate && filters.endDate) {
      fetchRevenueReport();
      fetchDetailedWorks();
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
        setReportSummary(response.data.summary || {
          totalWorkCharge: 0,
          totalServiceCharge: 0,
          totalBaseCost: 0,
          totalOtherCharges: 0,
          totalActualCollected: 0,
          totalNetProfit: 0
        });
      }
    } catch (err) {
      console.error('Error fetching revenue report:', err);
      error('Failed to fetch revenue report');
    } finally {
      setLoading(false);
    }
  };

  const fetchDetailedWorks = async () => {
    if (!filters.startDate || !filters.endDate) return;

    try {
      const response = await adminAPI.getAllWorks({
        startDate: filters.startDate,
        endDate: filters.endDate,
        limit: 1000 // Get all works for the period
      });
      if (response.data.success) {
        setDetailedWorks(response.data.works);
      }
    } catch (err) {
      console.error('Error fetching detailed works:', err);
      error('Failed to fetch detailed work data');
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

  const handleClearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      groupBy: 'day',
      searchName: '',
      searchPhone: '',
      employeeName: '',
      paymentStatus: '',
      workStatus: ''
    });
  };

  // Apply frontend filters to detailed works
  const getFilteredWorks = () => {
    return detailedWorks.filter(work => {
      // Customer Name filter (case-insensitive partial match)
      if (filters.searchName && !work.customerName?.toLowerCase().includes(filters.searchName.toLowerCase())) {
        return false;
      }

      // Customer Phone filter (partial match)
      if (filters.searchPhone && !work.customerPhone?.includes(filters.searchPhone)) {
        return false;
      }

      // Employee Name filter
      if (filters.employeeName && !work.employee?.name?.toLowerCase().includes(filters.employeeName.toLowerCase())) {
        return false;
      }

      // Payment Status filter
      if (filters.paymentStatus && work.paymentStatus !== filters.paymentStatus) {
        return false;
      }

      // Work Status filter
      if (filters.workStatus && work.workStatus !== filters.workStatus) {
        return false;
      }

      return true;
    });
  };

  const handleRevenueReport = (e) => {
    e.preventDefault();
    fetchRevenueReport();
    fetchDetailedWorks();
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
    if (!date) return '-';
    const formatted = new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    return formatted
      .replace(/\//g, '-')
      .replace(/, /g, ' ')
      .replace(/am/i, 'AM')
      .replace(/pm/i, 'PM');
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString()}`;
  };

  const calculateWorkCharge = (work) => {
    return work.items ? work.items.reduce((sum, item) => sum + ((item.workChargeAtTime || 0) * (item.quantity || 1)), 0) : 0;
  };

  const calculateServiceCharge = (work) => {
    return work.items ? work.items.reduce((sum, item) => sum + ((item.serviceChargeAtTime || 0) * (item.quantity || 1)), 0) : 0;
  };

  const calculateExpectedBaseCost = (work) => {
    return calculateWorkCharge(work) + calculateServiceCharge(work);
  };

  const calculateNetProfit = (work) => {
    if (work.paymentStatus !== 'Paid') return 0;
    const serviceCharge = calculateServiceCharge(work);
    const otherCharges = work.otherCharges || 0;
    const totalDiscount = work.totalDiscount || 0;
    return serviceCharge + otherCharges - totalDiscount;
  };

  const getWorkTitles = (work) => {
    return work.items && work.items.length > 0
      ? work.items.map(item => {
          const appNum = item.applicationNumber ? ` [#${item.applicationNumber}]` : '';
          return `${item.title}${appNum} (x${item.quantity || 1})`;
        }).join(', ')
      : work.workTitle || '';
  };

  return (
    <div className="container-fluid p-0">
      <style>{`
        @keyframes modalSlideIn {
          from { transform: translateY(-30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
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
                <div className="col-12 col-sm-6 col-md-3 d-flex flex-column gap-2">
                  <label style={styles.label}>From Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={filters.startDate}
                    onChange={handleFilterChange}
                    className="form-control"
                  />
                </div>
                <div className="col-12 col-sm-6 col-md-3 d-flex flex-column gap-2">
                  <label style={styles.label}>To Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={filters.endDate}
                    onChange={handleFilterChange}
                    className="form-control"
                  />
                </div>
                <div className="col-12 col-sm-6 col-md-3 d-flex flex-column gap-2">
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
                <div className="col-12 col-sm-6 col-md-3 d-flex flex-column gap-2">
                  <label style={styles.label}>Payment Status</label>
                  <select
                    name="paymentStatus"
                    value={filters.paymentStatus}
                    onChange={handleFilterChange}
                    className="form-select"
                  >
                    <option value="">All Status</option>
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
                <div className="col-12 col-sm-6 col-md-3 d-flex flex-column gap-2">
                  <label style={styles.label}>Work Status</label>
                  <select
                    name="workStatus"
                    value={filters.workStatus}
                    onChange={handleFilterChange}
                    className="form-select"
                  >
                    <option value="">All Status</option>
                    <option value="Completed">Completed</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
                <div className="col-12 col-sm-6 col-md-3 d-flex flex-column gap-2">
                  <label style={styles.label}>Customer Name</label>
                  <input
                    type="text"
                    name="searchName"
                    value={filters.searchName}
                    onChange={handleFilterChange}
                    className="form-control"
                    placeholder="Search customer name..."
                  />
                </div>
                <div className="col-12 col-sm-6 col-md-3 d-flex flex-column gap-2">
                  <label style={styles.label}>Customer Phone</label>
                  <input
                    type="text"
                    name="searchPhone"
                    value={filters.searchPhone}
                    onChange={handleFilterChange}
                    className="form-control"
                    placeholder="Search phone number..."
                  />
                </div>
                <div className="col-12 col-sm-6 col-md-3 d-flex flex-column gap-2">
                  <label style={styles.label}>Employee Name</label>
                  <input
                    type="text"
                    name="employeeName"
                    value={filters.employeeName}
                    onChange={handleFilterChange}
                    className="form-control"
                    placeholder="Search employee..."
                  />
                </div>
              </div>
              <div className="d-flex gap-2 mt-3 flex-wrap">
                <button type="submit" style={styles.generateBtn} className="btn text-white">
                  Generate Report
                </button>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="btn btn-outline-secondary"
                  style={{ padding: '10px 24px', borderRadius: '6px', fontSize: '14px', fontWeight: '600' }}
                >
                  Clear Filters
                </button>
              </div>
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
                      <span style={styles.summaryLabel} className="d-block mb-1">Total Work Charge</span>
                      <span style={styles.summaryValue}>
                        {formatCurrency(reportSummary.totalWorkCharge ?? detailedWorks.reduce((sum, w) => sum + calculateWorkCharge(w), 0))}
                      </span>
                    </div>
                  </div>
                  <div className="col-12 col-sm-6 col-md-4 col-lg">
                    <div style={styles.summaryItem} className="h-100">
                      <span style={styles.summaryLabel} className="d-block mb-1">Total Service Charge</span>
                      <span style={styles.summaryValue}>
                        {formatCurrency(reportSummary.totalServiceCharge ?? detailedWorks.reduce((sum, w) => sum + calculateServiceCharge(w), 0))}
                      </span>
                    </div>
                  </div>
                  <div className="col-12 col-sm-6 col-md-4 col-lg">
                    <div style={styles.summaryItem} className="h-100">
                      <span style={styles.summaryLabel} className="d-block mb-1">Total Expected Base Cost</span>
                      <span style={styles.summaryValue}>
                        {formatCurrency(reportSummary.totalBaseCost ?? detailedWorks.reduce((sum, w) => sum + calculateExpectedBaseCost(w), 0))}
                      </span>
                    </div>
                  </div>
                  <div className="col-12 col-sm-6 col-md-4 col-lg">
                    <div style={styles.summaryItem} className="h-100">
                      <span style={styles.summaryLabel} className="d-block mb-1">Total Other Charges</span>
                      <span style={styles.summaryValue}>
                        {formatCurrency(reportSummary.totalOtherCharges ?? detailedWorks.filter(w => w.paymentStatus === 'Paid').reduce((sum, w) => sum + (w.otherCharges || 0), 0))}
                      </span>
                    </div>
                  </div>
                  <div className="col-12 col-sm-6 col-md-4 col-lg">
                    <div style={styles.summaryItem} className="h-100">
                      <span style={styles.summaryLabel} className="d-block mb-1">Total GPay Amount</span>
                      <span style={styles.summaryValue}>
                        {formatCurrency(detailedWorks.filter(w => w.paymentStatus === 'Paid').reduce((sum, w) => sum + (w.gpayAmount || 0), 0))}
                      </span>
                    </div>
                  </div>
                  <div className="col-12 col-sm-6 col-md-4 col-lg">
                    <div style={styles.summaryItem} className="h-100">
                      <span style={styles.summaryLabel} className="d-block mb-1">Total Cash Amount</span>
                      <span style={styles.summaryValue}>
                        {formatCurrency(detailedWorks.filter(w => w.paymentStatus === 'Paid').reduce((sum, w) => sum + (w.cashAmount || 0), 0))}
                      </span>
                    </div>
                  </div>
                  <div className="col-12 col-sm-6 col-md-4 col-lg">
                    <div style={styles.summaryItem} className="h-100">
                      <span style={styles.summaryLabel} className="d-block mb-1">Total Profit</span>
                      <span style={{
                        ...styles.summaryValue,
                        color: (reportSummary.totalNetProfit ?? detailedWorks.reduce((sum, w) => sum + calculateNetProfit(w), 0)) >= 0 ? '#27ae60' : '#e74c3c',
                        fontWeight: 'bold'
                      }}>
                        {(reportSummary.totalNetProfit ?? detailedWorks.reduce((sum, w) => sum + calculateNetProfit(w), 0)) >= 0 ? '+' : ''}
                        {formatCurrency(reportSummary.totalNetProfit ?? detailedWorks.reduce((sum, w) => sum + calculateNetProfit(w), 0))}
                      </span>
                    </div>
                  </div>
                  <div className="col-12 col-sm-6 col-md-4 col-lg">
                    <div style={styles.summaryItem} className="h-100">
                      <span style={styles.summaryLabel} className="d-block mb-1">Total Works</span>
                      <span style={styles.summaryValue}>
                        {detailedWorks.length}
                      </span>
                    </div>
                  </div>
                  <div className="col-12 col-sm-6 col-md-4 col-lg">
                    <div style={styles.summaryItem} className="h-100">
                      <span style={styles.summaryLabel} className="d-block mb-1">Total Discount</span>
                      <span style={{ ...styles.summaryValue, color: '#e74c3c' }}>
                        {formatCurrency(reportSummary.totalDiscount ?? detailedWorks.reduce((sum, w) => sum + (w.totalDiscount || 0), 0))}
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
                        <th style={styles.th}>Date</th>
                        <th style={styles.th}>Customer</th>
                        <th style={styles.th}>Payment Method</th>
                        <th style={styles.th}>GPay Amount</th>
                        <th style={styles.th}>Cash Amount</th>
                        <th style={styles.th}>Total Amount</th>
                        <th style={styles.th}>Employee Name</th>
                        <th style={styles.th}>Employee ID</th>
                        <th style={styles.th}>Service Name</th>
                        <th style={styles.th}>Application Fees</th>
                        <th style={styles.th}>Service Charge</th>
                        <th style={styles.th}>Expected Cost</th>
                        <th style={styles.th}>Other Charges</th>
                        <th style={styles.th}>Discount</th>
                        <th style={styles.th}>Actual Collected</th>
                        <th style={styles.th}>Net Profit</th>
                        <th style={styles.th}>Payment Status</th>
                        <th style={styles.th}>Work Status</th>
                        <th style={styles.th}>Notes</th>
                        <th style={styles.th}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getFilteredWorks().map((work) => {
                        const workCharge = calculateWorkCharge(work);
                        const serviceCharge = calculateServiceCharge(work);
                        const expectedBaseCost = calculateExpectedBaseCost(work);
                        const netProfit = calculateNetProfit(work);
                        return (
                          <tr key={work._id}>
                            <td style={styles.td}>{formatDate(work.date)}</td>
                            <td style={styles.td}>
                              <div className="fw-bold">{work.customerName}</div>
                              <div className="text-muted small">{work.customerPhone || '-'}</div>
                            </td>
                            <td style={styles.td}>{work.paymentMethod || 'Cash'}</td>
                            <td style={styles.td}>{formatCurrency(work.gpayAmount || 0)}</td>
                            <td style={styles.td}>{formatCurrency(work.cashAmount || 0)}</td>
                            <td style={{ ...styles.td, fontWeight: 'bold' }}>{formatCurrency(work.totalAmount || work.amount || 0)}</td>
                            <td style={styles.td}>{work.employee?.name || 'Unknown'}</td>
                            <td style={styles.td}>{work.employee?.employeeId || 'N/A'}</td>
                            <td style={{ ...styles.td, whiteSpace: 'normal', maxWidth: '200px' }}>{getWorkTitles(work)}</td>
                            <td style={styles.td}>{formatCurrency(workCharge)}</td>
                            <td style={styles.td}>{formatCurrency(serviceCharge)}</td>
                            <td style={styles.td}>{formatCurrency(expectedBaseCost)}</td>
                            <td style={styles.td}>{formatCurrency(work.otherCharges || 0)}</td>
                            <td style={{ ...styles.td, color: '#e74c3c' }}>{formatCurrency(work.totalDiscount || 0)}</td>
                            <td style={{ ...styles.td, color: work.paymentStatus === 'Paid' ? 'inherit' : '#e74c3c' }}>
                              {formatCurrency(work.amount)}
                            </td>
                            <td style={{ ...styles.td, color: netProfit >= 0 ? '#27ae60' : '#e74c3c', fontWeight: 'bold' }}>
                              {netProfit >= 0 ? '+' : ''}{formatCurrency(netProfit)}
                            </td>
                            <td style={{ ...styles.td, color: work.paymentStatus === 'Paid' ? '#27ae60' : '#e74c3c' }}>
                              {work.paymentStatus}
                            </td>
                            <td style={{ ...styles.td, color: work.workStatus === 'Completed' ? '#27ae60' : '#f39c12' }}>
                              {formatWorkStatus(work.workStatus)}
                            </td>
                            <td style={styles.td}>
                              {work.notes ? (
                                <button 
                                  onClick={() => {
                                    setSelectedNote(work.notes);
                                    setShowNotesModal(true);
                                  }}
                                  className="btn btn-sm btn-outline-primary"
                                  style={styles.viewBtn}
                                >
                                  Notes
                                </button>
                              ) : (
                                <span className="text-muted small">No Notes</span>
                              )}
                            </td>
                            <td style={styles.td}>
                              <button 
                                onClick={() => {
                                  setSelectedWork(work);
                                  setShowDetailsModal(true);
                                }}
                                className="btn btn-sm btn-primary"
                                style={styles.viewBtn}
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {getFilteredWorks().length === 0 && (
                  <div style={styles.noData}>
                    <p>No work entries found for the selected date range.</p>
                  </div>
                )}
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

      {/* Notes Modal */}
      {showNotesModal && (
        <div style={styles.modalOverlay} onClick={() => setShowNotesModal(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h4 style={styles.modalTitle}>Work Notes</h4>
              <button 
                style={styles.closeBtn} 
                onClick={() => setShowNotesModal(false)}
              >
                ✕
              </button>
            </div>
            <div style={styles.modalBody}>
              <p style={styles.notesText}>{selectedNote}</p>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedWork && (
        <div style={styles.modalOverlay} onClick={() => setShowDetailsModal(false)}>
          <div style={{ ...styles.modalContent, maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h4 style={styles.modalTitle}>Work Details</h4>
              <button 
                style={styles.closeBtn} 
                onClick={() => setShowDetailsModal(false)}
              >
                ✕
              </button>
            </div>
            <div style={styles.modalBody}>
              <div className="mb-3">
                <div className="fw-bold text-primary mb-1">Customer Information</div>
                <div><strong>Name:</strong> {selectedWork.customerName}</div>
                <div><strong>Phone:</strong> {selectedWork.customerPhone || 'N/A'}</div>
              </div>
              <div className="mb-3">
                <div className="fw-bold text-primary mb-1">Work Items</div>
                <div className="table-responsive">
                  <table className="table table-sm table-bordered">
                    <thead className="table-light">
                      <tr>
                        <th>Service</th>
                        <th>App. No</th>
                        <th>Qty</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedWork.items?.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.title}</td>
                          <td>{item.applicationNumber || '-'}</td>
                          <td>{item.quantity}</td>
                          <td>
                            ₹{((item.workChargeAtTime + item.serviceChargeAtTime) * item.quantity + (item.otherCharges || 0) - (item.discount || 0)).toFixed(2)}
                            {item.discount > 0 && <span className="text-danger small ms-1">(-₹{item.discount})</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <div className="fw-bold text-primary mb-1">Payment Details</div>
                  <div><strong>Total Amount:</strong> ₹{selectedWork.amount}</div>
                  <div><strong>Status:</strong> {selectedWork.paymentStatus}</div>
                  <div><strong>Method:</strong> {selectedWork.paymentMethod || 'Cash'}</div>
                  {selectedWork.paymentMethod === 'Both' && (
                    <>
                      <div className="text-muted small"><strong>GPay:</strong> ₹{selectedWork.gpayAmount || 0}</div>
                      <div className="text-muted small"><strong>Cash:</strong> ₹{selectedWork.cashAmount || 0}</div>
                    </>
                  )}
                </div>
                <div className="col-6">
                  <div className="fw-bold text-primary mb-1">Staff Details</div>
                  <div><strong>Employee:</strong> {selectedWork.employee?.name}</div>
                  <div><strong>Date:</strong> {formatDate(selectedWork.date)}</div>
                </div>
              </div>
              {selectedWork.notes && (
                <div>
                  <div className="fw-bold text-primary mb-1">Notes</div>
                  <p style={styles.notesText}>{selectedWork.notes}</p>
                </div>
              )}
            </div>
            <div style={{ ...styles.modalHeader, borderTop: '1px solid #eee', borderBottom: 'none', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowDetailsModal(false)}>Close</button>
            </div>
          </div>
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
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '20px'
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '500px',
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
    animation: 'modalSlideIn 0.3s ease-out'
  },
  modalHeader: {
    padding: '16px 24px',
    borderBottom: '1px solid #eee',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  modalTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  modalBody: {
    padding: '24px',
    overflowY: 'auto',
    fontSize: '15px',
    lineHeight: '1.6',
    color: '#444'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#999',
    padding: '4px'
  },
  notesText: {
    margin: 0,
    whiteSpace: 'pre-wrap'
  },
  viewBtn: {
    padding: '4px 12px',
    fontSize: '12px',
    borderRadius: '4px'
  }
};

export default AdminReports;