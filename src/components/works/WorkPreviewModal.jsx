import React from 'react';
import { workStyles as styles } from './workStyles';

const WorkPreviewModal = ({ isOpen, onClose, onConfirm, formData, workItems }) => {
  if (!isOpen) return null;

  const getWorkItemName = (itemId, customTitle) => {
    if (itemId) {
      const item = workItems.find(w => w._id === itemId);
      return item ? item.name : 'Unknown Service';
    }
    return customTitle || 'Custom Service';
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContainer} onClick={e => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>Confirm Submission</h2>
          <button
            onClick={onClose}
            style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer', color: '#666' }}
          >
            ✕
          </button>
        </div>

        <div style={styles.modalBody}>
          <div style={styles.previewSection}>
            <h3 style={styles.previewTitle}>Customer Information</h3>
            <div style={styles.previewRow}>
              <span style={styles.previewLabel}>Name:</span>
              <span style={styles.previewValue}>{formData.customerName}</span>
            </div>
            {formData.customerPhone && (
              <div style={styles.previewRow}>
                <span style={styles.previewLabel}>Phone:</span>
                <span style={styles.previewValue}>{formData.customerPhone}</span>
              </div>
            )}
            <div style={styles.previewRow}>
              <span style={styles.previewLabel}>Date & Time:</span>
              <span style={styles.previewValue}>{formData.date} at {formData.time}</span>
            </div>
          </div>

          <div style={styles.previewSection}>
            <h3 style={styles.previewTitle}>Work Items</h3>
            <table style={styles.itemTable}>
              <thead>
                <tr>
                  <th style={styles.itemTh}>Service</th>
                  <th style={styles.itemTh}>App No.</th>
                  <th style={styles.itemTh}>Qty</th>
                  <th style={styles.itemTh}>Total</th>
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
                      <td style={styles.itemTd}>
                        <div>{getWorkItemName(item.workItemId, item.workTitle)}</div>
                        {(otherC > 0 || presetC > 0) && (
                          <div style={{ fontSize: '11px', color: '#666' }}>
                            {otherC > 0 && <span>Other: ₹{otherC} </span>}
                            {presetC > 0 && <span>{wi?.chargeType || 'Preset'}: ₹{presetC}</span>}
                          </div>
                        )}
                      </td>
                      <td style={styles.itemTd}>{item.applicationNumber || '-'}</td>
                      <td style={styles.itemTd}>{item.quantity}</td>
                      <td style={styles.itemTd}>₹{rowTotal}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={styles.previewSection}>
            <h3 style={styles.previewTitle}>Payment Summary</h3>
            <div style={styles.previewRow}>
              <span style={styles.previewLabel}>Payment Status:</span>
              <span style={{ ...styles.previewValue, color: formData.paymentStatus === 'Paid' ? '#3b8132' : '#e74c3c' }}>
                {formData.paymentStatus}
              </span>
            </div>
            {formData.paymentStatus === 'Paid' && (
              <>
                <div style={styles.previewRow}>
                  <span style={styles.previewLabel}>Payment Method:</span>
                  <span style={styles.previewValue}>{formData.paymentMethod}</span>
                </div>
                {formData.paymentMethod === 'Both' && (
                  <>
                    <div style={styles.previewRow}>
                      <span style={styles.previewLabel}>GPay:</span>
                      <span style={styles.previewValue}>₹{formData.gpayAmount}</span>
                    </div>
                    <div style={styles.previewRow}>
                      <span style={styles.previewLabel}>Cash:</span>
                      <span style={styles.previewValue}>₹{formData.cashAmount}</span>
                    </div>
                  </>
                )}
              </>
            )}
            {formData.totalDiscount > 0 && (
              <div style={styles.previewRow}>
                <span style={styles.previewLabel}>Discount:</span>
                <span style={{ ...styles.previewValue, color: '#e74c3c' }}>-₹{formData.totalDiscount}</span>
              </div>
            )}
            <div style={{ ...styles.previewRow, marginTop: '10px', fontSize: '18px' }}>
              <span style={{ ...styles.previewLabel, fontWeight: 'bold' }}>Final Amount:</span>
              <span style={{ ...styles.previewValue, color: '#3b8132', fontSize: '20px' }}>₹{formData.amount}</span>
            </div>
          </div>

          {formData.notes && (
            <div style={styles.previewSection}>
              <h3 style={styles.previewTitle}>Notes</h3>
              <p style={{ fontSize: '14px', color: '#555', margin: 0 }}>{formData.notes}</p>
            </div>
          )}
        </div>

        <div style={styles.modalFooter}>
          <button style={styles.editModalBtn} onClick={onClose}>
            Edit Form
          </button>
          <button style={styles.confirmBtn} onClick={onConfirm}>
            Confirm & Submit
          </button>
        </div>
      </div>
      <style>
        {`
          @keyframes modalFadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
};

export default WorkPreviewModal;
// @keyframes modalFadeIn {
//             from { opacity: 0; transform: translateY(-20px); }
//             to { opacity: 1; transform: translateY(0); }
// }
// `}
//       </style>
//     </div>
//   );
// };

// export default WorkPreviewModal;
