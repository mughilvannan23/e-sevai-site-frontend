import React, { useState, useEffect, useRef } from 'react';
import { workAPI } from '../services/api';
import Loading from '../components/common/Loading';
import Pagination from '../components/common/Pagination';
import { useToast } from '../components/common/Toast';
import { useLocation } from 'react-router-dom';

// ---------------------------------------------------------------------------
// Default blank form state
// ---------------------------------------------------------------------------
const getCurrentTime = () => new Date().toTimeString().slice(0, 5);

const defaultFormData = {
  date: new Date().toISOString().split('T')[0],
  time: getCurrentTime(),
  customerName: '',
  customerPhone: '',
  paymentMethod: 'Hand Cash',
  items: [{ workItemId: '', workTitle: '', quantity: 1, otherCharges: '0' }],
  amount: '',
  paymentStatus: 'Pending',
  workStatus: 'Pending',
  notes: ''
};

const EmployeeWorks = () => {
  const location = useLocation();
  const formRef = useRef(null);
  const tableRef = useRef(null);
  const [shouldScroll, setShouldScroll] = useState(false);

  // ── Table state ────────────────────────────────────────────────────────────
  const [works, setWorks] = useState([]);
  const [workItems, setWorkItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    date: '',
    status: '',
    searchName: '',
    searchPhone: '',
    paymentStatus: ''
  });

  // ── Form state ─────────────────────────────────────────────────────────────
  const [editingWork, setEditingWork] = useState(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [submitting, setSubmitting] = useState(false);

  const { success, error } = useToast();

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchWorks();
    fetchWorkItems();
  }, [filters.page, filters.limit, filters.status, filters.paymentStatus]);

  useEffect(() => {
    if (shouldScroll && !loading && works.length > 0) {
      tableRef.current?.scrollIntoView({ behavior: 'smooth' });
      setShouldScroll(false);
    }
  }, [works, loading, shouldScroll]);

  useEffect(() => {
    const state = location.state;
    if (state) {
      const newFilters = {
        page: 1,
        limit: 10,
        date: '',
        status: state.status || '',
        paymentStatus: state.paymentStatus || '',
        searchName: '',
        searchPhone: ''
      };
      setFilters(newFilters);
      fetchWorksWithFilters(newFilters);
      setShouldScroll(true);
    }
  }, [location.state]);

  // ── API helpers ────────────────────────────────────────────────────────────
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

  // ── Form handlers ──────────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'paymentStatus' && value === 'Pending') {
        updated.paymentMethod = '';
      } else if (name === 'paymentStatus' && value === 'Paid' && !prev.paymentMethod) {
        updated.paymentMethod = 'Hand Cash';
      }
      return updated;
    });
  };

  const handleItemChange = (index, field, value) => {
    let newItems = [...formData.items];

    if (field === 'workItemId' && value !== '') {
      const existingIndex = newItems.findIndex((item, i) => i !== index && item.workItemId === value);
      if (existingIndex !== -1) {
        newItems[existingIndex].quantity = (parseInt(newItems[existingIndex].quantity) || 1) + 1;
        if (newItems.length > 1) {
          newItems.splice(index, 1);
        } else {
          newItems[index] = { workItemId: '', workTitle: '', quantity: 1, otherCharges: '0' };
        }
      } else {
        newItems[index] = { ...newItems[index], [field]: value };
      }
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }

    const total = newItems.reduce((sum, item) => {
      const qty = parseInt(item.quantity) || 1;
      const otherC = parseFloat(item.otherCharges) || 0;
      let rowCost = otherC;
      if (item.workItemId) {
        const wi = workItems.find(w => w._id === item.workItemId);
        rowCost += (wi ? (wi.workCharge + wi.serviceCharge) * qty : 0);
      }
      return sum + rowCost;
    }, 0);
    setFormData(prev => ({ ...prev, items: newItems, amount: total.toString() }));
  };

  const addItemRow = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { workItemId: '', workTitle: '', quantity: 1, otherCharges: '0' }]
    }));
  };

  const removeItemRow = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    const total = newItems.reduce((sum, item) => {
      const qty = parseInt(item.quantity) || 1;
      const otherC = parseFloat(item.otherCharges) || 0;
      let rowCost = otherC;
      if (item.workItemId) {
        const wi = workItems.find(w => w._id === item.workItemId);
        rowCost += (wi ? (wi.workCharge + wi.serviceCharge) * qty : 0);
      }
      return sum + rowCost;
    }, 0);

    setFormData(prev => ({
      ...prev,
      items: newItems.length ? newItems : [{ workItemId: '', workTitle: '', quantity: 1, otherCharges: '0' }],
      amount: total.toString()
    }));
  };

  const handleReset = () => {
    setEditingWork(null);
    setFormData({ ...defaultFormData, date: new Date().toISOString().split('T')[0], time: getCurrentTime() });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        date: new Date(`${formData.date}T${formData.time || '00:00'}`)
      };
      if (editingWork) {
        const response = await workAPI.updateWork(editingWork._id, payload);
        if (response.data.success) {
          success('Work updated successfully');
          handleReset();
          fetchWorks();
        }
      } else {
        const response = await workAPI.createWork(payload);
        if (response.data.success) {
          success('Work entry created successfully');
          handleReset();
          fetchWorks();
        }
      }
    } catch (err) {
      console.error('Error saving work:', err);
      error(err.response?.data?.message || 'Failed to save work');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Table handlers ─────────────────────────────────────────────────────────
  const handleEdit = (work) => {
    setEditingWork(work);
    const workDate = new Date(work.date);
    setFormData({
      date: workDate.toISOString().split('T')[0],
      time: workDate.toTimeString().slice(0, 5),
      customerName: work.customerName,
      customerPhone: work.customerPhone || '',
      paymentMethod: work.paymentMethod || 'Hand Cash',
      items: work.items && work.items.length > 0
        ? work.items.map(i => ({ workItemId: i.workItemId || '', workTitle: i.title || '', quantity: i.quantity || 1, otherCharges: (i.otherCharges || 0).toString() }))
        : [{ workItemId: '', workTitle: '', quantity: 1, otherCharges: '0' }],
      amount: work.amount.toString(),
      paymentStatus: work.paymentStatus,
      workStatus: work.workStatus,
      notes: work.notes || ''
    });
    // Scroll to form
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchWorks();
  };

  // Apply frontend filters to works list
  const getFilteredWorks = () => {
    return works.filter(work => {
      // Customer Name filter (case-insensitive partial match)
      if (filters.searchName && !work.customerName?.toLowerCase().includes(filters.searchName.toLowerCase())) {
        return false;
      }

      // Customer Phone filter (partial match)
      if (filters.searchPhone && !work.customerPhone?.includes(filters.searchPhone)) {
        return false;
      }

      // Payment Status filter
      if (filters.paymentStatus && work.paymentStatus !== filters.paymentStatus) {
        return false;
      }

      return true;
    });
  };

  // ── Print ──────────────────────────────────────────────────────────────────
 const handlePrint = (work) => {
  const printWindow = window.open('', '_blank');

  const itemsHtml = work.items?.length
    ? work.items.map(i => {
        const qty = i.quantity || 1;
        const price = (i.workChargeAtTime || 0) + (i.serviceChargeAtTime || 0);
        const total = qty * price + (i.otherCharges || 0);

        return `
          <div class="row">
            <span>${i.title}</span>
            <span>${qty} x ₹${price} = ₹${total}</span>
          </div>
        `;
      }).join('')
    : '';

  const content = `
  <html>
  <head>
    <style>
      body {
        width: 280px;
        font-family: monospace;
        font-size: 12px;
        padding: 5px;
      }

      .center { text-align: center; }
      .bold { font-weight: bold; }

      .line {
        border-top: 1px dashed #000;
        margin: 6px 0;
      }

      .row {
        display: flex;
        justify-content: space-between;
        margin: 2px 0;
      }

      .title {
        font-size: 14px;
        font-weight: bold;
        text-align: center;
      }
    </style>
  </head>

  <body>

    <!-- 1. COMPANY NAME -->
    <div class="title">
      SEVAGAN CSC &<br/>
      E-SEVA CENTRE
    </div>

    <div class="line"></div>

    <!-- 2. DATE TIME -->
    <div class="row">
      <span>${new Date(work.date).toLocaleDateString()}</span>
      <span>${new Date(work.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
    </div>

    <div class="line"></div>

    <!-- 3. CUSTOMER -->
    <div>Customer: ${work.customerName}</div>
    <div>Phone: ${work.customerPhone || '-'}</div>

    <div class="line"></div>

    <!-- 4. ITEMS -->
    <div class="bold row">
      <span>Work</span>
      <span>Qty / Amt</span>
    </div>

    ${itemsHtml}

    <div class="line"></div>

    <!-- 5. TOTAL -->
    <div class="row bold">
      <span>TOTAL AMOUNT</span>
      <span>₹${work.amount}</span>
    </div>

    <div class="line"></div>

    <!-- 6. THANK YOU -->
    <div class="center">
      Thank You<br/>
      Visit Again 🙏
    </div>

  </body>
  </html>
  `;

  printWindow.document.write(content);
  printWindow.document.close();
  printWindow.print();
};

  // ── Formatters ─────────────────────────────────────────────────────────────
  const formatDateTime = (date) => {
    if (!date) return '-';
    return new Date(date)
      .toLocaleString('en-IN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
      })
      .replace(/\//g, '-')
      .replace(/, /g, ' ')
      .replace(/am/i, 'AM')
      .replace(/pm/i, 'PM');
  };

  const getStatusBadge = (status, type) => {
    const isPayment = type === 'payment';
    const positive = isPayment ? status === 'Paid' : status === 'Completed';
    return (
      <span style={{
        ...styles.badge,
        backgroundColor: positive
          ? 'var(--success-color)'
          : (isPayment ? 'var(--danger-color)' : 'var(--warning-color)'),
        color: 'white'
      }}>
        {status}
      </span>
    );
  };

  // ── Early loading screen ───────────────────────────────────────────────────
  if (loading && works.length === 0) {
    return <Loading text="Loading works..." />;
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="container-fluid p-0">

      {/* ── Page heading ── */}
      <div className="mb-4">
        <h1 style={styles.title} className="fs-3">My Works</h1>
        <p style={styles.subtitle} className="mb-0">Manage your work entries</p>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          INLINE FORM — always visible at the top
      ══════════════════════════════════════════════════════════════════════ */}
      <div ref={formRef} style={styles.formCard} className="mb-4">

        {/* Form header */}
        <div style={styles.formHeader}>
          <div>
            <h2 style={styles.formTitle}>
              {editingWork ? ' Edit Work' : 'Add New Entry'}
            </h2>
            <p style={styles.formSubtitle}>
              {editingWork
                ? 'Update the work details below, then click Update Work'
                : 'Fill in the details to create a new work entry'}
            </p>
          </div>
          {editingWork && (
            <span style={styles.editingBadge}>Editing</span>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Section 1: Basic Info */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Basic Info</h3>
            <div className="row g-3">
              <div className="col-12 col-md-4">
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
              <div className="col-12 col-md-4">
                <label style={styles.label}>Time</label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                />
              </div>

            </div>
          </div>

          {/* Section 2: Customer Details */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Customer Details</h3>
            <div className="row g-3">
              <div className="col-12 col-md-6">
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
              <div className="col-12 col-md-6">
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
              {/* <div className="col-12 col-md-6">
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
              </div> */}
            </div>
          </div>

          {/* Section 3: Work Items */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Work Items</h3>
            <div style={styles.workItemsContainer}>
              <div className="table-responsive">
                <table className="table table-bordered mb-2 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Work/Service</th>
                      {/* <th><label style={styles.label}><b>Other Charges</b> (₹)</label></th> */}
                      {/* <th>Service Charge</th> */}
                      <th style={{ width: '100px' }}>Quantity</th>
                      <th>Total</th>
                      <th><label style={styles.label}><b>Other Charges</b> (₹)</label></th>
                      <th style={{ width: '50px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item, index) => {
                      const wi = item.workItemId ? workItems.find(w => w._id === item.workItemId) : null;
                      const wc = wi ? wi.workCharge : 0;
                      const sc = wi ? wi.serviceCharge : 0;
                      const qty = parseInt(item.quantity) || 1;
                      const rowTotal = (wc + sc) * qty;

                      return (
                        <tr key={index}>
                          <td>
                            <select
                              value={item.workItemId}
                              onChange={(e) => handleItemChange(index, 'workItemId', e.target.value)}
                              className="form-select form-select-sm"
                              required={!item.workTitle && !item.workItemId}
                            >
                              <option value="">Select Work Item...</option>
                              {workItems.map(w => (
                                <option key={w._id} value={w._id}>{w.name}</option>
                              ))}
                            </select>
                            {!item.workItemId && (
                              <input
                                type="text"
                                value={item.workTitle}
                                onChange={(e) => handleItemChange(index, 'workTitle', e.target.value)}
                                className="form-control form-control-sm mt-1"
                                placeholder="Custom Title"
                              />
                            )}
                          </td>
                          <td>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                              className="form-control form-control-sm"
                            />
                          </td>
                          <td className="fw-bold">₹{rowTotal}</td>
                          <td>
                            <input
                              type="number"
                              value={item.otherCharges}
                              onChange={(e) => handleItemChange(index, 'otherCharges', e.target.value)}
                              className="form-control form-control-sm"
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                            />
                          </td>
                          <td className="text-center">
                            {formData.items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeItemRow(index)}
                                className="btn btn-sm btn-outline-danger"
                              >
                                ✕
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <button
                type="button"
                style={styles.addItemBtn}
                onClick={addItemRow}
                className="btn"
              >
                Add Another Work
              </button>
            </div>


            <div className="row g-3 mt-2">



              {/* <div className="col-12 col-md-4 mt-3">
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
              </div> */}
              <div className="col-12 col-md-4 mt-3">

              </div>
              <div className="col-12 col-md-12 mt-3 text-end">
                <strong style={{ fontSize: '1.2rem', color: '#2c3e50' }}>
                  Final Amount: ₹{(parseFloat(formData.amount) || 0).toFixed(2)}
                </strong>
              </div>
            </div>


          </div>

          {/* Section 4: Status & Notes */}
          <div style={{ ...styles.section, borderBottom: 'none', marginBottom: 0, paddingBottom: 0 }}>
            <h3 style={styles.sectionTitle}>Status & Notes</h3>
            <div className="row g-3">
              <div className="col-12 col-md-6">
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
              {formData.paymentStatus === 'Paid' && (
                <div className="col-12 col-md-6 mt-3">
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
              )}

              <div className="col-12 col-md-6">
                <label style={styles.label}>Work Status</label>
                <select
                  name="workStatus"
                  value={formData.workStatus}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
              <div className="col-12">
                <label style={styles.label}>Notes (Optional)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Add any additional notes..."
                  rows="3"
                  style={{ resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={styles.formActions}>
            <button
              type="button"
              style={styles.resetBtn}
              className="btn"
              onClick={handleReset}
            >
              Clear Form
            </button>
            <button
              type="submit"
              style={styles.submitBtn}
              className="btn"
              disabled={submitting}
            >
              {submitting
                ? 'Saving...'
                : editingWork ? 'Update Work' : 'Submit Work'}
            </button>
          </div>
        </form>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          FILTER BAR
      ══════════════════════════════════════════════════════════════════════ */}
      <div style={styles.filtersCard} className="p-3 p-md-4 mb-4">
        <form onSubmit={handleSearch} className="d-flex flex-column gap-3">
          <div className="row g-3">
            <div className="col-12 col-md-4 d-flex flex-column gap-2">
              <label style={styles.label}>Date</label>
              <input
                type="date"
                name="date"
                value={filters.date}
                onChange={handleFilterChange}
                className="form-control"
              />
            </div>
            <div className="col-12 col-md-4 d-flex flex-column gap-2">
              <label style={styles.label}>Work Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="form-select"
              >
                <option value="">All</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            <div className="col-12 col-md-4 d-flex flex-column gap-2">
              <label style={styles.label}>Payment Status</label>
              <select
                name="paymentStatus"
                value={filters.paymentStatus}
                onChange={handleFilterChange}
                className="form-select"
              >
                <option value="">All</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            <div className="col-12 col-md-6 d-flex flex-column gap-2">
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
            <div className="col-12 col-md-6 d-flex flex-column gap-2">
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
          </div>
          <div className="d-flex flex-column flex-sm-row gap-2 mt-1">
            <button type="submit" style={styles.searchBtn} className="btn w-100 w-sm-auto text-white">
              Search
            </button>
            <button
              type="button"
              style={styles.filterResetBtn}
              className="btn w-100 w-sm-auto text-white"
              onClick={() => setFilters({
                page: 1,
                limit: 10,
                date: '',
                status: '',
                searchName: '',
                searchPhone: '',
                paymentStatus: ''
              })}
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          WORKS TABLE
      ══════════════════════════════════════════════════════════════════════ */}
      <div ref={tableRef} style={{ ...styles.tableCard, overflowX: 'hidden' }}>
        <div className="table-responsive">
          <table className="table table-hover mb-0" style={{ minWidth: '700px' }}>
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
              {getFilteredWorks().map(work => (
                <tr key={work._id}>
                  <td style={{ ...styles.td, whiteSpace: 'nowrap' }}>
                    {formatDateTime(work.date)}
                  </td>
                  <td style={{ ...styles.td, maxWidth: '150px' }}>
                    <div className="text-truncate fw-bold">{work.customerName}</div>
                    <div className="text-muted small">{work.customerPhone || '-'}</div>
                  </td>
                  <td style={styles.td}>
                    {work.paymentMethod || 'Hand Cash'}
                  </td>
                  <td style={{ ...styles.td, maxWidth: '200px', whiteSpace: 'normal' }}>
                    <div>
                      {work.items && work.items.length > 0
                        ? work.items.map(i => `${i.title} (x${i.quantity || 1})`).join(', ')
                        : work.workTitle}
                    </div>
                  </td>
                  <td style={styles.td}>₹{work.amount.toLocaleString()}</td>
                  <td style={styles.td}>{getStatusBadge(work.paymentStatus, 'payment')}</td>
                  <td style={styles.td}>{getStatusBadge(work.workStatus, 'work')}</td>
                  <td style={styles.td}>
                    <div className="d-flex flex-column flex-md-row gap-1 gap-md-2">
                      <button
                        style={styles.editBtn}
                        className="btn btn-sm text-white w-100 w-md-auto"
                        onClick={() => handleEdit(work)}
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

        {getFilteredWorks().length === 0 && (
          <div style={styles.noData}>
            No works found. Fill in the form above to create your first entry.
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

    </div>
  );
};

// ── Styles ──────────────────────────────────────────────────────────────────
const styles = {
  title: {
    margin: '0 0 4px 0',
    fontWeight: 'bold',
    color: 'var(--text-color)'
  },
  subtitle: {
    color: 'var(--text-muted)',
    fontSize: '15px'
  },

  // Form card
  formCard: {
    backgroundColor: 'var(--card-bg)',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
    boxShadow: 'var(--shadow)',
    padding: '28px 32px'
  },
  formHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '1px solid var(--border-color)'
  },
  formTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '700',
    color: 'var(--text-color)'
  },
  formSubtitle: {
    margin: '4px 0 0 0',
    fontSize: '14px',
    color: 'var(--text-muted)'
  },
  editingBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    backgroundColor: '#fff3cd',
    color: '#856404',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    border: '1px solid #ffc107'
  },
  section: {
    marginBottom: '28px',
    paddingBottom: '24px',
    borderBottom: '1px solid #f3f4f6'
  },
  sectionTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '16px',
    marginTop: 0
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '6px',
    display: 'block'
  },
  workItemsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  workItemRow: {
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start'
  },
  removeBtn: {
    padding: '8px 14px',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer'
  },
  addItemBtn: {
    padding: '10px 18px',
    backgroundColor: '#f9fafb',
    color: '#4b5563',
    border: '1px dashed #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    alignSelf: 'flex-start',
    marginTop: '4px'
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '28px',
    paddingTop: '20px',
    borderTop: '1px solid var(--border-color)'
  },
  resetBtn: {
    padding: '10px 24px',
    backgroundColor: '#fff',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer'
  },
  submitBtn: {
    padding: '10px 28px',
    backgroundColor: 'var(--primary-color)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },

  // Filter bar
  filtersCard: {
    backgroundColor: 'var(--card-bg)',
    borderRadius: '12px',
    boxShadow: 'var(--shadow)'
  },
  searchBtn: {
    padding: '10px 24px',
    backgroundColor: 'var(--primary-color)',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  filterResetBtn: {
    padding: '10px 24px',
    backgroundColor: '#6c757d',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },

  // Table
  tableCard: {
    backgroundColor: 'var(--card-bg)',
    borderRadius: '12px',
    boxShadow: 'var(--shadow)',
    overflow: 'hidden'
  },
  th: {
    padding: '16px',
    textAlign: 'left',
    backgroundColor: '#f8f9fa',
    fontWeight: '600',
    color: 'var(--text-color)',
    borderBottom: '2px solid var(--border-color)',
    fontSize: '14px'
  },
  td: {
    padding: '16px',
    borderBottom: '1px solid var(--border-color)',
    fontSize: '14px'
  },
  badge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500'
  },
  editBtn: {
    padding: '6px 16px',
    backgroundColor: 'var(--primary-color)',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer'
  },
  deleteBtn: {
    padding: '6px 16px',
    backgroundColor: 'var(--danger-color)',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer'
  },
  noData: {
    padding: '40px',
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '15px'
  }
};

export default EmployeeWorks;
