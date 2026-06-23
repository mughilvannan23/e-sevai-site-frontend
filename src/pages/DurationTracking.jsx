import React, { useState, useEffect } from 'react';
import { adminAPI, workAPI } from '../services/api';
import Loading from '../components/common/Loading';
import Pagination from '../components/common/Pagination';
import { useToast } from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';
import { formatWorkStatus } from '../utils/formatters';

const DurationTracking = () => {
  const { isAdmin, isEmployee } = useAuth();
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const { error, success } = useToast();

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
  });

  const fetchWorks = async () => {
    try {
      setLoading(true);
      const params = { ...filters, durationBased: 'true' };
      let response;
      if (isAdmin) {
        response = await adminAPI.getAllWorks(params);
      } else {
        response = await workAPI.getMyWorks(params);
      }

      if (response.data.success) {
        setWorks(response.data.works);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      error('Failed to fetch duration works');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorks();
  }, [filters.page, filters.limit, filters.search]);

  const handleSearchChange = (e) => {
    setFilters({ ...filters, search: e.target.value, page: 1 });
  };

  const handlePageChange = (page) => {
    setFilters({ ...filters, page });
  };

  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3;
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    const today = new Date();
    today.setHours(0,0,0,0);
    const expiry = new Date(expiryDate);
    return expiry < today;
  };

  const handleSendWhatsApp = (work) => {
    const customerPhone = String(work.customerPhone).replace(/[^0-9]/g, '');
    if (customerPhone) {
      const isExpSoon = isExpiringSoon(work.expiryDate);
      const message = `Hello ${work.customerName || ''}, your service/duration for ${work.items?.map(i => i.title).join(', ')} is ${isExpSoon ? 'expiring soon' : 'completed/expired'}.`;
      const whatsappUrl = `https://wa.me/91${customerPhone}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "whatsapp_window");
    } else {
      error("No valid phone number for this customer.");
    }
  };

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 style={{ color: '#2c3e50', margin: 0, fontWeight: '700' }}>Duration & Expiry Tracking</h2>
          <p className="text-muted mb-0">Monitor expiring services and send reminders</p>
        </div>
        <div className="d-flex gap-2">
          <input
            type="text"
            placeholder="Search by name or title..."
            className="form-control"
            value={filters.search}
            onChange={handleSearchChange}
            style={{ width: '250px' }}
          />
        </div>
      </div>

      <div className="card shadow-sm" style={{ border: 'none', borderRadius: '12px', overflow: 'hidden' }}>
        {loading ? (
          <div className="p-5"><Loading /></div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="py-3">Customer</th>
                  <th className="py-3">Services</th>
                  <th className="py-3">Duration</th>
                  <th className="py-3">Expiry Date</th>
                  <th className="py-3 text-center">Status</th>
                  <th className="py-3 text-end px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {works.map((work) => {
                  const expSoon = isExpiringSoon(work.expiryDate);
                  const expired = isExpired(work.expiryDate);
                  
                  return (
                    <tr key={work._id} style={{ backgroundColor: expSoon ? '#fff3cd' : expired ? '#f8d7da' : 'transparent' }}>
                      <td className="px-4 text-nowrap">
                        <div className="fw-medium">{new Date(work.date).toLocaleDateString('en-IN')}</div>
                      </td>
                      <td>
                        <div className="fw-semibold text-dark">{work.customerName}</div>
                        <div className="text-muted small">{work.customerPhone}</div>
                      </td>
                      <td>
                        <div className="d-flex flex-column gap-1">
                          {work.items.map((item, i) => (
                            <span key={i} className="badge bg-light text-dark border" style={{ width: 'fit-content' }}>
                              {item.title}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <div className="fw-semibold text-primary">{work.durationMonths} Months</div>
                      </td>
                      <td>
                        {work.expiryDate ? (
                          <div className="fw-medium">{new Date(work.expiryDate).toLocaleDateString('en-IN')}</div>
                        ) : '-'}
                      </td>
                      <td className="text-center">
                        {expSoon && <span className="badge bg-warning text-dark px-2 py-1">Expiring Soon</span>}
                        {expired && !expSoon && <span className="badge bg-danger px-2 py-1">Expired</span>}
                        {!expSoon && !expired && <span className="badge bg-success px-2 py-1">Active</span>}
                      </td>
                      <td className="text-end px-4">
                        <button
                          onClick={() => handleSendWhatsApp(work)}
                          className="btn btn-sm"
                          style={{ backgroundColor: '#25D366', color: 'white', fontWeight: '500' }}
                          title="Send WhatsApp Reminder"
                        >
                          <i className="bi bi-whatsapp me-1"></i> WhatsApp
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {works.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      No duration-based works found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        
        {pagination.totalPages > 1 && (
          <div className="border-top px-4 py-3 bg-light">
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DurationTracking;
