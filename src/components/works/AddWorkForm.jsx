import React from 'react';
import { workStyles as styles } from './workStyles';

const AddWorkForm = ({
  formData,
  onSubmit,
  onReset,
  onInputChange,
  onItemChange,
  addItemRow,
  removeItemRow,
  submitting,
  workItems,
  isEditing = false,
  formRef = null
}) => {
  return (
    <div ref={formRef} style={styles.formCard} className="mb-4">
      {/* Form header */}
      <div style={styles.formHeader}>
        <div>
          <h2 style={styles.formTitle}>
            {isEditing ? ' Edit Work' : 'Add New Entry'}
          </h2>
          <p style={styles.formSubtitle}>
            {isEditing
              ? 'Update the work details below, then click Update Work'
              : 'Fill in the details to create a new work entry'}
          </p>
        </div>
        {isEditing && (
          <span style={styles.editingBadge}>Editing</span>
        )}
      </div>

      <form onSubmit={onSubmit}>
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
                onChange={onInputChange}
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
                onChange={onInputChange}
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
                onChange={onInputChange}
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
                onChange={onInputChange}
                className="form-control"
                placeholder="Enter customer phone number"
              />
            </div>
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
                    <th style={{ width: '150px' }}>App. Number</th>
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
                            onChange={(e) => onItemChange(index, 'workItemId', e.target.value)}
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
                              onChange={(e) => onItemChange(index, 'workTitle', e.target.value)}
                              className="form-control form-control-sm mt-1"
                              placeholder="Custom Title"
                            />
                          )}
                        </td>
                        <td>
                          <input
                            type="text"
                            value={item.applicationNumber || ''}
                            onChange={(e) => onItemChange(index, 'applicationNumber', e.target.value)}
                            className="form-control form-control-sm"
                            placeholder="Optional"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => onItemChange(index, 'quantity', e.target.value)}
                            className="form-control form-control-sm"
                          />
                        </td>
                        <td className="fw-bold">₹{rowTotal}</td>
                        <td>
                          <input
                            type="number"
                            value={item.otherCharges}
                            onChange={(e) => onItemChange(index, 'otherCharges', e.target.value)}
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
            <div className="col-12 col-md-4 mt-3"></div>
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
                onChange={onInputChange}
                className="form-select"
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            {formData.paymentStatus === 'Paid' && (
              <div className="col-12 col-md-6">
                <label style={styles.label}>Payment Method</label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={onInputChange}
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
                onChange={onInputChange}
                className="form-select"
              >
                <option value="In Progress">Pending</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div className="col-12">
              <label style={styles.label}>Notes (Optional)</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={onInputChange}
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
            onClick={onReset}
          >
            {isEditing ? 'Cancel' : 'Clear Form'}
          </button>
          <button
            type="submit"
            style={styles.submitBtn}
            className="btn"
            disabled={submitting}
          >
            {submitting
              ? 'Saving...'
              : isEditing ? 'Update Work' : 'Submit Work'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddWorkForm;
