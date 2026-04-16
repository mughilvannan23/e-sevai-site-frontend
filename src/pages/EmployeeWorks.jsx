import React, { useState, useEffect } from 'react';
import { workAPI } from '../services/api';
import Loading from '../components/common/Loading';
import Pagination from '../components/common/Pagination';
import { useToast } from '../components/common/Toast';
import { useLocation } from 'react-router-dom';

const EmployeeWorks = () => {
  const location = useLocation();
  const [works, setWorks] = useState([]);
  const [workItems, setWorkItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    date: '',
    status: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [editingWork, setEditingWork] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    customerName: '',
    customerPhone: '',
    paymentMethod: 'Hand Cash',
    items: [{ workItemId: '', workTitle: '' }],
    amount: '',
    paymentStatus: 'Pending',
    workStatus: 'In Progress',
    notes: ''
  });
  const { success, error } = useToast();

  useEffect(() => {
    fetchWorks();
    fetchWorkItems();
  }, [filters.page, filters.limit, filters.status]);

  useEffect(() => {
    const status = location.state?.status;
    if (status) {
      const newFilters = {
        page: 1,
        limit: 10,
        date: '',
        status: status
      };
      setFilters(newFilters);
      // Fetch works immediately with the new filters
      fetchWorksWithFilters(newFilters);
    }
  }, [location.state]);

  const fetchWorkItems = async () => {
    try {
      const response = await workAPI.getActiveWorkItems();
      if (response.data.success) {
        setWorkItems(response.data.workItems);
      }
    } catch (err) {
      console.error('Error fetching work items:', err);
    }
  };

  const fetchWorks = async () => {
    try {
      setLoading(true);
      const params = {};
      Object.keys(filters).forEach(key => {
        if (filters[key] && key !== 'page' && key !== 'limit') {
          params[key] = filters[key];
        }
      });
      params.page = filters.page;
      params.limit = filters.limit;

      const response = await workAPI.getMyWorks(params);
      if (response.data.success) {
        setWorks(response.data.works);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      console.error('Error fetching works:', err);
      error('Failed to fetch works');
    } finally {
      setLoading(false);
    }
  };

  const fetchWorksWithFilters = async (filterParams) => {
    try {
      setLoading(true);
      const params = {};
      Object.keys(filterParams).forEach(key => {
        if (filterParams[key] && key !== 'page' && key !== 'limit') {
          params[key] = filterParams[key];
        }
      });
      params.page = filterParams.page;
      params.limit = filterParams.limit;

      const response = await workAPI.getMyWorks(params);
      if (response.data.success) {
        setWorks(response.data.works);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      console.error('Error fetching works:', err);
      error('Failed to fetch works');
    } finally {
      setLoading(false);
    }
  };




  const handlePrint = (work) => {
  const printWindow = window.open('', '_blank');

  const content = `
    <html>
      <head>
        <title>Print Receipt</title>
        <style>
          body {
            font-family: monospace;
            padding: 10px;
          }
          .bill {
            width: 250px;
          }
          .center {
            text-align: center;
          }
          .line {
            border-top: 1px dashed #000;
            margin: 8px 0;
          }
        </style>
      </head>
      <body>
        <div class="bill">
          <div class="center">
            <h3>Work Receipt</h3>
          </div>

          <div class="line"></div>

          <p>Date: ${new Date(work.date).toLocaleString()}</p>
          <p>Customer: ${work.customerName}</p>
          ${work.customerPhone ? `<p>Phone: ${work.customerPhone}</p>` : ''}
          <p>Payment Method: ${work.paymentMethod || 'Hand Cash'}</p>
          <p>Work: ${work.items && work.items.length > 0 ? work.items.map(i => i.title).join(', ') : work.workTitle}</p>

          <div class="line"></div>

          <h4>Total: ₹${work.amount}</h4>

          <div class="line"></div>

          <p class="center">Thank You!</p>
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(content);
  printWindow.document.close();
  printWindow.print();
};





  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchWorks();
  };

  const handleOpenModal = (work = null) => {
    if (work) {
      setEditingWork(work);
      setFormData({
        date: new Date(work.date).toISOString().split('T')[0],
        customerName: work.customerName,
        customerPhone: work.customerPhone || '',
        paymentMethod: work.paymentMethod || 'Hand Cash',
        items: work.items && work.items.length > 0 ? work.items.map(i => ({ workItemId: i.workItemId || '', workTitle: i.title || '' })) : [{ workItemId: '', workTitle: '' }],
        amount: work.amount.toString(),
        paymentStatus: work.paymentStatus,
        workStatus: work.workStatus,
        notes: work.notes || ''
      });
    } else {
      setEditingWork(null);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        customerName: '',
        items: [{ workItemId: '', workTitle: '' }],
        amount: '',
        paymentStatus: 'Pending',
        workStatus: 'In Progress',
        notes: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingWork(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    let totalAmount = newItems.reduce((sum, item) => {
      if (item.workItemId) {
        const i = workItems.find(w => w._id === item.workItemId);
        return sum + (i ? i.price : 0);
      }
      return sum;
    }, 0);
    
    setFormData(prev => ({ 
      ...prev, 
      items: newItems, 
      amount: totalAmount > 0 ? totalAmount.toString() : prev.amount 
    }));
  };

  const addItemRow = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { workItemId: '', workTitle: '' }]
    }));
  };

  const removeItemRow = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    let totalAmount = newItems.reduce((sum, item) => {
      if (item.workItemId) {
        const i = workItems.find(w => w._id === item.workItemId);
        return sum + (i ? i.price : 0);
      }
      return sum;
    }, 0);

    setFormData(prev => ({
      ...prev,
      items: newItems.length ? newItems : [{ workItemId: '', workTitle: '' }],
      amount: totalAmount.toString()
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingWork) {
        const response = await workAPI.updateWork(editingWork._id, formData);
        if (response.data.success) {
          success('Work updated successfully');
          fetchWorks();
          handleCloseModal();
        }
      } else {
        const response = await workAPI.createWork(formData);
        if (response.data.success) {
          success('Work entry created successfully');
          fetchWorks();
          handleCloseModal();
        }
      }
    } catch (err) {
      console.error('Error saving work:', err);
      error(err.response?.data?.message || 'Failed to save work');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this work entry?')) {
      try {
        const response = await workAPI.deleteWork(id);
        if (response.data.success) {
          success('Work entry deleted successfully');
          fetchWorks();
        }
      } catch (err) {
        console.error('Error deleting work:', err);
        error('Failed to delete work');
      }
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status, type) => {
    const isPayment = type === 'payment';
    const paid = status === 'Paid';
    const completed = status === 'Completed';
    
    return (
      <span style={{
        ...styles.badge,
        backgroundColor: isPayment 
          ? (paid ? '#27ae60' : '#e74c3c')
          : (completed ? '#27ae60' : '#f39c12'),
        color: 'white'
      }}>
        {status}
      </span>
    );
  };

  if (loading && works.length === 0) {
    return <Loading text="Loading works..." />;
  }

  return (
    <div className="container-fluid p-0">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <h1 style={styles.title} className="fs-3 fs-md-2">My Works</h1>
          <p style={styles.subtitle} className="fs-6 text-muted">Manage your work entries</p>
        </div>
        <button 
          style={styles.addBtn}
          className="btn w-80 w-md-auto text-white"
          onClick={() => handleOpenModal()}
        >
          + Add New Work
        </button>
      </div>

      <div style={styles.filtersCard} className="p-3 p-md-4">
        <form onSubmit={handleSearch} className="d-flex flex-column gap-3">
          <div className="row g-3">
            <div className="col-12 col-md-6 d-flex flex-column gap-2">
              <label style={styles.label}>Date</label>
              <input
                type="date"
                name="date"
                value={filters.date}
                onChange={handleFilterChange}
                className="form-control"
              />
            </div>
            <div className="col-12 col-md-6 d-flex flex-column gap-2">
              <label style={styles.label}>Work Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="form-select"
              >
                <option value="">All</option>
                <option value="Completed">Completed</option>
                <option value="In Progress">In Progress</option>
              </select>
            </div>
          </div>
          <div className="d-flex flex-column flex-sm-row gap-2 mt-2">
            <button type="submit" style={styles.searchBtn} className="btn w-100 w-sm-auto text-white">
              Search
            </button>
            <button 
              type="button" 
              style={styles.resetBtn}
              className="btn w-100 w-sm-auto text-white"
              onClick={() => setFilters({
                page: 1,
                limit: 10,
                date: '',
                status: ''
              })}
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      <div style={{ ...styles.tableCard, overflowX: "hidden" }}>
  
  <div className="table-responsive">
    <table className="table table-hover mb-0" style={{ ...styles.table, minWidth: "700px" }}>
      
      <thead>
        <tr>
          <th style={styles.th}>Date</th>
          <th style={styles.th}>Customer</th>
          <th style={styles.th}>Payment Method</th>
          <th style={styles.th}>Work Title</th>
          <th style={styles.th}>Amount</th>
          <th style={styles.th}>Payment</th>
          <th style={styles.th}>Work Status</th>
          <th style={styles.th}>Actions</th>
        </tr>
      </thead>

      <tbody>
        {works.map(work => (
          <tr key={work._id}>
            
            <td style={{ ...styles.td, whiteSpace: "nowrap" }}>
              {formatDate(work.date)}
            </td>

            <td style={{ ...styles.td, maxWidth: "150px" }}>
              <div className="text-truncate">
                {work.customerName}
              </div>
            </td>

            <td style={styles.td}>
              {work.paymentMethod || 'Hand Cash'}
            </td>

            <td style={{ ...styles.td, maxWidth: "180px" }}>
              <div className="text-truncate">
                {work.items && work.items.length > 0 ? work.items.map(i => i.title).join(', ') : work.workTitle}
              </div>
            </td>

            <td style={styles.td}>
              <div>₹{work.amount.toLocaleString()}</div>
              {/* {work.adminPrice > 0 && work.adminPrice !== work.amount && (
                <div style={{ fontSize: '12px', color: '#e74c3c' }}>
                  Base: ₹{work.adminPrice.toLocaleString()}
                </div>
              )} */}
            </td>

            <td style={styles.td}>
              {getStatusBadge(work.paymentStatus, 'payment')}
            </td>

            <td style={styles.td}>
              {getStatusBadge(work.workStatus, 'work')}
            </td>

            <td style={styles.td}>
              <div className="d-flex flex-column flex-md-row gap-1 gap-md-2">
                
                <button
                  style={styles.editBtn}
                  className="btn btn-sm text-white w-100 w-md-auto"
                  onClick={() => handleOpenModal(work)}
                >
                  Edit
                </button>

                <button
                  style={styles.deleteBtn}
                  className="btn btn-sm text-white w-100 w-md-auto"
                  onClick={() => handleDelete(work._id)}
                >
                  Delete
                </button>

                <button
                  style={{ ...styles.editBtn, backgroundColor: '#2ecc71' }}
                  className="btn btn-sm text-white w-100 w-md-auto"
                  onClick={() => handlePrint(work)}
                >
                  Print
                </button>

              </div>
            </td>

          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {works.length === 0 && (
    <div style={{ ...styles.noData, textAlign: "center", padding: "20px" }}>
      No works found. Click "Add New Work" to create your first entry.
    </div>
  )}

  {pagination.totalWorks > 0 && (
    <div className="p-3 d-flex justify-content-center">
      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalWorks}
        itemsPerPage={pagination.limit}
        onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
      />
    </div>
  )}

</div>

      {showModal && (
        <div style={styles.modalOverlay} className="p-3" onClick={handleCloseModal}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle} className="fs-5">
                {editingWork ? 'Edit Work' : 'Add New Work'}
              </h2>
              <button style={styles.closeBtn} onClick={handleCloseModal}>×</button>
            </div>
            <form onSubmit={handleSubmit} style={styles.modalBody}>
              <div className="row g-3">
                <div className="col-12 col-md-6 d-flex flex-column gap-2">
                  <label style={styles.label}>Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="form-control"
                    required
                  />
                </div>
                <div className="col-12 col-md-6 d-flex flex-column gap-2">
                  <label style={styles.label}>Amount (₹)</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>
              <div className="d-flex flex-column gap-2">
                <label style={styles.label}>Customer Name</label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Enter customer name"
                  required
                />
              </div>
              <div className="d-flex flex-column gap-2">
                <label style={styles.label}>Customer Phone</label>
                <input
                  type="text"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Enter customer phone number"
                />
              </div>
              <div className="d-flex flex-column gap-2">
                <label style={styles.label}>Payment Method</label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="Hand Cash">Hand Cash</option>
                  <option value="GPay">GPay</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="d-flex flex-column gap-2 mb-3 mt-3">
                <label style={styles.label}>Selected Works</label>
                {formData.items.map((item, index) => (
                  <div key={index} className="d-flex flex-column flex-sm-row gap-2 align-items-start align-items-sm-center mb-2">
                    <select
                      value={item.workItemId}
                      onChange={(e) => handleItemChange(index, 'workItemId', e.target.value)}
                      className="form-select flex-grow-1"
                      required={!item.workTitle && !item.workItemId}
                    >
                      <option value="">Select a Work Item...</option>
                      {workItems.map(wi => (
                        <option key={wi._id} value={wi._id}>{wi.name}</option>
                      ))}
                    </select>
                    {!item.workItemId && (
                      <input
                        type="text"
                        value={item.workTitle}
                        onChange={(e) => handleItemChange(index, 'workTitle', e.target.value)}
                        className="form-control flex-grow-1"
                        placeholder="Custom Title"
                      />
                    )}
                    {formData.items.length > 1 && (
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => removeItemRow(index)}>X</button>
                    )}
                  </div>
                ))}
                <button type="button" className="btn btn-outline-primary btn-sm align-self-start" onClick={addItemRow}>
                  + Add Another Work
                </button>
              </div>
              <div className="row g-3">
                <div className="col-12 col-md-6 d-flex flex-column gap-2">
                  <label style={styles.label}>Payment Status</label>
                  <select
                    name="paymentStatus"
                    value={formData.paymentStatus}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
                <div className="col-12 col-md-6 d-flex flex-column gap-2">
                  <label style={styles.label}>Work Status</label>
                  <select
                    name="workStatus"
                    value={formData.workStatus}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="Completed">Completed</option>
                    <option value="In Progress">In Progress</option>
                  </select>
                </div>
              </div>
              <div className="d-flex flex-column gap-2">
                <label style={styles.label}>Notes (Optional)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="form-control"
                  style={styles.textarea}
                  placeholder="Add any additional notes..."
                  rows="3"
                />
              </div>
              <div className="d-flex flex-column flex-sm-row gap-2 justify-content-end mt-3">
                <button type="button" style={styles.cancelBtn} className="btn w-100 w-sm-auto text-white" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" style={styles.submitBtn} className="btn w-100 w-sm-auto text-white">
                  {editingWork ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addBtn: {
    padding: '12px 24px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  filtersCard: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '20px'
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
  textarea: {
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    resize: 'vertical',
    fontFamily: 'inherit'
  },
  filtersActions: {
    display: 'flex',
    gap: '12px'
  },
  searchBtn: {
    padding: '10px 24px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  resetBtn: {
    padding: '10px 24px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  tableCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    overflow: 'hidden'
  },
  tableWrapper: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    padding: '16px',
    textAlign: 'left',
    backgroundColor: '#f8f9fa',
    fontWeight: '600',
    color: '#2c3e50',
    borderBottom: '2px solid #e9ecef',
    fontSize: '14px'
  },
  td: {
    padding: '16px',
    borderBottom: '1px solid #e9ecef',
    fontSize: '14px'
  },
  badge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500'
  },
  actions: {
    display: 'flex',
    gap: '8px'
  },
  editBtn: {
    padding: '6px 16px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer'
  },
  deleteBtn: {
    padding: '6px 16px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer'
  },
  noData: {
    padding: '40px',
    textAlign: 'center',
    color: '#666',
    fontSize: '16px'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '500px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
    maxHeight: '90vh',
    overflow: 'auto'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #e9ecef'
  },
  modalTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#666'
  },
  modalBody: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px'
  },
  modalFooter: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end'
  },
  cancelBtn: {
    padding: '10px 24px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  submitBtn: {
    padding: '10px 24px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  }
};

export default EmployeeWorks;