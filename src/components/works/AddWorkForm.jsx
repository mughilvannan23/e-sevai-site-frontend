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
  formRef = null,
  shopBalance = 0,
  gpayBalance = 0
}) => {
  return (
    <div ref={formRef} style={styles.formCard} className="mb-3">
      {/* Form header */}
      <div style={styles.formHeader} className="mb-2 p-2">
        <h2 style={styles.formTitle} className="fs-5 m-0">
          {isEditing ? ' Edit Work' : 'Add New Entry'}
        </h2>
        {isEditing && (
          <span style={styles.editingBadge}>Editing</span>
        )}
      </div>

      <form onSubmit={onSubmit}>
        {/* Section 1: Entry Details */}
        <div style={styles.section}>
          <div className="row g-1">
            <div className="col-6 col-md-3">
              <label style={styles.label}>Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={onInputChange}
                className="form-control form-control-sm"
                required
              />
            </div>
            <div className="col-6 col-md-3">
              <label style={styles.label}>Time</label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={onInputChange}
                className="form-control form-control-sm"
                required
              />
            </div>
            <div className="col-12 col-md-3">
              <label style={styles.label}>Customer Name</label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={onInputChange}
                className="form-control form-control-sm"
                placeholder="Name"
                required
              />
            </div>
            <div className="col-12 col-md-3">
              <label style={styles.label}>Customer Phone</label>
              <input
                type="text"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={onInputChange}
                className="form-control form-control-sm"
                placeholder="Phone"
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
                    <th style={{ width: '130px' }}>App. Number</th>
                    <th style={{ width: '80px' }}>Qty</th>
                    <th>Total</th>
                    <th><label style={styles.label}><b>Other Charges</b> (₹)</label></th>
                    <th><label style={styles.label}><b>Preset Amt</b> (₹)</label></th>
                    <th><label style={styles.label}><b>Discount</b> (₹)</label></th>
                    <th style={{ width: '40px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item, index) => {
                    const wi = item.workItemId ? workItems.find(w => w._id === item.workItemId) : null;
                    const wc = wi ? wi.workCharge : 0;
                    const sc = wi ? wi.serviceCharge : 0;
                    const qty = parseInt(item.quantity) || 1;
                    const otherC = parseFloat(item.otherCharges) || 0;
                    const presetC = parseFloat(item.presetAmount) || 0;
                    const rowTotal = (wc + sc) * qty + otherC + presetC;

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
                        <td>
                          {wi && wi.chargeType && wi.chargeType !== 'None' ? (
                            <div className="d-flex flex-column gap-1">
                              <span className="badge bg-info-subtle text-info text-uppercase" style={{ fontSize: '0.65rem' }}>{wi.chargeType}</span>
                              <input
                                type="number"
                                value={item.presetAmount || ''}
                                onChange={(e) => onItemChange(index, 'presetAmount', e.target.value)}
                                className="form-control form-control-sm"
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                style={{ border: '1px solid #0dcaf0' }}
                              />
                            </div>
                          ) : (
                            <span className="text-muted small">N/A</span>
                          )}
                        </td>
                        <td>
                          <input
                            type="number"
                            value={item.discount}
                            onChange={(e) => onItemChange(index, 'discount', e.target.value)}
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
                              className="btn btn-sm"
                              style={{ border: '1px solid #e74c3c', color: '#e74c3c', borderRadius: '10px' }}
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

          <div className="row g-2 mt-1">
            <div className="col-12 col-md-4 mt-3"></div>
            <div className="col-12 col-md-12 mt-3 text-end d-flex flex-column align-items-end gap-1">
              {formData.totalDiscount > 0 && (
                <span style={{ fontSize: '1rem', color: '#e74c3c', fontWeight: '500' }}>
                  Total Discount: -₹{(parseFloat(formData.totalDiscount) || 0).toFixed(2)}
                </span>
              )}
              <strong style={{ fontSize: '1.25rem', color: '#3b8132', fontWeight: '800' }}>
                Final Amount: ₹{(parseFloat(formData.amount) || 0).toFixed(2)}
              </strong>
              
              {formData.items.some(item => (item.presetChargeType === 'Hand Cash' || item.presetChargeType === 'GPay' || item.presetChargeType === 'Recharge')) && (
                <div className="mt-2 p-2 rounded bg-light d-flex justify-content-between" style={{ fontSize: '0.85rem', border: '1px solid #ddd' }}>
                   <div><strong>Cash Balance:</strong> ₹{(shopBalance || 0).toLocaleString()}</div>
                   <div className="ms-3" style={{ color: '#0dcaf0' }}><strong>GPay Balance:</strong> ₹{(gpayBalance || 0).toLocaleString()}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Status & Notes */}
        <div style={{ ...styles.section, borderBottom: 'none', marginBottom: 0, paddingBottom: 0 }}>
          <h3 style={styles.sectionTitle}>Status & Notes</h3>
          <div className="row g-1">
            <div className="col-12 col-md-3">
              <label style={styles.label}>Payment Status</label>
              <select
                name="paymentStatus"
                value={formData.paymentStatus}
                onChange={onInputChange}
                className="form-select form-select-sm"
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            {formData.paymentStatus === 'Paid' && (
              <div className="col-12 col-md-3">
                <label style={styles.label}>Payment Method</label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={onInputChange}
                  className="form-select form-select-sm"
                  required
                >
                  <option value="">Select Method...</option>
                  <option value="Cash">Cash</option>
                  <option value="GPay">GPay</option>
                  <option value="Both">Both (Split Payment)</option>
                </select>
              </div>
            )}

            <div className="col-12 col-md-3">
              <label style={styles.label}>Work Status</label>
              <select
                name="workStatus"
                value={formData.workStatus}
                onChange={onInputChange}
                className="form-select form-select-sm"
              >
                <option value="In Progress">Pending</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {formData.paymentStatus === 'Paid' && formData.paymentMethod === 'Both' && (
              <>
                <div className="col-6 col-md-3">
                  <label style={styles.label}>GPay Amount (₹)</label>
                  <input
                    type="number"
                    name="gpayAmount"
                    value={formData.gpayAmount || ''}
                    onChange={onInputChange}
                    className="form-control form-control-sm"
                    placeholder="0.00"
                    min="0"
                    max={formData.amount}
                    step="0.01"
                    required
                  />
                </div>
                <div className="col-6 col-md-3">
                  <label style={styles.label}>Cash Amount (₹)</label>
                  <input
                    type="number"
                    name="cashAmount"
                    value={formData.cashAmount || ''}
                    onChange={onInputChange}
                    className="form-control form-control-sm"
                    placeholder="0.00"
                    min="0"
                    max={formData.amount}
                    step="0.01"
                    required
                  />
                </div>
              </>
            )}

            <div className="col-12">
              <label style={styles.label}>Notes (Optional)</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={onInputChange}
                className="form-control form-control-sm"
                placeholder="Notes..."
                rows="1"
                style={{ resize: 'vertical', fontFamily: 'inherit', borderRadius: '8px' }}
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
