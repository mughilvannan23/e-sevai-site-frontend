import React, { useState, useEffect, useCallback } from 'react';
import { purchaseAPI } from '../services/api';
import { useToast } from '../components/common/Toast';
import Loading from '../components/common/Loading';

const AdminPurchases = () => {
    const [purchases, setPurchases] = useState([]);
    const [shopBalance, setShopBalance] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [filter, setFilter] = useState('all');
    const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        orderName: '',
        amount: '',
        date: new Date().toISOString().split('T')[0]
    });

    const { showToast } = useToast();

    const fetchPurchases = useCallback(async () => {
        try {
            setLoading(true);
            const params = filter === 'custom' ? dateRange : { filter };
            const response = await purchaseAPI.getAllPurchases(params);
            if (response.data.success) {
                setPurchases(response.data.purchases);
                setShopBalance(response.data.shopBalance);
            }
        } catch (error) {
            console.error('Fetch purchases error:', error);
            showToast('Failed to fetch purchases', 'error');
        } finally {
            setLoading(false);
        }
    }, [filter, dateRange, showToast]);

    useEffect(() => {
        fetchPurchases();
    }, [fetchPurchases]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.orderName || !formData.amount) {
            showToast('Please fill all required fields', 'warning');
            return;
        }

        if (Number(formData.amount) > shopBalance) {
            showToast('Insufficient balance', 'error');
            return;
        }

        try {
            setSubmitting(true);
            const response = await purchaseAPI.createPurchase(formData);
            if (response.data.success) {
                showToast('Purchase added successfully', 'success');
                setShowModal(false);
                setFormData({
                    orderName: '',
                    amount: '',
                    date: new Date().toISOString().split('T')[0]
                });
                fetchPurchases();
            }
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to add purchase', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(amount);
    };

    if (loading && purchases.length === 0) return <Loading />;

    return (
        <div className="container-fluid py-4" style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="h3 mb-0" style={{ color: '#3b8132', fontWeight: '700' }}>Purchase Management</h2>
                <button 
                    className="btn d-flex align-items-center gap-2"
                    style={{ backgroundColor: '#3b8132', color: 'white', borderRadius: '10px', padding: '10px 20px', fontWeight: '600' }}
                    onClick={() => setShowModal(true)}
                >
                    <span style={{ fontSize: '1.2rem' }}>+</span> New Purchase
                </button>
            </div>

            {/* Shop Balance Card */}
            <div className="row mb-4">
                <div className="col-md-4">
                    <div className="card shadow-sm border-0" style={{ backgroundColor: '#3b8132', color: 'white', borderRadius: '10px' }}>
                        <div className="card-body p-4">
                            <h6 className="card-subtitle mb-2 opacity-75">Current Shop Balance (Cash)</h6>
                            <h3 className="card-title mb-0" style={{ fontWeight: '700', fontSize: '28px' }}>{formatCurrency(shopBalance)}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '10px', border: '1px solid #e0e0e0' }}>
                <div className="card-body p-4">
                    <div className="row g-3 align-items-end">
                        <div className="col-md-3">
                            <label className="form-label text-muted small fw-bold">FILTER BY PERIOD</label>
                            <select 
                                className="form-select"
                                style={{ borderRadius: '10px' }}
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            >
                                <option value="all">All Time</option>
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="custom">Custom Range</option>
                            </select>
                        </div>
                        
                        {filter === 'custom' && (
                            <>
                                <div className="col-md-3">
                                    <label className="form-label text-muted small fw-bold">START DATE</label>
                                    <input 
                                        type="date" 
                                        className="form-control"
                                        style={{ borderRadius: '10px' }}
                                        value={dateRange.startDate}
                                        onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label text-muted small fw-bold">END DATE</label>
                                    <input 
                                        type="date" 
                                        className="form-control"
                                        style={{ borderRadius: '10px' }}
                                        value={dateRange.endDate}
                                        onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Purchase List Table */}
            <div className="card shadow-sm border-0" style={{ borderRadius: '10px', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead style={{ backgroundColor: '#f9fafb' }}>
                                <tr>
                                    <th className="px-4 py-3" style={{ color: '#3b8132', borderBottom: '2px solid #3b8132' }}>Order Name</th>
                                    <th className="px-4 py-3" style={{ color: '#3b8132', borderBottom: '2px solid #3b8132' }}>Amount</th>
                                    <th className="px-4 py-3" style={{ color: '#3b8132', borderBottom: '2px solid #3b8132' }}>Date & Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {purchases.length > 0 ? (
                                    purchases.map((purchase) => (
                                        <tr key={purchase._id}>
                                            <td className="px-4 py-3 fw-bold" style={{ color: '#2c3e50' }}>{purchase.orderName}</td>
                                            <td className="px-4 py-3 text-danger fw-bold">-{formatCurrency(purchase.amount)}</td>
                                            <td className="px-4 py-3 text-muted">
                                                {new Date(purchase.date).toLocaleString('en-IN', {
                                                    dateStyle: 'medium',
                                                    timeStyle: 'short'
                                                })}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="text-center py-5 text-muted">
                                            No purchases found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* New Purchase Modal */}
            {showModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1100 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow" style={{ borderRadius: '10px' }}>
                            <div className="modal-header text-white border-0" style={{ backgroundColor: '#3b8132', borderRadius: '10px 10px 0 0' }}>
                                <h5 className="modal-title fw-bold">New Purchase</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body p-4">
                                    <div className="mb-3">
                                        <label className="form-label fw-bold small" style={{ color: '#2c3e50' }}>ORDER NAME</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            style={{ borderRadius: '10px' }}
                                            name="orderName"
                                            value={formData.orderName}
                                            onChange={handleInputChange}
                                            placeholder="e.g. Office Supplies, Ink, Paper"
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold small" style={{ color: '#2c3e50' }}>AMOUNT (₹)</label>
                                        <input 
                                            type="number" 
                                            className="form-control" 
                                            style={{ borderRadius: '10px' }}
                                            name="amount"
                                            value={formData.amount}
                                            onChange={handleInputChange}
                                            placeholder="0.00"
                                            required
                                            min="0"
                                        />
                                        <div className="form-text" style={{ color: '#3b8132' }}>
                                            Available Balance: {formatCurrency(shopBalance)}
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold small" style={{ color: '#2c3e50' }}>DATE</label>
                                        <input 
                                            type="date" 
                                            className="form-control" 
                                            style={{ borderRadius: '10px' }}
                                            name="date"
                                            value={formData.date}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer border-0 p-4 pt-0">
                                    <button 
                                        type="button" 
                                        className="btn" 
                                        style={{ border: '1px solid #3b8132', color: '#3b8132', borderRadius: '10px', padding: '10px 20px' }}
                                        onClick={() => setShowModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="btn px-4"
                                        style={{ backgroundColor: '#3b8132', color: 'white', borderRadius: '10px', padding: '10px 20px', fontWeight: '600' }}
                                        disabled={submitting}
                                    >
                                        {submitting ? 'Saving...' : 'Save Purchase'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPurchases;
