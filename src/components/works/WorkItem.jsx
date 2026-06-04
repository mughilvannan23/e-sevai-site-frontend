import React from 'react';
import { workStyles as styles } from './workStyles';

const WorkItem = ({
  work,
  onEdit,
  onDelete,
  onPrint,
  onView,
  onSendWhatsApp,
  formatDateTime,
  getStatusBadge,
  isAdmin,
  isEmployee,
  isEditing
}) => {
  return (
    <tr style={isEditing ? { backgroundColor: 'rgba(59, 129, 50, 0.08)', transition: 'all 0.2s ease' } : { transition: 'all 0.2s ease' }}>
      <td style={{ ...styles.td, whiteSpace: 'nowrap' }}>
        {new Date(work.date).toLocaleDateString('en-IN')}
      </td>
      {isAdmin && (
        <td style={styles.td}>
          <div className="fw-bold" style={{ color: '#2c3e50' }}>{work.employee?.name || 'N/A'}</div>
          <div className="text-muted small">{work.employee?.employeeId || ''}</div>
        </td>
      )}
      <td style={styles.td}>
        <div className="fw-bold">{work.customerName}</div>
        <div className="text-muted small">{work.customerPhone || '-'}</div>
      </td>
      <td style={{ ...styles.td, maxWidth: '250px' }}>
        <div className="text-truncate">
          {work.items && work.items.length > 0
            ? work.items.map(i => {
              const appNum = i.applicationNumber ? ` [#${i.applicationNumber}]` : '';
              const aepsInfo = i.presetChargeType === 'AEPS' ? ` [AEPS: ₹${i.presetAmount || 0}]` : '';
              return `${i.title}${appNum}${aepsInfo} (x${i.quantity || 1})`;
            }).join(', ')
            : work.workTitle}
        </div>
      </td>
      <td style={{ ...styles.td, fontWeight: '700', color: '#2c3e50' }}>
        ₹{(work.totalAmount || work.amount || 0).toLocaleString()}
      </td>
      <td style={styles.td}>{getStatusBadge(work.paymentStatus, 'payment')}</td>
      <td style={styles.td}>{getStatusBadge(work.workStatus, 'work')}</td>
      <td style={styles.td}>
        {work.createdAt ? new Date(work.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '-'}
      </td>
      <td style={styles.td}>
        <div className="d-flex flex-column flex-md-row gap-1 gap-md-2">
          {/* Employee should NOT have Edit/Delete */}
          {/* Admin should have Edit/Delete */}
          {isAdmin && (
            <>
              {onView && (
                <button
                  className="btn btn-sm"
                  style={{ backgroundColor: '#3b8132', color: 'white', borderRadius: '8px', padding: '5px 15px', fontWeight: '600' }}
                  onClick={() => onView(work)}
                >
                  View
                </button>
              )}
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
          {!isAdmin && onSendWhatsApp && (
            <button
              style={{ ...styles.editBtn, backgroundColor: '#25D366', borderRadius: '10px' }}
              className="btn btn-sm text-white w-100 w-md-auto d-flex align-items-center justify-content-center gap-1"
              onClick={() => onSendWhatsApp(work._id)}
            >
              📱 Send WhatsApp
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default WorkItem;
