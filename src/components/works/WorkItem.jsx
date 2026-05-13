import React from 'react';
import { workStyles as styles } from './workStyles';

const WorkItem = ({
  work,
  onEdit,
  onDelete,
  onPrint,
  formatDateTime,
  getStatusBadge,
  isAdmin,
  isEmployee,
  isEditing
}) => {
  return (
    <tr style={isEditing ? { backgroundColor: 'rgba(59, 129, 50, 0.08)' } : {}}>
      {isAdmin && (
        <td style={styles.td}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="fw-bold">{work.employee?.name || 'N/A'}</span>
            <span className="text-muted small">{work.employee?.mobile || ''}</span>
          </div>
        </td>
      )}
      <td style={{ ...styles.td, whiteSpace: 'nowrap' }}>
        {formatDateTime(work.date)}
      </td>
      <td style={{ ...styles.td, maxWidth: '150px' }}>
        <div className="text-truncate fw-bold">{work.customerName}</div>
        <div className="text-muted small">{work.customerPhone || '-'}</div>
      </td>
      <td style={styles.td}>
        {work.paymentMethod || 'Cash'}
      </td>
      <td style={styles.td}>
        ₹{(work.gpayAmount || 0).toLocaleString()}
      </td>
      <td style={styles.td}>
        ₹{(work.cashAmount || 0).toLocaleString()}
      </td>
      <td style={styles.td}>
        <div className="fw-bold">₹{(work.totalAmount || work.amount || 0).toLocaleString()}</div>
        {work.totalDiscount > 0 && (
          <div className="text-danger small" style={{ fontSize: '0.75rem' }}>
            Disc: -₹{work.totalDiscount.toLocaleString()}
          </div>
        )}
      </td>
      <td style={styles.td}>
        <span style={{ color: '#0dcaf0', fontWeight: '800' }}>
          ₹{(work.items?.reduce((sum, item) => sum + (item.presetAmount || 0), 0) || 0).toLocaleString()}
        </span>
      </td>
      <td style={{ ...styles.td, maxWidth: '200px', whiteSpace: 'normal' }}>
        <div>
          {work.items && work.items.length > 0
            ? work.items.map(i => {
              const appNum = i.applicationNumber ? ` [#${i.applicationNumber}]` : '';
              return `${i.title}${appNum} (x${i.quantity || 1})`;
            }).join(', ')
            : work.workTitle}
        </div>
      </td>
      <td style={styles.td}>{getStatusBadge(work.paymentStatus, 'payment')}</td>
      <td style={styles.td}>{getStatusBadge(work.workStatus, 'work')}</td>
      <td style={styles.td}>
        <div className="d-flex flex-column flex-md-row gap-1 gap-md-2">
          {/* Employee should NOT have Edit/Delete */}
          {/* Admin should have Edit/Delete */}
          {isAdmin && (
            <>
              <button
                style={styles.editBtn}
                className="btn btn-sm text-white w-100 w-md-auto"
                onClick={() => onEdit(work)}
                disabled={isEditing}
              >
                {isEditing ? 'Editing...' : 'Edit'}
              </button>
              <button
                style={styles.deleteBtn}
                className="btn btn-sm text-white w-100 w-md-auto"
                onClick={() => onDelete(work._id)}
              >
                Delete
              </button>
            </>
          )}

          {/* Employee should NOT have Print? The user said "Keep Print option if needed (optional)" for Employee. */}
          {/* Admin: "Remove Print option for Admin (if present)" */}
          {!isAdmin && onPrint && (
            <button
              style={{ ...styles.editBtn, backgroundColor: '#3b8132', borderRadius: '10px' }}
              className="btn btn-sm text-white w-100 w-md-auto"
              onClick={() => onPrint(work)}
            >
              Print
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default WorkItem;
