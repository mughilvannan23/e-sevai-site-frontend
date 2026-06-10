import React, { useState, useEffect, useCallback } from 'react';
import { purchaseAPI } from '../services/api';
import { useToast } from '../components/common/Toast';
import Loading from '../components/common/Loading';

const AdminPurchases = () => {
    const [purchases, setPurchases] = useState([]);
    const [balances, setBalances] = useState({ shopBalance: 0, todayGpay: 0 });
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
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    const { showToast } = useToast();

    const fetchPurchases = useCallback(async () => {
        try {
            setLoading(true);
            const params = filter === 'custom' ? dateRange : { filter };
            const response = await purchaseAPI.getAllPurchases(params);
            if (response.data.success) {
                setPurchases(response.data.purchases);
                setBalances({
                    shopBalance: response.data.shopBalance.handCashBalance,
                    todayGpay: response.data.shopBalance.todayGpay
                });
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

        try {
            setSubmitting(true);
            let response;
            if (isEditing) {
                response = await purchaseAPI.updatePurchase(editId, formData);
            } else {
                if (Number(formData.amount) > balances.shopBalance) {
                    showToast('Insufficient balance', 'error');
                    setSubmitting(false);
                    return;
                }
                response = await purchaseAPI.createPurchase(formData);
            }

            if (response.data.success) {
                showToast(isEditing ? 'Purchase updated successfully' : 'Purchase added successfully', 'success');
                closeModal();
                fetchPurchases();
            }
        } catch (error) {
            showToast(error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'add'} purchase`, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (purchase) => {
        setFormData({
            orderName: purchase.orderName,
            amount: purchase.amount,
            date: new Date(purchase.date).toISOString().split('T')[0]
        });
        setIsEditing(true);
        setEditId(purchase._id);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this purchase? This will add the amount back to the shop balance.')) {
            return;
        }

        try {
            const response = await purchaseAPI.deletePurchase(id);
            if (response.data.success) {
                showToast('Purchase deleted successfully', 'success');
                fetchPurchases();
            }
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to delete purchase', 'error');
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setIsEditing(false);
        setEditId(null);
        setFormData({
            orderName: '',
            amount: '',
            date: new Date().toISOString().split('T')[0]
        });
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
                <div className="d-flex gap-2">
                    <button
                        className="btn d-flex align-items-center gap-2"
                        style={{ border: '1px solid #3b8132', color: '#3b8132', borderRadius: '10px', padding: '10px 20px', fontWeight: '600' }}
                        onClick={fetchPurchases}
                        disabled={loading}
                    >
                        {loading ? '...' : 'Refresh'}
                    </button>
                    <button
                        className="btn d-flex align-items-center gap-2"
                        style={{ backgroundColor: '#3b8132', color: 'white', borderRadius: '10px', padding: '10px 20px', fontWeight: '600' }}
                        onClick={() => {
                            closeModal();
                            setShowModal(true);
                        }}
                    >
                        <span style={{ fontSize: '1.2rem' }}>+</span> New Purchase
                    </button>
                </div>
            </div>

            {/* Shop Balance Card */}
            <div className="row mb-4">
                <div className="col-md-4">
                    <div className="card shadow-sm border-0" style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #3b8132', height: '100%' }}>
                        <div className="card-body p-3">
                            <div className="d-flex align-items-center">
                                <div style={{ width: '40px', height: '40px', backgroundColor: '#3b8132', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px', marginRight: '15px' }}>🏪</div>
                                <div className="flex-grow-1">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#3b8132' }}>₹{(balances.shopBalance || 0).toLocaleString()}</h3>
                                            <p style={{ margin: 0, fontSize: '10px', fontWeight: '600', color: '#666', textTransform: 'uppercase' }}>Cash Balance</p>
                                        </div>
                                        <div style={{ textAlign: 'right', borderLeft: '1px solid #eee', paddingLeft: '10px' }}>
                                            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#0dcaf0' }}>₹{(balances.todayGpay || 0).toLocaleString()}</h3>
                                            <p style={{ margin: 0, fontSize: '10px', fontWeight: '600', color: '#666', textTransform: 'uppercase' }}>Today's GPay</p>
                                        </div>
                                    </div>
                                    <p style={{ margin: '5px 0 0 0', fontSize: '10px', fontWeight: '600', color: '#666', textTransform: 'uppercase', borderTop: '1px solid #eee', paddingTop: '5px' }}>Shop Balance</p>
                                </div>
                            </div>
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
                                    <th className="px-4 py-3 text-end" style={{ color: '#3b8132', borderBottom: '2px solid #3b8132' }}>Actions</th>
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
                                            <td className="px-4 py-3 text-end">
                                                <div className="d-flex justify-content-end gap-2">
                                                    <button
                                                        className="btn btn-sm"
                                                        style={{ color: '#3b8132', border: '1px solid #3b8132', borderRadius: '8px' }}
                                                        onClick={() => handleEdit(purchase)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="btn btn-sm"
                                                        style={{ color: '#e74c3c', border: '1px solid #e74c3c', borderRadius: '8px' }}
                                                        onClick={() => handleDelete(purchase._id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
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
                            <div className="modal-header text-white border-0" style={{ backgroundColor: isEditing ? '#3b8132' : '#3b8132', borderRadius: '10px 10px 0 0' }}>
                                <h5 className="modal-title fw-bold">{isEditing ? 'Edit Purchase' : 'New Purchase'}</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={closeModal} aria-label="Close" style={{ opacity: 1 }}></button>
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
                                            Available Balance: {formatCurrency(balances.shopBalance)}
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
                                        onClick={closeModal}
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
