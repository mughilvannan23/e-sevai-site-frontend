export const workStyles = {
  title: {
    margin: '0 0 4px 0',
    fontWeight: '700',
    color: '#3b8132',
    letterSpacing: '0.5px'
  },
  subtitle: {
    color: 'var(--text-muted)',
    fontSize: '15px'
  },

  // Form card
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    border: '1px solid #e0e0e0',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    padding: '16px 20px'
  },
  formHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
    paddingBottom: '8px',
    borderBottom: '1px solid #e0e0e0'
  },
  formTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '700',
    color: '#3b8132'
  },
  formSubtitle: {
    margin: '2px 0 0 0',
    fontSize: '13px',
    color: 'var(--text-muted)'
  },
  editingBadge: {
    display: 'inline-block',
    padding: '2px 10px',
    backgroundColor: '#eaf4e9',
    color: '#3b8132',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '600',
    border: '1px solid #3b8132'
  },
  section: {
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '1px solid #f3f4f6'
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#3b8132',
    marginBottom: '8px',
    marginTop: 0
  },
  label: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: '2px',
    display: 'block'
  },
  workItemsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  workItemRow: {
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start'
  },
  removeBtn: {
    padding: '6px 12px',
    backgroundColor: '#ffffff',
    color: '#e74c3c',
    border: '1px solid #e74c3c',
    borderRadius: '10px',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  addItemBtn: {
    padding: '8px 16px',
    backgroundColor: '#ffffff',
    color: '#3b8132',
    border: '1px dashed #3b8132',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    alignSelf: 'flex-start',
    marginTop: '4px',
    transition: 'all 0.3s ease'
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '16px',
    paddingTop: '12px',
    borderTop: '1px solid #e0e0e0'
  },
  resetBtn: {
    padding: '8px 20px',
    backgroundColor: '#ffffff',
    color: '#3b8132',
    border: '1px solid #3b8132',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  submitBtn: {
    padding: '8px 24px',
    backgroundColor: '#3b8132',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 4px rgba(59, 129, 50, 0.2)'
  },

  // Modal Styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)'
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
    animation: 'modalFadeIn 0.3s ease'
  },
  modalHeader: {
    padding: '16px 20px',
    borderBottom: '1px solid #eee',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: '12px',
    borderTopRightRadius: '12px'
  },
  modalTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '700',
    color: '#3b8132'
  },
  modalBody: {
    padding: '20px'
  },
  modalFooter: {
    padding: '16px 20px',
    borderTop: '1px solid #eee',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px'
  },
  previewSection: {
    marginBottom: '16px'
  },
  previewTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#666',
    textTransform: 'uppercase',
    borderBottom: '1px solid #f0f0f0',
    paddingBottom: '4px',
    marginBottom: '10px'
  },
  previewRow: {
    display: 'flex',
    marginBottom: '6px',
    fontSize: '14px'
  },
  previewLabel: {
    width: '140px',
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
    marginTop: '10px',
    fontSize: '13px'
  },
  itemTh: {
    textAlign: 'left',
    padding: '8px',
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #eee',
    color: '#3b8132',
    fontWeight: '700'
  },
  itemTd: {
    padding: '8px',
    borderBottom: '1px solid #f0f0f0'
  },
  confirmBtn: {
    padding: '10px 24px',
    backgroundColor: '#3b8132',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  editModalBtn: {
    padding: '10px 24px',
    backgroundColor: 'white',
    color: '#666',
    border: '1px solid #ccc',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer'
  },

  // Filter bar
  filtersCard: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    padding: '20px',
    border: '1px solid #e0e0e0'
  },
  searchBtn: {
    padding: '10px 24px',
    backgroundColor: '#3b8132',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  filterResetBtn: {
    padding: '10px 24px',
    backgroundColor: '#ffffff',
    color: '#3b8132',
    border: '1px solid #3b8132',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },

  // Table
  tableCard: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    overflow: 'hidden',
    border: '1px solid #e0e0e0'
  },
  th: {
    padding: '16px',
    textAlign: 'left',
    backgroundColor: '#f9fafb',
    fontWeight: '600',
    color: '#3b8132',
    borderBottom: '2px solid #3b8132',
    fontSize: '14px'
  },
  td: {
    padding: '16px',
    borderBottom: '1px solid #e0e0e0',
    fontSize: '14px',
    color: '#2c3e50'
  },
  badge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500'
  },
  editBtn: {
    padding: '8px 18px',
    backgroundColor: '#3b8132',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  deleteBtn: {
    padding: '8px 18px',
    backgroundColor: '#ffffff',
    color: '#e74c3c',
    border: '1px solid #e74c3c',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  noData: {
    padding: '40px',
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '15px'
  },
  viewBtn: {
    padding: '8px 18px',
    backgroundColor: '#ffffff',
    color: '#3b8132',
    border: '1px solid #3b8132',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  }
};
