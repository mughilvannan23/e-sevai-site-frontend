import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { workAPI } from '../services/api';
import { useToast } from '../components/common/Toast';

// Utility function to get current time in HH:MM format
const getCurrentTime = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

const AddWork = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editingWork = location.state?.work || null;

  const [workItems, setWorkItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: getCurrentTime(),
    customerName: '',
    customerPhone: '',
    paymentMethod: 'Cash', // Single selection: 'GPay', 'Cash', or 'Both'
    gpayAmount: '',
    cashAmount: '',
    totalAmount: '',
    items: [{ workItemId: '', workTitle: '', applicationNumber: '', otherCharges: '', discount: '' }],
    amount: '',
    totalDiscount: '',
    paymentStatus: 'Pending',
    workStatus: 'In Progress',
    notes: ''
  });

  const { success, error } = useToast();

  useEffect(() => {
    fetchWorkItems();

    // If editing, populate form data
    if (editingWork) {
      let paymentMethod = 'Hand Cash';
      if (editingWork.gpayAmount > 0 && editingWork.cashAmount > 0) {
        paymentMethod = 'Both';
      } else if (editingWork.gpayAmount > 0) {
        paymentMethod = 'GPay';
      } else if (editingWork.cashAmount > 0) {
        paymentMethod = 'Cash';
      }

      setFormData({
        date: new Date(editingWork.date).toISOString().split('T')[0],
        time: editingWork.time || getCurrentTime(),
        customerName: editingWork.customerName,
        customerPhone: editingWork.customerPhone || '',
        paymentMethod: paymentMethod,
        gpayAmount: editingWork.gpayAmount?.toString() || '',
        cashAmount: editingWork.cashAmount?.toString() || '',
        totalAmount: editingWork.totalAmount?.toString() || editingWork.amount?.toString() || '',
        items: editingWork.items && editingWork.items.length > 0
          ? editingWork.items.map(i => ({
            workItemId: i.workItemId || '',
            workTitle: i.title || '',
            applicationNumber: i.applicationNumber || '',
            otherCharges: i.otherCharges?.toString() || '',
            discount: i.discount?.toString() || ''
          }))
          : [{ workItemId: '', workTitle: '', applicationNumber: '', otherCharges: '', discount: '' }],
        amount: editingWork.amount.toString(),
        totalDiscount: editingWork.totalDiscount?.toString() || '0',
        paymentStatus: editingWork.paymentStatus,
        workStatus: editingWork.workStatus,
        notes: editingWork.notes || ''
      });
    }
  }, [editingWork]);

  const fetchWorkItems = async () => {
    try {
      const response = await workAPI.getActiveWorkItems();
      if (response.data.success) {
        setWorkItems(response.data.workItems);
      }
    } catch (err) {
      console.error('Error fetching work items:', err);
      error('Failed to load work items');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentMethodChange = (method) => {
    setFormData(prev => {
      let newData = { ...prev, paymentMethod: method };
      
      // Clear amounts based on selection
      if (method === 'GPay') {
        newData.cashAmount = '';
        newData.totalAmount = prev.gpayAmount;
      } else if (method === 'Cash') {
        newData.gpayAmount = '';
        newData.totalAmount = prev.cashAmount;
      } else if (method === 'Both') {
        // Keep both amounts and recalculate total
        const gpay = parseFloat(prev.gpayAmount) || 0;
        const cash = parseFloat(prev.cashAmount) || 0;
        newData.totalAmount = (gpay + cash).toString();
      }
      
      return newData;
    });
  };

  const handleAmountChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Auto-calculate total based on payment method
      if (prev.paymentMethod === 'Both') {
        const gpay = parseFloat(newData.gpayAmount) || 0;
        const cash = parseFloat(newData.cashAmount) || 0;
        newData.totalAmount = (gpay + cash).toString();
      } else if (prev.paymentMethod === 'GPay') {
        newData.totalAmount = value;
      } else if (prev.paymentMethod === 'Cash') {
        newData.totalAmount = value;
      }
      
      return newData;
    });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Calculate totals
    let subtotal = 0;
    let totalOtherCharges = 0;
    let totalDiscount = 0;

    newItems.forEach(item => {
      if (item.workItemId) {
        const wi = workItems.find(w => w._id === item.workItemId);
        if (wi) {
          subtotal += (wi.workCharge + wi.serviceCharge) * (parseInt(item.quantity) || 1);
        }
      }
      totalOtherCharges += parseFloat(item.otherCharges) || 0;
      totalDiscount += parseFloat(item.discount) || 0;
    });

    const finalAmount = subtotal + totalOtherCharges - totalDiscount;

    setFormData(prev => ({
      ...prev,
      items: newItems,
      amount: finalAmount.toString(),
      totalDiscount: totalDiscount.toString()
    }));
  };

  const addItemRow = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { workItemId: '', workTitle: '', applicationNumber: '', otherCharges: '', discount: '' }]
    }));
  };

  const removeItemRow = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    
    // Calculate totals
    let subtotal = 0;
    let totalOtherCharges = 0;
    let totalDiscount = 0;

    newItems.forEach(item => {
      if (item.workItemId) {
        const wi = workItems.find(w => w._id === item.workItemId);
        if (wi) {
          subtotal += (wi.workCharge + wi.serviceCharge) * (parseInt(item.quantity) || 1);
        }
      }
      totalOtherCharges += parseFloat(item.otherCharges) || 0;
      totalDiscount += parseFloat(item.discount) || 0;
    });

    const finalAmount = subtotal + totalOtherCharges - totalDiscount;

    setFormData(prev => ({
      ...prev,
      items: newItems.length ? newItems : [{ workItemId: '', workTitle: '', applicationNumber: '', otherCharges: '', discount: '' }],
      amount: finalAmount.toString(),
      totalDiscount: totalDiscount.toString()
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);

      // Prepare data for submission
      const submitData = {
        ...formData,
        gpayAmount: parseFloat(formData.gpayAmount) || 0,
        cashAmount: parseFloat(formData.cashAmount) || 0,
        totalAmount: parseFloat(formData.totalAmount) || 0,
        amount: parseFloat(formData.totalAmount) || 0 // Keep backward compatibility
      };

      // Validation
      if (submitData.totalAmount <= 0) {
        error('Total amount must be greater than zero');
        return;
      }

      if (formData.paymentMethod === 'Both' && (submitData.gpayAmount <= 0 || submitData.cashAmount <= 0)) {
        error('Both GPay and Cash amounts are required for split payment');
        return;
      }

      if (formData.paymentMethod === 'GPay' && submitData.gpayAmount <= 0) {
        error('GPay amount is required');
        return;
      }

      if (formData.paymentMethod === 'Cash' && submitData.cashAmount <= 0) {
        error('Cash amount is required');
        return;
      }

      if (editingWork) {
        const response = await workAPI.updateWork(editingWork._id, submitData);
        if (response.data.success) {
          success('Work updated successfully');
          navigate('/employee-works');
        }
      } else {
        const response = await workAPI.createWork(submitData);
        if (response.data.success) {
          success('Work entry created successfully');
          navigate('/employee-works');
        }
      }
    } catch (err) {
      console.error('Error saving work:', err);
      error(err.response?.data?.message || 'Failed to save work');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/employee-works');
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading work items...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.pageWrapper}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>
              {editingWork ? 'Edit Work' : 'Add New Work'}
            </h1>
            <p style={styles.subtitle}>
              {editingWork ? 'Update the work details below' : 'Fill in the details to create a new work entry'}
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div style={styles.formCard}>
          <form onSubmit={handleSubmit}>
            {/* Combined Section: Basic & Customer Info */}
            <div style={styles.section}>
              <div className="row g-1">
                <div className="col-6 col-md-2">
                  <label style={styles.label}>Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="form-control"
                    style={styles.input}
                    required
                  />
                </div>
                <div className="col-6 col-md-2">
                  <label style={styles.label}>Time</label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    className="form-control"
                    style={styles.input}
                    required
                  />
                </div>
                <div className="col-12 col-md-3">
                  <label style={styles.label}>Customer Name</label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    className="form-control"
                    style={styles.input}
                    placeholder="Name"
                    required
                  />
                </div>
                <div className="col-12 col-md-2">
                  <label style={styles.label}>Phone</label>
                  <input
                    type="text"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleInputChange}
                    className="form-control"
                    style={styles.input}
                    placeholder="Phone"
                  />
                </div>
                <div className="col-12 col-md-3">
                  <label style={styles.label}>Payment Method</label>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={(e) => handlePaymentMethodChange(e.target.value)}
                    className="form-select"
                    style={styles.input}
                  >
                    <option value="Cash">Cash</option>
                    <option value="GPay">GPay</option>
                    <option value="Both">Both</option>
                  </select>
                </div>
              </div>
              
              {/* Secondary Row for Amounts */}
              <div className="row g-1 mt-1">
                <div className="col-6 col-md-2">
                  <label style={styles.label}>Total Paid</label>
                  <input
                    type="number"
                    value={formData.totalAmount}
                    className="form-control"
                    style={{ ...styles.input, fontWeight: 'bold', color: '#2563eb', backgroundColor: '#f9fafb' }}
                    readOnly
                  />
                </div>
                {(formData.paymentMethod === 'GPay' || formData.paymentMethod === 'Both') && (
                  <div className="col-6 col-md-2">
                    <label style={styles.label}>GPay (₹)</label>
                    <input
                      type="number"
                      value={formData.gpayAmount}
                      onChange={(e) => handleAmountChange('gpayAmount', e.target.value)}
                      className="form-control"
                      style={styles.input}
                      required={formData.paymentMethod === 'GPay' || formData.paymentMethod === 'Both'}
                    />
                  </div>
                )}
                {(formData.paymentMethod === 'Cash' || formData.paymentMethod === 'Both') && (
                  <div className="col-6 col-md-2">
                    <label style={styles.label}>Cash (₹)</label>
                    <input
                      type="number"
                      value={formData.cashAmount}
                      onChange={(e) => handleAmountChange('cashAmount', e.target.value)}
                      className="form-control"
                      style={styles.input}
                      required={formData.paymentMethod === 'Cash' || formData.paymentMethod === 'Both'}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Section 3: Work Items */}
            <div style={styles.section}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h2 style={{ ...styles.sectionTitle, marginBottom: 0 }}>Work Items</h2>
                <button
                  type="button"
                  style={styles.addItemBtn}
                  onClick={addItemRow}
                  className="btn"
                >
                  + Add Item
                </button>
              </div>
              
              <div style={styles.workItemsContainer}>
                {/* Header Row - Desktop Only */}
                <div className="d-none d-md-flex gap-2 mb-1 px-1">
                  <div style={{ ...styles.workItemSelect, fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Service Name</div>
                  <div style={{ width: '150px', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>App. Number</div>
                  <div style={{ width: '100px', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Other (₹)</div>
                  <div style={{ width: '100px', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Disc (₹)</div>
                  <div style={{ width: '40px' }}></div>
                </div>

                {formData.items.map((item, index) => (
                  <div key={index} style={{ marginBottom: '8px' }}>
                    <div style={styles.workItemRow}>
                      <div style={styles.workItemSelect}>
                        <select
                          value={item.workItemId}
                          onChange={(e) => handleItemChange(index, 'workItemId', e.target.value)}
                          className="form-select"
                          style={styles.input}
                          required={!item.workTitle && !item.workItemId}
                        >
                          <option value="">Select Service...</option>
                          {workItems.map(wi => (
                            <option key={wi._id} value={wi._id}>{wi.name}</option>
                          ))}
                        </select>
                      </div>
                      <div style={{ width: '150px' }}>
                        <input
                          type="text"
                          value={item.applicationNumber || ''}
                          onChange={(e) => handleItemChange(index, 'applicationNumber', e.target.value)}
                          className="form-control"
                          style={styles.input}
                          placeholder="App No."
                        />
                      </div>
                      <div style={{ width: '100px' }}>
                        <input
                          type="number"
                          value={item.otherCharges || ''}
                          onChange={(e) => handleItemChange(index, 'otherCharges', e.target.value)}
                          className="form-control"
                          style={styles.input}
                          placeholder="Charges"
                        />
                      </div>
                      <div style={{ width: '100px' }}>
                        <input
                          type="number"
                          value={item.discount || ''}
                          onChange={(e) => handleItemChange(index, 'discount', e.target.value)}
                          className="form-control"
                          style={styles.input}
                          placeholder="Discount"
                        />
                      </div>
                      <div style={{ width: '40px' }}>
                        {formData.items.length > 1 && (
                          <button
                            type="button"
                            style={styles.removeBtn}
                            onClick={() => removeItemRow(index)}
                            className="btn"
                            title="Remove"
                          >
                            ✕
                        </button>
                      )}
                    </div>
                  </div>
                  {!item.workItemId && (
                    <div className="mt-1 px-1">
                      <input
                        type="text"
                        value={item.workTitle}
                        onChange={(e) => handleItemChange(index, 'workTitle', e.target.value)}
                        className="form-control"
                        style={{ ...styles.input, height: '30px', padding: '4px 8px' }}
                        placeholder="Type Custom Title here if service is not in list..."
                      />
                    </div>
                  )}
                </div>
                ))}
              </div>

              {/* Work Item Totals Summary Row */}
              <div className="d-flex justify-content-end gap-3 mt-2 pt-2 border-top">
                <div style={{ width: '150px' }}>
                  <label style={{ ...styles.label, marginBottom: '2px' }}>Total Disc (₹)</label>
                  <input
                    type="number"
                    value={formData.totalDiscount}
                    className="form-control"
                    style={{ ...styles.input, backgroundColor: '#f9fafb', height: '32px', padding: '4px 8px' }}
                    readOnly
                  />
                </div>
                <div style={{ width: '150px' }}>
                  <label style={{ ...styles.label, marginBottom: '2px', fontWeight: '700' }}>Bill Amount (₹)</label>
                  <input
                    type="number"
                    value={formData.amount}
                    className="form-control"
                    style={{ ...styles.input, fontWeight: 'bold', color: '#2563eb', height: '32px', padding: '4px 8px' }}
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Status & Notes */}
            <div style={{ ...styles.section, borderBottom: 'none' }}>
              <div className="row g-1">
                <div className="col-6 col-md-2">
                  <label style={styles.label}>Pay Status</label>
                  <select
                    name="paymentStatus"
                    value={formData.paymentStatus}
                    onChange={handleInputChange}
                    className="form-select"
                    style={styles.input}
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
                <div className="col-6 col-md-2">
                  <label style={styles.label}>Work Status</label>
                  <select
                    name="workStatus"
                    value={formData.workStatus}
                    onChange={handleInputChange}
                    className="form-select"
                    style={styles.input}
                  >
                    <option value="Completed">Completed</option>
                    <option value="In Progress">In Progress</option>
                  </select>
                </div>
                <div className="col-12 col-md-8">
                  <label style={styles.label}>Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="form-control"
                    style={styles.textarea}
                    placeholder="Notes..."
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={styles.actions}>
              <button
                type="button"
                style={styles.cancelBtn}
                onClick={handleCancel}
                className="btn"
              >
                Cancel
              </button>
              <button
                type="submit"
                style={styles.submitBtn}
                className="btn"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : (editingWork ? 'Update' : 'Create')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: '100vh', // Force height to viewport
    backgroundColor: '#f5f6fa',
    padding: '4px 8px', // Ultra-low padding
    overflow: 'hidden' // Try to prevent scroll if possible
  },
  pageWrapper: {
    maxWidth: '1200px',
    margin: '0 auto',
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '50vh'
  },
  header: {
    marginBottom: '4px', // Minimal margin
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  title: {
    margin: 0,
    fontSize: '16px', // Much smaller
    fontWeight: '700',
    color: '#1a1a2e'
  },
  subtitle: {
    margin: 0,
    fontSize: '11px',
    color: '#6b7280',
    marginLeft: '8px'
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
    padding: '8px 12px', // Ultra-low padding
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto' // Allow internal scroll only if necessary
  },
  section: {
    marginBottom: '8px', // Very tight
    paddingBottom: '4px',
    borderBottom: '1px solid #f3f4f6'
  },
  sectionTitle: {
    fontSize: '13px', // Smaller
    fontWeight: '600',
    color: '#374151',
    marginBottom: '6px',
    marginTop: 0
  },
  label: {
    fontSize: '13px', // Tiny but readable
    fontWeight: '500',
    color: '#374151',
    marginBottom: '1px',
    display: 'block'
  },
  input: {
    padding: '3px 8px', // Minimal padding
    height: '28px', // Fixed small height
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '12px',
    width: '100%',
    backgroundColor: '#fff',
    transition: 'border-color 0.2s'
  },
  textarea: {
    padding: '4px 8px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '12px',
    width: '100%',
    resize: 'none', // Disable resize to keep layout fixed
    minHeight: '30px', // Very small
    height: '30px',
    fontFamily: 'inherit',
    backgroundColor: '#fff'
  },
  workItemsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  workItemRow: {
    display: 'flex',
    gap: '4px',
    alignItems: 'flex-end',
    marginBottom: '2px'
  },
  workItemSelect: {
    flex: 2
  },
  workItemInput: {
    flex: 1
  },
  removeBtn: {
    padding: '0 8px',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  addItemBtn: {
    padding: '2px 10px',
    backgroundColor: '#f9fafb',
    color: '#4b5563',
    border: '1px dashed #d1d5db',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '500',
    cursor: 'pointer',
    marginTop: '0'
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    marginTop: 'auto', // Push to bottom
    paddingTop: '8px'
  },
  cancelBtn: {
    padding: '4px 16px',
    backgroundColor: '#fff',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer'
  },
  submitBtn: {
    padding: '4px 16px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer'
  }
};

export default AddWork;