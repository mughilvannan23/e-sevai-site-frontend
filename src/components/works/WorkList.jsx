import React from 'react';
import { workStyles as styles } from './workStyles';
import WorkItem from './WorkItem';

const WorkList = ({
  works,
  loading,
  onEdit,
  onDelete,
  onPrint,
  onView,
  formatDateTime,
  getStatusBadge,
  editingItemId,
  renderEditForm,
  isAdmin,
  isEmployee,
  tableRef
}) => {
  if (loading && works.length === 0) {
    return null; // Parent handles initial loading
  }

  return (
    <div ref={tableRef} style={{ ...styles.tableCard, overflowX: 'hidden', borderRadius: '10px', border: '1px solid #e0e0e0' }}>
      <div className="table-responsive">
        <table className="table table-hover mb-0" style={{ minWidth: '800px' }}>
          <thead>
            <tr>
              <th style={{ ...styles.th, color: '#3b8132', fontWeight: '700' }}>Date</th>
              {isAdmin && <th style={{ ...styles.th, color: '#3b8132', fontWeight: '700' }}>Employee</th>}
              <th style={{ ...styles.th, color: '#3b8132', fontWeight: '700' }}>Customer</th>
              <th style={{ ...styles.th, color: '#3b8132', fontWeight: '700' }}>Work/Service</th>
              <th style={{ ...styles.th, color: '#3b8132', fontWeight: '700' }}>Amount</th>
              <th style={{ ...styles.th, color: '#3b8132', fontWeight: '700' }}>Payment Status</th>
              <th style={{ ...styles.th, color: '#3b8132', fontWeight: '700' }}>Work Status</th>
              <th style={{ ...styles.th, color: '#3b8132', fontWeight: '700' }}>Created Time</th>
              <th style={{ ...styles.th, color: '#3b8132', fontWeight: '700' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {works.map(work => (
              <React.Fragment key={work._id}>
                <WorkItem
                  work={work}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onPrint={onPrint}
                  onView={onView}
                  formatDateTime={formatDateTime}
                  getStatusBadge={getStatusBadge}
                  isAdmin={isAdmin}
                  isEmployee={isEmployee}
                  isEditing={editingItemId === work._id}
                />
                {editingItemId === work._id && (
                  <tr>
                    <td colSpan={isAdmin ? 9 : 8} style={{ padding: '24px', backgroundColor: 'rgba(59, 129, 50, 0.03)' }}>
                      {renderEditForm(work)}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {works.length === 0 && (
        <div style={styles.noData}>
          No works found.
        </div>
      )}
    </div>
  );
};

export default WorkList;
