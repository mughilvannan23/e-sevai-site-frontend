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
    paymentMethod: 'Hand Cash',
    items: [{ workItemId: '', workTitle: '' }],
    amount: '',
    paymentStatus: 'Pending',
    workStatus: 'In Progress',
    notes: ''
  });

  const { success, error } = useToast();

  useEffect(() => {
    fetchWorkItems();

    // If editing, populate form data
    if (editingWork) {
      setFormData({
        date: new Date(editingWork.date).toISOString().split('T')[0],
        time: editingWork.time || getCurrentTime(),
        customerName: editingWork.customerName,
        customerPhone: editingWork.customerPhone || '',
        paymentMethod: editingWork.paymentMethod || 'Hand Cash',
        items: editingWork.items && editingWork.items.length > 0
          ? editingWork.items.map(i => ({ workItemId: i.workItemId || '', workTitle: i.title || '' }))
          : [{ workItemId: '', workTitle: '' }],
        amount: editingWork.amount.toString(),
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

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData(prev => ({
      ...prev,
      items: newItems
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
        return sum + (i ? (i.workCharge + i.serviceCharge) : 0);
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
      setSubmitting(true);

      if (editingWork) {
        const response = await workAPI.updateWork(editingWork._id, formData);
        if (response.data.success) {
          success('Work updated successfully');
          navigate('/employee-works');
        }
      } else {
        const response = await workAPI.createWork(formData);
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
            {/* Section 1: Basic Info */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Basic Info</h2>
              <div className="row g-4">
                <div className="col-12 col-md-6">
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
                <div className="col-12 col-md-6">
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
                <div className="col-12 col-md-6">
                  <label style={styles.label}>Amount (₹)</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="form-control"
                    style={styles.input}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Customer Details */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Customer Details</h2>
              <div className="row g-4">
                <div className="col-12 col-md-6">
                  <label style={styles.label}>Customer Name</label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    className="form-control"
                    style={styles.input}
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
                    style={styles.input}
                    placeholder="Enter customer phone number"
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label style={styles.label}>Payment Method</label>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                    className="form-select"
                    style={styles.input}
                  >
                    <option value="Hand Cash">Hand Cash</option>
                    <option value="GPay">GPay</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Work Items */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Work Items</h2>
              <div style={styles.workItemsContainer}>
                {formData.items.map((item, index) => (
                  <div key={index} style={styles.workItemRow}>
                    <div style={styles.workItemSelect}>
                      <select
                        value={item.workItemId}
                        onChange={(e) => handleItemChange(index, 'workItemId', e.target.value)}
                        className="form-select"
                        style={styles.input}
                        required={!item.workTitle && !item.workItemId}
                      >
                        <option value="">Select a Work Item...</option>
                        {workItems.map(wi => (
                          <option key={wi._id} value={wi._id}>{wi.name}</option>
                        ))}
                      </select>
                    </div>
                    {!item.workItemId && (
                      <div style={styles.workItemInput}>
                        <input
                          type="text"
                          value={item.workTitle}
                          onChange={(e) => handleItemChange(index, 'workTitle', e.target.value)}
                          className="form-control"
                          style={styles.input}
                          placeholder="Custom Title"
                        />
                      </div>
                    )}
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        style={styles.removeBtn}
                        onClick={() => removeItemRow(index)}
                        className="btn"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  style={styles.addItemBtn}
                  onClick={addItemRow}
                  className="btn"
                >
                  + Add Another Work
                </button>
              </div>
            </div>

            {/* Section 4: Status & Notes */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Status & Notes</h2>
              <div className="row g-4">
                <div className="col-12 col-md-6">
                  <label style={styles.label}>Payment Status</label>
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
                <div className="col-12 col-md-6">
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
                <div className="col-12">
                  <label style={styles.label}>Notes (Optional)</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="form-control"
                    style={styles.textarea}
                    placeholder="Add any additional notes..."
                    rows="4"
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
                {submitting ? 'Saving...' : (editingWork ? 'Update Work' : 'Create Work')}
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
    minHeight: '100vh',
    backgroundColor: '#f5f6fa',
    padding: '24px 32px'
  },
  pageWrapper: {
    maxWidth: '1200px',
    margin: '0 auto'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '50vh'
  },
  header: {
    marginBottom: '32px'
  },
  title: {
    margin: 0,
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a1a2e'
  },
  subtitle: {
    margin: '8px 0 0 0',
    fontSize: '15px',
    color: '#6b7280'
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    padding: '32px 40px'
  },
  section: {
    marginBottom: '36px',
    paddingBottom: '28px',
    borderBottom: '1px solid #f3f4f6'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '20px',
    marginTop: 0
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '8px',
    display: 'block'
  },
  input: {
    padding: '12px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    width: '100%',
    backgroundColor: '#fff',
    transition: 'border-color 0.2s, box-shadow 0.2s'
  },
  textarea: {
    padding: '12px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    width: '100%',
    resize: 'vertical',
    minHeight: '100px',
    fontFamily: 'inherit',
    backgroundColor: '#fff',
    transition: 'border-color 0.2s, box-shadow 0.2s'
  },
  workItemsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  workItemRow: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start'
  },
  workItemSelect: {
    flex: 1
  },
  workItemInput: {
    flex: 1
  },
  removeBtn: {
    padding: '12px 16px',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    marginTop: '0'
  },
  addItemBtn: {
    padding: '12px 20px',
    backgroundColor: '#f9fafb',
    color: '#4b5563',
    border: '1px dashed #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    alignSelf: 'flex-start',
    marginTop: '8px'
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '8px',
    paddingTop: '24px'
  },
  cancelBtn: {
    padding: '12px 28px',
    backgroundColor: '#fff',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer'
  },
  submitBtn: {
    padding: '12px 28px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer'
  }
};

export default AddWork;