import React, { useState, useEffect } from 'react';
import { superAdminAPI } from '../services/api';
import { useToast } from '../components/common/Toast';
import Loading from '../components/common/Loading';

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    password: '',
    shopName: '',
    email: '',
    isActive: true
  });

  const { success: showSuccess, error: showError } = useToast();

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await superAdminAPI.getAllAdmins();
      if (response.data.success) {
        setAdmins(response.data.admins);
      }
    } catch (error) {
      showError('Failed to fetch admins');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (admin = null) => {
    if (admin) {
      setEditingAdmin(admin);
      setFormData({
        name: admin.name,
        mobile: admin.mobile,
        password: '', 
        shopName: admin.shopName,
        email: admin.email || '',
        isActive: admin.isActive
      });
    } else {
      setEditingAdmin(null);
      setFormData({
        name: '',
        mobile: '',
        password: '',
        shopName: '',
        email: '',
        isActive: true
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAdmin) {
        await superAdminAPI.updateAdmin(editingAdmin._id, formData);
        showSuccess('Admin updated successfully');
      } else {
        await superAdminAPI.createAdmin(formData);
        showSuccess('Admin created successfully');
      }
      setShowModal(false);
      fetchAdmins();
    } catch (error) {
      showError(error.response?.data?.message || 'Action failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this admin account permanently?')) {
      try {
        await superAdminAPI.deleteAdmin(id);
        showSuccess('Admin deleted successfully');
        fetchAdmins();
      } catch (error) {
        showError('Failed to delete admin');
      }
    }
  };

  if (loading && admins.length === 0) return <Loading text="Loading admin accounts..." />;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Admin Management</h1>
          <p style={styles.subtitle}>Create and manage shop administrator accounts</p>
        </div>
        <button style={styles.addButton} onClick={() => handleOpenModal()}>
          + Create New Admin
        </button>
      </div>

      <div style={styles.tableSection}>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Admin Name</th>
                <th style={styles.th}>Mobile Number</th>
                <th style={styles.th}>Shop Name</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Created Date</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin._id} style={styles.tr}>
                  <td style={styles.td}>
                    <div style={styles.adminInfo}>
                      <div style={styles.avatar}>
                        {admin.name.charAt(0).toUpperCase()}
                      </div>
                      <span style={styles.adminName}>{admin.name}</span>
                    </div>
                  </td>
                  <td style={styles.td}>{admin.mobile}</td>
                  <td style={styles.td}>{admin.shopName}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      backgroundColor: admin.isActive ? '#dcfce7' : '#fee2e2',
                      color: admin.isActive ? '#166534' : '#991b1b'
                    }}>
                      {admin.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td style={styles.td}>{new Date(admin.createdAt).toLocaleDateString()}</td>
                  <td style={styles.td}>
                    <div style={styles.actions}>
                      <button style={styles.editBtn} onClick={() => handleOpenModal(admin)} title="Edit Admin">Edit</button>
                      <button style={styles.deleteBtn} onClick={() => handleDelete(admin._id)} title="Delete Admin">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {admins.length === 0 && (
                <tr>
                  <td colSpan="6" style={styles.noData}>No admin accounts found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{editingAdmin ? 'Edit Admin Account' : 'Create New Admin'}</h2>
              <button style={styles.closeModalBtn} onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Full Name</label>
                  <input
                    style={styles.input}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Mobile Number</label>
                  <input
                    style={styles.input}
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/[^0-9]/g, '').slice(0, 10) })}
                    placeholder="10-digit number"
                    maxLength="10"
                    required
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Shop Name</label>
                  <input
                    style={styles.input}
                    value={formData.shopName}
                    onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                    placeholder="Business / Shop name"
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email Address</label>
                  <input
                    style={styles.input}
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="admin@example.com"
                    required
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  {editingAdmin ? 'Reset Password (Leave blank to keep current)' : 'Password'}
                </label>
                <input
                  style={styles.input}
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingAdmin ? "New password" : "Enter password"}
                  required={!editingAdmin}
                />
              </div>
              
              {editingAdmin && (
                <div style={styles.checkboxGroup}>
                  <label style={styles.switch}>
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                    <span style={styles.slider}></span>
                  </label>
                  <span style={styles.switchLabel}>Account Status: <strong>{formData.isActive ? 'Active' : 'Disabled'}</strong></span>
                </div>
              )}

              <div style={styles.modalFooter}>
                <button type="button" style={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" style={styles.submitBtn}>
                  {editingAdmin ? 'Save Changes' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { padding: '24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' },
  title: { fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: 0 },
  subtitle: { fontSize: '16px', color: '#64748b', margin: '4px 0 0 0' },
  addButton: {
    padding: '12px 24px',
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.2)'
  },
  tableSection: {
    backgroundColor: '#fff',
    borderRadius: '24px',
    padding: '24px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
    border: '1px solid #f1f5f9'
  },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    textAlign: 'left',
    padding: '16px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '2px solid #f1f5f9'
  },
  td: { padding: '16px', fontSize: '14px', color: '#1e293b', borderBottom: '1px solid #f1f5f9' },
  tr: { transition: 'background-color 0.2s ease' },
  adminInfo: { display: 'flex', alignItems: 'center', gap: '12px' },
  avatar: {
    width: '36px',
    height: '36px',
    backgroundColor: '#f1f5f9',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '700',
    color: '#0f172a'
  },
  adminName: { fontWeight: '600', color: '#0f172a' },
  badge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600'
  },
  actions: { display: 'flex', gap: '8px' },
  editBtn: { 
    padding: '6px 12px', 
    borderRadius: '8px', 
    border: '1px solid #e2e8f0', 
    background: '#fff', 
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500'
  },
  deleteBtn: { 
    padding: '6px 12px', 
    borderRadius: '8px', 
    border: 'none', 
    background: '#fee2e2', 
    color: '#991b1b', 
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500'
  },
  
  modalOverlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000,
    backdropFilter: 'blur(4px)'
  },
  modal: {
    backgroundColor: '#fff', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '600px',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
  },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  modalTitle: { fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0 },
  closeModalBtn: { fontSize: '28px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  formRow: { display: 'flex', gap: '20px' },
  formGroup: { flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#475569' },
  input: { padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px' },
  checkboxGroup: { display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px' },
  
  switch: { position: 'relative', display: 'inline-block', width: '40px', height: '22px' },
  slider: {
    position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#cbd5e1', transition: '.4s', borderRadius: '34px'
  },
  switchLabel: { fontSize: '14px', color: '#475569' },
  
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' },
  cancelBtn: { padding: '12px 24px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'none', cursor: 'pointer', fontWeight: '600' },
  submitBtn: { padding: '12px 24px', borderRadius: '12px', border: 'none', background: '#3b82f6', color: '#fff', fontWeight: '600', cursor: 'pointer' },
  noData: { padding: '48px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }
};

export default AdminManagement;
