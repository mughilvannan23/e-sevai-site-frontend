import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../components/common/Toast';

const SuperAdminDashboard = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    shopName: '',
    mobile: '',
    password: '',
    isActive: true
  });
  const { success, error: showError } = useToast();

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await api.get('/superadmin/admins');
      if (response.data.success) {
        setAdmins(response.data.admins);
      }
    } catch (error) {
      showError('Error fetching shop admins');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await api.put(`/superadmin/admins/${formData.id}`, formData);
        success('Shop admin updated successfully');
      } else {
        await api.post('/superadmin/admins', formData);
        success('Shop admin created successfully');
      }
      setShowModal(false);
      fetchAdmins();
      resetForm();
    } catch (err) {
      showError(err.response?.data?.message || 'Error saving shop admin');
    }
  };

  const editAdmin = (admin) => {
    setFormData({
      id: admin._id,
      shopName: admin.shopName || '',
      mobile: admin.mobile || '',
      password: '',
      isActive: admin.isActive
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      id: null,
      shopName: '',
      mobile: '',
      password: '',
      isActive: true
    });
  };

  if (loading) {
    return <div className="text-center p-5">Loading...</div>;
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h4 mb-0 text-gray-800" style={{ color: '#d32f2f' }}>Super Admin - Shop Management</h2>
        <button 
          className="btn text-white px-4 py-2" 
          style={{ backgroundColor: '#d32f2f', borderRadius: '8px', fontWeight: '500' }}
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          + Add New Shop
        </button>
      </div>

      <div className="card shadow-sm border-0" style={{ borderRadius: '12px' }}>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="px-4 py-3 border-0 text-muted" style={{ fontWeight: '600' }}>Shop Name</th>
                  <th className="px-4 py-3 border-0 text-muted" style={{ fontWeight: '600' }}>Mobile Number</th>
                  <th className="px-4 py-3 border-0 text-muted" style={{ fontWeight: '600' }}>Status</th>
                  <th className="px-4 py-3 border-0 text-muted" style={{ fontWeight: '600' }}>Joined Date</th>
                  <th className="px-4 py-3 border-0 text-muted text-end" style={{ fontWeight: '600' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-muted">No shop admins found.</td>
                  </tr>
                ) : (
                  admins.map(admin => (
                    <tr key={admin._id} style={{ verticalAlign: 'middle' }}>
                      <td className="px-4 py-3">
                        <div className="fw-bold text-dark">{admin.shopName || 'Default Shop'}</div>
                      </td>
                      <td className="px-4 py-3">{admin.mobile}</td>
                      <td className="px-4 py-3">
                        <span className={`badge rounded-pill ${admin.isActive ? 'bg-success' : 'bg-danger'}`} style={{ padding: '6px 12px' }}>
                          {admin.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {new Date(admin.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-end">
                        <button 
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => editAdmin(admin)}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow" style={{ borderRadius: '16px' }}>
                <div className="modal-header border-bottom-0 pb-0">
                  <h5 className="modal-title fw-bold">{formData.id ? 'Edit Shop Admin' : 'Add New Shop Admin'}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body p-4">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label text-muted fw-semibold">Shop Name</label>
                      <input 
                        type="text" 
                        className="form-control form-control-lg bg-light" 
                        name="shopName"
                        value={formData.shopName}
                        onChange={handleInputChange}
                        required 
                        placeholder="Enter shop name"
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label text-muted fw-semibold">Mobile Number</label>
                      <input 
                        type="text" 
                        className="form-control form-control-lg bg-light" 
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        required 
                        placeholder="10-digit mobile number"
                        pattern="[0-9]{10}"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="form-label text-muted fw-semibold">Password {formData.id && '(Leave blank to keep current)'}</label>
                      <input 
                        type="password" 
                        className="form-control form-control-lg bg-light" 
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required={!formData.id}
                        placeholder="Enter password"
                        minLength="6"
                      />
                    </div>

                    <div className="mb-4 form-check form-switch d-flex align-items-center gap-2">
                      <input 
                        className="form-check-input mt-0" 
                        type="checkbox" 
                        id="isActiveCheck"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        style={{ transform: 'scale(1.2)' }}
                      />
                      <label className="form-check-label text-dark fw-medium mb-0" htmlFor="isActiveCheck">
                        {formData.isActive ? 'Shop is Active' : 'Shop is Inactive'}
                      </label>
                    </div>

                    <div className="d-flex gap-2 pt-2">
                      <button 
                        type="button" 
                        className="btn btn-light flex-grow-1 py-2 fw-semibold"
                        onClick={() => setShowModal(false)}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="btn flex-grow-1 py-2 fw-semibold text-white"
                        style={{ backgroundColor: '#d32f2f' }}
                      >
                        {formData.id ? 'Update Shop' : 'Create Shop'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
