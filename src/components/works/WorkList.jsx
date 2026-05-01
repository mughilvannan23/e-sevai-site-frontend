import React from 'react';
import { workStyles as styles } from './workStyles';
import WorkItem from './WorkItem';

const WorkList = ({
  works,
  loading,
  onEdit,
  onDelete,
  onPrint,
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
    <div ref={tableRef} style={{ ...styles.tableCard, overflowX: 'hidden' }}>
      <div className="table-responsive">
        <table className="table table-hover mb-0" style={{ minWidth: '700px' }}>
          <thead>
            <tr>
              {isAdmin && <th style={styles.th}>Employee</th>}
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
            {works.map(work => (
              <React.Fragment key={work._id}>
                <WorkItem
                  work={work}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onPrint={onPrint}
                  formatDateTime={formatDateTime}
                  getStatusBadge={getStatusBadge}
                  isAdmin={isAdmin}
                  isEmployee={isEmployee}
                  isEditing={editingItemId === work._id}
                />
                {editingItemId === work._id && (
                  <tr>
                    <td colSpan={isAdmin ? 9 : 8} style={{ padding: '20px', backgroundColor: '#f8f9fa' }}>
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
