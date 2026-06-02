import React, { useState, useEffect } from 'react';
import { workAPI, userAPI } from '../services/api';
import Loading from '../components/common/Loading';
import Pagination from '../components/common/Pagination';
import { useToast } from '../components/common/Toast';
import { formatWorkStatus } from '../utils/formatters';
import { workStyles as styles } from '../components/works/workStyles';

const AllEmployeeWorks = () => {
  const [works, setWorks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [selectedWork, setSelectedWork] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    startDate: '',
    endDate: '',
    employeeId: '',
    paymentStatus: '',
    workStatus: ''
  });

  const { error } = useToast();

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchWorks();
  }, [filters.page, filters.limit, filters.paymentStatus, filters.workStatus, filters.employeeId, filters.startDate, filters.endDate]);

  const fetchEmployees = async () => {
    try {
      const response = await userAPI.getEmployees({ page: 1, limit: 100 });
      if (response.data.success) setEmployees(response.data.employees);
    } catch (err) { console.error('Error fetching employees:', err); }
  };

  const fetchWorks = async () => {
    try {
      setLoading(true);
      const params = { ...filters };
      const response = await workAPI.getAllEmployeeWorks(params);
      if (response.data.success) {
        setWorks(response.data.works);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      console.error('Error fetching works:', err);
      error('Failed to fetch works');
    }
    finally { setLoading(false); }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchWorks();
  };

  const handleViewWork = (work) => {
    setSelectedWork(work);
    setShowModal(true);
  };

  const formatDateTime = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    }).replace(/\//g, '-').replace(/, /g, ' ');
  };

  const formatTimeOnly = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  };

  const getStatusBadge = (status, type) => {
    const isPayment = type === 'payment';
    const positive = isPayment ? status === 'Paid' : status === 'Completed';
    return (
      <span style={{
        ...styles.badge,
        backgroundColor: positive ? '#3b8132' : (isPayment ? (status === 'None' ? '#95a5a6' : '#e74c3c') : '#f39c12'),
        color: 'white',
        fontSize: '0.75rem',
        padding: '4px 10px'
      }}>
        {type === 'work' ? formatWorkStatus(status) : status}
      </span>
    );
  };

  if (loading && works.length === 0) {
    return <Loading text="Loading all employee works..." />;
  }

  return (
    <div className="container-fluid p-0">
      <div className="mb-4">
        <h1 style={{ color: '#3b8132', fontWeight: '700', margin: '0 0 8px 0', letterSpacing: '0.5px' }} className="fs-3">All Employee Works</h1>
        <p style={{ color: '#666', margin: 0 }}>View all work entries from every employee in the shop</p>
      </div>

      {/* Filters Section */}
      <div style={styles.filtersCard} className="p-3 p-md-4 mb-4 shadow-sm border-0">
        <form onSubmit={handleSearch} className="d-flex flex-column gap-3">
          <div className="row g-3">
            <div className="col-12 col-md-4">
              <label style={styles.label}>Search Customer/Work</label>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search..."
                className="form-control"
                style={{ borderRadius: '10px' }}
              />
            </div>
            <div className="col-12 col-sm-6 col-md-4">
              <label style={styles.label}>From Date</label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="form-control"
                style={{ borderRadius: '10px' }}
              />
            </div>
            <div className="col-12 col-sm-6 col-md-4">
              <label style={styles.label}>To Date</label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="form-control"
                style={{ borderRadius: '10px' }}
              />
            </div>
          </div>
          <div className="row g-3">
            <div className="col-12 col-md-4">
              <label style={styles.label}>Employee</label>
              <select
                name="employeeId"
                value={filters.employeeId}
                onChange={handleFilterChange}
                className="form-select"
                style={{ borderRadius: '10px' }}
              >
                <option value="">All Employees</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>{emp.name}</option>
                ))}
              </select>
            </div>
            <div className="col-12 col-sm-6 col-md-4">
              <label style={styles.label}>Payment Status</label>
              <select
                name="paymentStatus"
                value={filters.paymentStatus}
                onChange={handleFilterChange}
                className="form-select"
                style={{ borderRadius: '10px' }}
              >
                <option value="">All</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            <div className="col-12 col-sm-6 col-md-4">
              <label style={styles.label}>Work Status</label>
              <select
                name="workStatus"
                value={filters.workStatus}
                onChange={handleFilterChange}
                className="form-select"
                style={{ borderRadius: '10px' }}
              >
                <option value="">All</option>
                <option value="Completed">Completed</option>
                <option value="In Progress">Pending</option>
              </select>
            </div>
          </div>
          <div className="d-flex flex-column flex-sm-row gap-2 mt-2">
            <button type="submit" style={styles.searchBtn} className="btn w-100 w-sm-auto text-white">Apply Filters</button>
            <button
              type="button"
              style={styles.filterResetBtn}
              className="btn w-100 w-sm-auto"
              onClick={() => setFilters({ page: 1, limit: 10, search: '', startDate: '', endDate: '', employeeId: '', paymentStatus: '', workStatus: '' })}
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Table Section */}
      <div style={{ ...styles.tableCard, overflowX: 'auto', borderRadius: '15px', border: 'none', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
        <table className="table table-hover mb-0" style={{ minWidth: '1000px' }}>
          <thead>
            <tr style={{ backgroundColor: 'rgba(59, 129, 50, 0.05)' }}>
              <th style={{ ...styles.th, color: '#3b8132', fontWeight: '700' }}>Date</th>
              <th style={{ ...styles.th, color: '#3b8132', fontWeight: '700' }}>Employee</th>
              <th style={{ ...styles.th, color: '#3b8132', fontWeight: '700' }}>Customer</th>
              <th style={{ ...styles.th, color: '#3b8132', fontWeight: '700' }}>Work/Service</th>
              <th style={{ ...styles.th, color: '#3b8132', fontWeight: '700' }}>Amount</th>
              <th style={{ ...styles.th, color: '#3b8132', fontWeight: '700' }}>Payment Status</th>
              <th style={{ ...styles.th, color: '#3b8132', fontWeight: '700' }}>Work Status</th>
              <th style={{ ...styles.th, color: '#3b8132', fontWeight: '700' }}>Created Time</th>
              <th style={{ ...styles.th, color: '#3b8132', fontWeight: '700' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {works.map(work => (
              <tr key={work._id} style={{ transition: 'all 0.2s ease' }}>
                <td style={{ ...styles.td, whiteSpace: 'nowrap' }}>{new Date(work.date).toLocaleDateString('en-IN')}</td>
                <td style={styles.td}>
                  <div className="fw-bold" style={{ color: '#2c3e50' }}>{work.employee?.name || 'N/A'}</div>
                  <div className="text-muted small">{work.employee?.employeeId || ''}</div>
                </td>
                <td style={styles.td}>
                  <div className="fw-bold">{work.customerName}</div>
                  <div className="text-muted small">{work.customerPhone || '-'}</div>
                </td>
                <td style={{ ...styles.td, maxWidth: '250px' }}>
                  <div className="text-truncate">
                    {work.items && work.items.length > 0
                      ? work.items.map(i => {
                          const aepsInfo = i.presetChargeType === 'AEPS' ? ` [AEPS: ₹${i.presetAmount || 0}]` : '';
                          return `${i.title}${aepsInfo} (x${i.quantity || 1})`;
                        }).join(', ')
                      : work.workTitle}
                  </div>
                </td>
                <td style={{ ...styles.td, fontWeight: '700', color: '#2c3e50' }}>₹{(work.totalAmount || work.amount || 0).toLocaleString()}</td>
                <td style={styles.td}>{getStatusBadge(work.paymentStatus, 'payment')}</td>
                <td style={styles.td}>{getStatusBadge(work.workStatus, 'work')}</td>
                <td style={styles.td}>{formatTimeOnly(work.createdAt)}</td>
                <td style={styles.td}>
                  <button
                    className="btn btn-sm"
                    style={{ backgroundColor: '#3b8132', color: 'white', borderRadius: '8px', padding: '5px 15px', fontWeight: '600' }}
                    onClick={() => handleViewWork(work)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {works.length === 0 && (
          <div className="p-5 text-center text-muted">
            No work entries found.
          </div>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="mt-4 d-flex justify-content-center">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalWorks}
            itemsPerPage={pagination.limit}
            onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
          />
        </div>
      )}

      {/* View Detail Modal */}
      {showModal && selectedWork && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: '20px', border: 'none', overflow: 'hidden' }}>
              <div className="modal-header text-white" style={{ backgroundColor: '#3b8132', padding: '20px' }}>
                <h5 className="modal-title fw-bold">Work Details</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body p-4" style={{ backgroundColor: '#f8f9fa' }}>
                <div className="row g-4">
                  {/* Basic Info */}
                  <div className="col-md-6">
                    <div className="p-3 bg-white rounded shadow-sm">
                      <h6 className="text-muted mb-3 border-bottom pb-2">Customer & Employee</h6>
                      <div className="mb-2"><strong>Employee:</strong> {selectedWork.employee?.name} ({selectedWork.employee?.employeeId})</div>
                      <div className="mb-2"><strong>Customer:</strong> {selectedWork.customerName}</div>
                      <div className="mb-2"><strong>Phone:</strong> {selectedWork.customerPhone || '-'}</div>
                      <div className="mb-2"><strong>Date:</strong> {new Date(selectedWork.date).toLocaleDateString('en-IN')}</div>
                    </div>
                  </div>

                  {/* Status Info */}
                  <div className="col-md-6">
                    <div className="p-3 bg-white rounded shadow-sm">
                      <h6 className="text-muted mb-3 border-bottom pb-2">Status & Payment</h6>
                      <div className="mb-2 d-flex justify-content-between">
                        <strong>Work Status:</strong> {getStatusBadge(selectedWork.workStatus, 'work')}
                      </div>
                      <div className="mb-2 d-flex justify-content-between">
                        <strong>Payment Status:</strong> {getStatusBadge(selectedWork.paymentStatus, 'payment')}
                      </div>
                      <div className="mb-2"><strong>Payment Method:</strong> {selectedWork.paymentMethod || 'Cash'}</div>
                      <div className="mb-2 text-muted small"><strong>Created At:</strong> {formatDateTime(selectedWork.createdAt)}</div>
                    </div>
                  </div>

                  {/* Items Table */}
                  <div className="col-12">
                    <div className="p-3 bg-white rounded shadow-sm">
                      <h6 className="text-muted mb-3 border-bottom pb-2">Work Items</h6>
                      <div className="table-responsive">
                        <table className="table table-sm">
                          <thead>
                            <tr>
                              <th>Title</th>
                              <th>App. No</th>
                              <th className="text-center">Qty</th>
                              <th className="text-end">Fees</th>
                              <th className="text-end">Service</th>
                              <th className="text-end">Other</th>
                              <th className="text-end">Disc.</th>
                              <th className="text-end">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedWork.items?.map((item, idx) => {
                              const qty = item.quantity || 1;
                              const workC = item.workChargeAtTime || 0;
                              const serviceC = item.serviceChargeAtTime || 0;
                              const otherC = item.otherCharges || 0;
                              const presetAmt = item.presetAmount || 0;
                              const disc = item.discount || 0;
                              const isAEPS = item.presetChargeType === 'AEPS';
                              const subtotal = (workC + serviceC) * qty + otherC + (isAEPS ? 0 : presetAmt) - disc;
                              return (
                                <tr key={idx}>
                                  <td>
                                    {item.title}
                                    {isAEPS && <span className="ms-1 small text-primary fw-bold">[AEPS: ₹{item.presetAmount || 0}]</span>}
                                  </td>
                                  <td>{item.applicationNumber || '-'}</td>
                                  <td className="text-center">{qty}</td>
                                  <td className="text-end">₹{workC + (isAEPS ? 0 : presetAmt)}</td>
                                  <td className="text-end">₹{serviceC}</td>
                                  <td className="text-end">₹{otherC}</td>
                                  <td className="text-end text-danger">-₹{disc}</td>
                                  <td className="text-end fw-bold">₹{subtotal.toLocaleString()}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Totals & Notes */}
                  <div className="col-md-7">
                    <div className="p-3 bg-white rounded shadow-sm h-100">
                      <h6 className="text-muted mb-2">Notes</h6>
                      <p className="mb-0 text-secondary" style={{ whiteSpace: 'pre-wrap' }}>{selectedWork.notes || 'No notes available.'}</p>
                    </div>
                  </div>
                  <div className="col-md-5">
                    <div className="p-3 bg-dark text-white rounded shadow-sm h-100 d-flex flex-column justify-content-center">
                      <div className="d-flex justify-content-between mb-2">
                        <span>Base Amount:</span>
                        <span>₹{(selectedWork.amount + (selectedWork.totalDiscount || 0)).toLocaleString()}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2 text-danger">
                        <span>Total Discount:</span>
                        <span>-₹{(selectedWork.totalDiscount || 0).toLocaleString()}</span>
                      </div>
                      {selectedWork.items?.some(i => i.presetChargeType === 'AEPS') && (
                        <div className="d-flex justify-content-between mb-2 text-warning">
                          <span>AEPS Withdrawal:</span>
                          <span>₹{selectedWork.items.reduce((sum, i) => sum + (i.presetChargeType === 'AEPS' ? (i.presetAmount || 0) : 0), 0).toLocaleString()}</span>
                        </div>
                      )}
                      <div className="border-top pt-2 mt-2 d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">FINAL TOTAL</h5>
                        <h4 className="mb-0 text-success">₹{(selectedWork.totalAmount || selectedWork.amount || 0).toLocaleString()}</h4>
                      </div>
                      {selectedWork.paymentMethod === 'Both' && (
                        <div className="mt-3 pt-2 border-top small text-muted">
                          <div className="d-flex justify-content-between">
                            <span>GPay Portion:</span>
                            <span>₹{selectedWork.gpayAmount || 0}</span>
                          </div>
                          <div className="d-flex justify-content-between">
                            <span>Cash Portion:</span>
                            <span>₹{selectedWork.cashAmount || 0}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer p-3 border-0">
                <button type="button" className="btn btn-secondary px-4" onClick={() => setShowModal(false)} style={{ borderRadius: '10px' }}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllEmployeeWorks;
