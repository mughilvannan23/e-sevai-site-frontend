export const workStyles = {
  title: {
    margin: '0 0 4px 0',
    fontWeight: 'bold',
    color: 'var(--text-color)'
  },
  subtitle: {
    color: 'var(--text-muted)',
    fontSize: '15px'
  },

  // Form card
  formCard: {
    backgroundColor: 'var(--card-bg)',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
    boxShadow: 'var(--shadow)',
    padding: '28px 32px'
  },
  formHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '1px solid var(--border-color)'
  },
  formTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '700',
    color: 'var(--text-color)'
  },
  formSubtitle: {
    margin: '4px 0 0 0',
    fontSize: '14px',
    color: 'var(--text-muted)'
  },
  editingBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    backgroundColor: '#fff3cd',
    color: '#856404',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    border: '1px solid #ffc107'
  },
  section: {
    marginBottom: '28px',
    paddingBottom: '24px',
    borderBottom: '1px solid #f3f4f6'
  },
  sectionTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '16px',
    marginTop: 0
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '6px',
    display: 'block'
  },
  workItemsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  workItemRow: {
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start'
  },
  removeBtn: {
    padding: '8px 14px',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer'
  },
  addItemBtn: {
    padding: '10px 18px',
    backgroundColor: '#f9fafb',
    color: '#4b5563',
    border: '1px dashed #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    alignSelf: 'flex-start',
    marginTop: '4px'
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '28px',
    paddingTop: '20px',
    borderTop: '1px solid var(--border-color)'
  },
  resetBtn: {
    padding: '10px 24px',
    backgroundColor: '#fff',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer'
  },
  submitBtn: {
    padding: '10px 28px',
    backgroundColor: 'var(--primary-color)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },

  // Filter bar
  filtersCard: {
    backgroundColor: 'var(--card-bg)',
    borderRadius: '12px',
    boxShadow: 'var(--shadow)'
  },
  searchBtn: {
    padding: '10px 24px',
    backgroundColor: 'var(--primary-color)',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  filterResetBtn: {
    padding: '10px 24px',
    backgroundColor: '#6c757d',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },

  // Table
  tableCard: {
    backgroundColor: 'var(--card-bg)',
    borderRadius: '12px',
    boxShadow: 'var(--shadow)',
    overflow: 'hidden'
  },
  th: {
    padding: '16px',
    textAlign: 'left',
    backgroundColor: '#f8f9fa',
    fontWeight: '600',
    color: 'var(--text-color)',
    borderBottom: '2px solid var(--border-color)',
    fontSize: '14px'
  },
  td: {
    padding: '16px',
    borderBottom: '1px solid var(--border-color)',
    fontSize: '14px'
  },
  badge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500'
  },
  editBtn: {
    padding: '6px 16px',
    backgroundColor: 'var(--primary-color)',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer'
  },
  deleteBtn: {
    padding: '6px 16px',
    backgroundColor: 'var(--danger-color)',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer'
  },
  noData: {
    padding: '40px',
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '15px'
  }
};
