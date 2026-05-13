export const workStyles = {
  title: {
    margin: '0 0 2px 0',
    fontWeight: '700',
    color: '#3b8132',
    letterSpacing: '0.4px',
    fontSize: '1.15rem'
  },
  subtitle: {
    color: 'var(--text-muted)',
    fontSize: '12px'
  },

  // Form card
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
    padding: '8px 12px',
    width: '100%',
    margin: '0 auto'
  },
  formHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
    paddingBottom: '4px',
    borderBottom: '1px solid #e0e0e0'
  },
  formTitle: {
    margin: 0,
    fontSize: '15px',
    fontWeight: '700',
    color: '#3b8132'
  },
  formSubtitle: {
    margin: 0,
    fontSize: '11px',
    color: 'var(--text-muted)'
  },
  editingBadge: {
    display: 'inline-block',
    padding: '0px 6px',
    backgroundColor: '#eaf4e9',
    color: '#3b8132',
    borderRadius: '20px',
    fontSize: '9px',
    fontWeight: '600',
    border: '1px solid #3b8132'
  },
  section: {
    marginBottom: '8px',
    paddingBottom: '4px',
    borderBottom: '1px solid #f1f2f4'
  },
  sectionTitle: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#3b8132',
    marginBottom: '4px',
    marginTop: 0,
    textTransform: 'uppercase',
    letterSpacing: '0.3px'
  },
  label: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: '0px',
    display: 'block'
  },
  workItemsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  workItemRow: {
    display: 'flex',
    gap: '6px',
    alignItems: 'flex-start'
  },
  removeBtn: {
    padding: '2px 8px',
    backgroundColor: '#ffffff',
    color: '#e74c3c',
    border: '1px solid #e74c3c',
    borderRadius: '6px',
    fontSize: '11px',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  addItemBtn: {
    padding: '4px 10px',
    backgroundColor: '#ffffff',
    color: '#3b8132',
    border: '1px dashed #3b8132',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
    alignSelf: 'flex-start',
    marginTop: '0px',
    transition: 'all 0.3s ease'
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    marginTop: '8px',
    paddingTop: '6px',
    borderTop: '1px solid #e0e0e0'
  },
  resetBtn: {
    padding: '4px 14px',
    backgroundColor: '#ffffff',
    color: '#3b8132',
    border: '1px solid #3b8132',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  submitBtn: {
    padding: '4px 18px',
    backgroundColor: '#3b8132',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 1px 3px rgba(59, 129, 50, 0.2)'
  },

  // Modal Styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(2px)'
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '500px',
    maxHeight: '80vh',
    overflowY: 'auto',
    boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
    animation: 'modalFadeIn 0.2s ease'
  },
  modalHeader: {
    padding: '8px 12px',
    borderBottom: '1px solid #eee',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: '8px',
    borderTopRightRadius: '8px'
  },
  modalTitle: {
    margin: 0,
    fontSize: '14px',
    fontWeight: '700',
    color: '#3b8132'
  },
  modalBody: {
    padding: '12px'
  },
  modalFooter: {
    padding: '8px 12px',
    borderTop: '1px solid #eee',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px'
  },
  previewSection: {
    marginBottom: '8px'
  },
  previewTitle: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#666',
    textTransform: 'uppercase',
    borderBottom: '1px solid #f0f0f0',
    paddingBottom: '2px',
    marginBottom: '6px'
  },
  previewRow: {
    display: 'flex',
    marginBottom: '2px',
    fontSize: '12px'
  },
  previewLabel: {
    width: '110px',
    color: '#666',
    flexShrink: 0
  },
  previewValue: {
    fontWeight: '600',
    color: '#333'
  },
  itemTable: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '4px',
    fontSize: '11px'
  },
  itemTh: {
    textAlign: 'left',
    padding: '4px 6px',
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #eee',
    color: '#3b8132',
    fontWeight: '700'
  },
  itemTd: {
    padding: '4px 6px',
    borderBottom: '1px solid #f0f0f0'
  },
  confirmBtn: {
    padding: '6px 16px',
    backgroundColor: '#3b8132',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '700',
    fontSize: '12px',
    cursor: 'pointer'
  },
  editModalBtn: {
    padding: '6px 16px',
    backgroundColor: 'white',
    color: '#666',
    border: '1px solid #ccc',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '12px',
    cursor: 'pointer'
  },

  // Filter bar
  filtersCard: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    padding: '12px',
    border: '1px solid #e0e0e0'
  },
  searchBtn: {
    padding: '6px 16px',
    backgroundColor: '#3b8132',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer'
  },
  filterResetBtn: {
    padding: '6px 16px',
    backgroundColor: '#ffffff',
    color: '#3b8132',
    border: '1px solid #3b8132',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer'
  },

  // Table
  tableCard: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    overflow: 'hidden',
    border: '1px solid #e0e0e0'
  },
  th: {
    padding: '8px 12px',
    textAlign: 'left',
    backgroundColor: '#f9fafb',
    fontWeight: '600',
    color: '#3b8132',
    borderBottom: '2px solid #3b8132',
    fontSize: '12px'
  },
  td: {
    padding: '8px 12px',
    borderBottom: '1px solid #e0e0e0',
    fontSize: '12px',
    color: '#2c3e50'
  },
  badge: {
    padding: '2px 8px',
    borderRadius: '20px',
    fontSize: '10px',
    fontWeight: '500'
  },
  editBtn: {
    padding: '4px 12px',
    backgroundColor: '#3b8132',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  deleteBtn: {
    padding: '4px 12px',
    backgroundColor: '#ffffff',
    color: '#e74c3c',
    border: '1px solid #e74c3c',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  noData: {
    padding: '20px',
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '13px'
  },
  viewBtn: {
    padding: '4px 12px',
    backgroundColor: '#ffffff',
    color: '#3b8132',
    border: '1px solid #3b8132',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer'
  }
};


