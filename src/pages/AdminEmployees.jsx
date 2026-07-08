import React, { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import Loading from '../components/common/Loading';
import Pagination from '../components/common/Pagination';
import { useToast } from '../components/common/Toast';

const AdminEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    status: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    password: '',
    isActive: true
  });
  const { success, error } = useToast();

  useEffect(() => {
    fetchEmployees();
  }, [filters.page, filters.limit, filters.status]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params = {};
      Object.keys(filters).forEach(key => {
        if (filters[key] && key !== 'page' && key !== 'limit') {
          params[key] = filters[key];
        }
      });
      params.page = filters.page;
      params.limit = filters.limit;

      const response = await userAPI.getEmployees(params);
      if (response.data.success) {
        setEmployees(response.data.employees);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
      error('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEmployees();
  };

  const handleOpenModal = (employee = null) => {
    if (employee) {
      setEditingEmployee(employee);
      setFormData({
        name: employee.name,
        mobile: employee.mobile || '',
        email: employee.email || '',
        password: '',
        isActive: employee.isActive
      });
    } else {
      setEditingEmployee(null);
      setFormData({
        name: '',
        mobile: '',
        email: '',
        password: '',
        isActive: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEmployee(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'mobile') {
        const numericValue = value.replace(/[^0-9]/g, '').substring(0, 10);
        setFormData(prev => ({ ...prev, [name]: numericValue }));
    } else {
        setFormData(prev => ({
          ...prev,
          [name]: type === 'checkbox' ? checked : value
        }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEmployee) {
        const updateId = editingEmployee._id || editingEmployee.id;
        const response = await userAPI.updateEmployee(updateId, formData);
        if (response.data.success) {
          success('Employee updated successfully');
          fetchEmployees();
          handleCloseModal();
        }
      } else {
        const response = await userAPI.createEmployee(formData);
        if (response.data.success) {
          success('Employee created successfully');
          fetchEmployees();
          handleCloseModal();
        }
      }
    } catch (err) {
      console.error('Error saving employee:', err);
      error(err.response?.data?.message || 'Failed to save employee');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this employee?')) {
      try {
        const response = await userAPI.deleteEmployee(id);
        if (response.data.success) {
          success('Employee deactivated successfully');
          fetchEmployees();
        }
      } catch (err) {
        console.error('Error deleting employee:', err);
        error('Failed to delete employee');
      }
    }
  };

  if (loading && employees.length === 0) {
    return <Loading text="Loading employees..." />;
  }

  return (
    <div className="container-fluid p-0">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <h1 style={styles.title} className="fs-3 fs-md-2">Employees</h1>
          <p style={styles.subtitle} className="fs-6 text-muted">Manage employee accounts</p>
        </div>
        <button
          style={styles.addBtn}
          className="btn w-90 w-md-auto text-white"
          onClick={() => handleOpenModal()}
        >
          + Add Employee
        </button>
      </div>

      <div style={styles.filtersCard} className="p-3 p-md-4">
        <form onSubmit={handleSearch} className="d-flex flex-column gap-3">
          <div className="row g-3">
            <div className="col-12 col-md-6 d-flex flex-column gap-2">
              <label style={styles.label}>Search</label>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Name, mobile, or ID"
                className="form-control"
              />
            </div>
            <div className="col-12 col-md-6 d-flex flex-column gap-2">
              <label style={styles.label}>Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="form-select"
              >
                <option value="">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="d-flex flex-column flex-sm-row gap-2 mt-2">
            <button type="submit" style={styles.searchBtn} className="btn w-100 w-sm-auto text-white">
              Search
            </button>
            <button
              type="button"
              style={styles.resetBtn} className="btn w-100 w-sm-auto btn-outline-primary"
              onClick={() => setFilters({
                page: 1,
                limit: 10,
                search: '',
                status: ''
              })}
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      <div style={styles.tableCard}>
        <div className="table-responsive">
          <table className="table table-hover mb-0" style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Employee ID</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Mobile</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Last Login</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => (
                <tr key={emp._id}>
                  <td style={styles.td}>{emp.employeeId}</td>
                  <td style={styles.td}>{emp.name}</td>
                  <td style={styles.td}>{emp.mobile}</td>
                  <td style={styles.td}>{emp.email || '-'}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      backgroundColor: emp.isActive ? '#3b8132' : '#e74c3c',
                      color: 'white'
                    }}>
                      {emp.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {emp.lastLogin
                      ? new Date(emp.lastLogin).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                      : 'Never'
                    }
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actions} className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleOpenModal(emp)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(emp._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {employees.length === 0 && (
          <div style={styles.noData}>No employees found</div>
        )}

        {pagination.totalEmployees > 0 && (
          <div className="p-3">
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalEmployees}
              itemsPerPage={pagination.limit}
              onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
            />
          </div>
        )}
      </div>

      {showModal && (
        <div style={styles.modalOverlay} className="p-3" onClick={handleCloseModal}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle} className="fs-5">
                {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
              </h2>
              <button style={styles.closeBtn} onClick={handleCloseModal}>×</button>
            </div>
            <form onSubmit={handleSubmit} style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Enter name"
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Mobile Number</label>
                <input
                  type="text"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Enter 10-digit mobile number"
                  required
                  maxLength="10"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Enter email"
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Password {editingEmployee && <span style={{ fontSize: '12px', color: '#888' }}>(Leave blank to keep current password)</span>}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password || ''}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder={editingEmployee ? "Leave blank to keep unchanged" : "Enter password"}
                  required={!editingEmployee}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    style={styles.checkbox}
                  />
                  Active
                </label>
              </div>
              <div className="d-flex flex-column flex-sm-row gap-2 mt-3 justify-content-end">
                <button type="button" style={styles.cancelBtn} className="btn w-100 w-sm-auto btn-outline-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" style={styles.submitBtn} className="btn w-100 w-sm-auto text-white">
                  {editingEmployee ? 'Update' : 'Create'}
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
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px'
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '32px',
    fontWeight: '700',
    color: '#3b8132',
    letterSpacing: '0.5px'
  },
  subtitle: {
    margin: 0,
    color: '#666',
    fontSize: '16px'
  },
  addBtn: {
    padding: '12px 24px',
    backgroundColor: '#3b8132',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  filtersCard: {
    backgroundColor: '#ffffff',
    padding: '24px',
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    marginBottom: '20px',
    border: '1px solid #e0e0e0'
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#2c3e50'
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
    transition: 'all 0.2s ease'
  },
  resetBtn: {
    padding: '10px 24px',
    backgroundColor: '#ffffff',
    color: '#3b8132',
    border: '1px solid #3b8132',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
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
    transition: 'all 0.2s ease'
  },
  deleteBtn: {
    padding: '8px 18px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: '1px solid #e74c3c',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  noData: {
    padding: '40px',
    textAlign: 'center',
    color: '#666',
    fontSize: '16px'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '10px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
    border: '1px solid #e0e0e0'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #e0e0e0'
  },
  modalTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '700',
    color: '#3b8132'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#666'
  },
  modalBody: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    color: '#2c3e50'
  },
  checkbox: {
    accentColor: '#3b8132',
    width: '16px',
    height: '16px',
    cursor: 'pointer'
  },
  cancelBtn: {
    padding: '10px 24px',
    backgroundColor: '#ffffff',
    color: '#3b8132',
    border: '1px solid #3b8132',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  submitBtn: {
    padding: '10px 24px',
    backgroundColor: '#3b8132',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  }
};

export default AdminEmployees;
