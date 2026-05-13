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
  shopBalance = 0
}) => {
  return (
    <div ref={formRef} style={styles.formCard} className="mb-3">
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
          <div className="row g-1">
            <div className="col-12 col-md-4">
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
            <div className="col-12 col-md-4">
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
          </div>
        </div>

        {/* Section 2: Customer Details */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Customer Details</h3>
          <div className="row g-1">
            <div className="col-12 col-md-6">
              <label style={styles.label}>Customer Name</label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={onInputChange}
                className="form-control form-control-sm"
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
                className="form-control form-control-sm"
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
              <table className="table table-bordered mb-0 align-middle" style={{ fontSize: '11px' }}>
                <thead className="table-light">
                  <tr>
                    <th className="py-1">Work/Service</th>
                    <th className="py-1" style={{ width: '130px' }}>App. Number</th>
                    <th className="py-1" style={{ width: '90px' }}>Quantity</th>
                    <th className="py-1">Total</th>
                    <th className="py-1"><label style={{...styles.label, marginBottom: 0, fontSize: '10px'}}><b>Other</b> (₹)</label></th>
                    <th className="py-1"><label style={{...styles.label, marginBottom: 0, fontSize: '10px'}}><b>Discount</b> (₹)</label></th>
                    <th className="py-1" style={{ width: '35px' }}></th>
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
                        <td className="p-1">
                          <select
                            value={item.workItemId}
                            onChange={(e) => onItemChange(index, 'workItemId', e.target.value)}
                            className="form-select form-select-sm py-0 px-1"
                            style={{ height: '24px', fontSize: '11px' }}
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
                              className="form-control form-control-sm mt-1 py-0 px-1"
                              style={{ height: '24px', fontSize: '11px' }}
                              placeholder="Custom Title"
                            />
                          )}
                        </td>
                        <td className="p-1">
                          <input
                            type="text"
                            value={item.applicationNumber || ''}
                            onChange={(e) => onItemChange(index, 'applicationNumber', e.target.value)}
                            className="form-control form-control-sm py-0 px-1"
                            style={{ height: '24px', fontSize: '11px' }}
                            placeholder="Optional"
                          />
                        </td>
                        <td className="p-1">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => onItemChange(index, 'quantity', e.target.value)}
                            className="form-control form-control-sm py-0 px-1"
                            style={{ height: '24px', fontSize: '11px' }}
                          />
                        </td>
                        <td className="fw-bold p-1">₹{rowTotal}</td>
                        <td className="p-1">
                          <input
                            type="number"
                            value={item.otherCharges}
                            onChange={(e) => onItemChange(index, 'otherCharges', e.target.value)}
                            className="form-control form-control-sm py-0 px-1"
                            style={{ height: '24px', fontSize: '11px' }}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td className="p-1">
                          <input
                            type="number"
                            value={item.discount}
                            onChange={(e) => onItemChange(index, 'discount', e.target.value)}
                            className="form-control form-control-sm py-0 px-1"
                            style={{ height: '24px', fontSize: '11px' }}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td className="text-center p-1">
                          {formData.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeItemRow(index)}
                              className="btn btn-sm p-0 d-flex align-items-center justify-content-center"
                              style={{ border: '1px solid #e74c3c', color: '#e74c3c', borderRadius: '4px', width: '20px', height: '20px', fontSize: '10px' }}
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
              className="btn btn-sm py-1 px-2"
            >
              + Add Item
            </button>
          </div>

          <div className="row g-1 mt-0">
            <div className="col-12 text-end d-flex flex-column align-items-end gap-0">
              {formData.totalDiscount > 0 && (
                <span style={{ fontSize: '0.75rem', color: '#e74c3c', fontWeight: '600' }}>
                  Total Discount: -₹{(parseFloat(formData.totalDiscount) || 0).toFixed(2)}
                </span>
              )}
              <strong style={{ fontSize: '1rem', color: '#3b8132', fontWeight: '800' }}>
                Final Amount: ₹{(parseFloat(formData.amount) || 0).toFixed(2)}
              </strong>
              {formData.items.some(item => {
              const wi = item.workItemId ? workItems.find(w => w._id === item.workItemId) : null;
              const name = (wi ? wi.name : item.workTitle) || '';
              const rechargeKeywords = ['recharge', 'eb bill', 'electric charge', 'electricity', 'money transfer', 'transfer'];
              return rechargeKeywords.some(key => name.toLowerCase().includes(key.toLowerCase()));
            }) && (
              <div className="col-12 col-lg-8 mt-1 text-start align-self-end">
                <label style={{ ...styles.label, color: '#000', fontWeight: 'bold', fontSize: '10px' }}>Enter Transfer/Recharge Amount (₹)</label>
                <input
                  type="number"
                  name="applicationFee"
                  value={formData.applicationFee || ''}
                  onChange={onInputChange}
                  className="form-control form-control-sm py-0 px-1"
                  style={{ border: '1px solid #000', height: '24px', fontSize: '11px' }}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
                
                {/* Specific info for Handcash to Gpay Transfer */}
                {formData.items.some(item => {
                  const wi = item.workItemId ? workItems.find(w => w._id === item.workItemId) : null;
                  const name = (wi ? wi.name : item.workTitle) || '';
                  return name.toLowerCase().includes('handcash to gpay transfer');
                }) && (
                  <div className={`mt-1 p-1 rounded d-flex justify-content-between align-items-center ${parseFloat(formData.applicationFee) > shopBalance ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'}`} style={{ fontSize: '0.7rem', border: '1px solid currentColor', lineHeight: '1' }}>
                    <span><strong>Shop Bal:</strong> ₹{shopBalance.toLocaleString()}</span>
                    {parseFloat(formData.applicationFee) > shopBalance && (
                      <span className="fw-bold">⚠️ Insufficient</span>
                    )}
                  </div>
                )}
              </div>
            )}
            </div>
          </div>
        </div>

        {/* Section 4: Status & Notes */}
        <div style={{ ...styles.section, borderBottom: 'none', marginBottom: 0, paddingBottom: 0 }}>
          <h3 style={styles.sectionTitle}>Status & Notes</h3>
          <div className="row g-1">
            
            <div className="col-12 col-md-6">
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
              <>
                <div className="col-12 col-md-6">
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

                {formData.paymentMethod === 'Both' && (
                  <>
                    <div className="col-12 col-md-6">
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
                    <div className="col-12 col-md-6">
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
              </>
            )}

            <div className="col-12 col-md-6">
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
            <div className="col-12">
              <label style={styles.label}>Notes (Optional)</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={onInputChange}
                className="form-control form-control-sm"
                placeholder="Add any additional notes..."
                rows="1"
                style={{ resize: 'vertical', fontFamily: 'inherit', borderRadius: '6px', minHeight: '30px' }}
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
