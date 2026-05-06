import React, { useState, useEffect, useRef } from 'react';
import { adminAPI, userAPI, workAPI } from '../services/api';
import Loading from '../components/common/Loading.jsx';
import Pagination from '../components/common/Pagination.jsx';
import { useToast } from '../components/common/Toast.jsx';
import { useLocation } from 'react-router-dom';
import { formatWorkStatus } from '../utils/formatters';
import { workStyles as styles } from '../components/works/workStyles';
import AddWorkForm from '../components/works/AddWorkForm';
import WorkList from '../components/works/WorkList';

const getCurrentTime = () => new Date().toTimeString().slice(0, 5);

const defaultFormData = {
  date: new Date().toISOString().split('T')[0],
  time: getCurrentTime(),
  customerName: '',
  customerPhone: '',
  paymentMethod: 'Cash',
  gpayAmount: '',
  cashAmount: '',
  totalAmount: '',
  items: [{ workItemId: '', workTitle: '', quantity: 1, otherCharges: '0', discount: '0', applicationNumber: '' }],
  amount: '',
  totalDiscount: '0',
  paymentStatus: 'Pending',
  workStatus: 'In Progress',
  notes: '',
  applicationFee: 0
};

const AdminWorks = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('entries');
  const [works, setWorks] = useState([]);
  const [workItems, setWorkItems] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const { success, error } = useToast();

  // ── Work Entries State ─────────────────────────────────────────────────────
  const [editingItemId, setEditingItemId] = useState(null);
  const [editFormData, setEditFormData] = useState(defaultFormData);
  const [submitting, setSubmitting] = useState(false);

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    startDate: '',
    endDate: '',
    employeeId: '',
    paymentStatus: '',
    workStatus: ''
  });

  // ── Presets State ──────────────────────────────────────────────────────────
  const [newItem, setNewItem] = useState({ name: '', workCharge: '', serviceCharge: '', status: true });
  const [editingPreset, setEditingPreset] = useState(null);

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchEmployees();
    fetchWorkItems();
  }, []);

  useEffect(() => {
    if (activeTab === 'entries') {
      fetchWorks();
    } else {
      fetchWorkItems();
    }
  }, [activeTab, filters.page, filters.limit, filters.paymentStatus, filters.workStatus, filters.search, filters.startDate, filters.endDate, filters.employeeId]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const paymentStatus = params.get('paymentStatus') || location.state?.paymentStatus;
    const workStatus = params.get('workStatus') || location.state?.workStatus;

    if (paymentStatus || workStatus) {
      setActiveTab('entries');
      setFilters(prev => ({
        ...prev,
        paymentStatus: paymentStatus || '',
        workStatus: workStatus || ''
      }));
    }
  }, [location.search, location.state]);

  // ── API Helpers ────────────────────────────────────────────────────────────
  const fetchEmployees = async () => {
    try {
      const response = await userAPI.getEmployees({ page: 1, limit: 100 });
      if (response.data.success) setEmployees(response.data.employees);
    } catch (err) { console.error('Error fetching employees:', err); }
  };

  const fetchWorkItems = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getWorkItems();
      if (response.data.success) setWorkItems(response.data.workItems);
    } catch (err) { error('Failed to fetch work items'); }
    finally { setLoading(false); }
  };

  const fetchWorks = async () => {
    try {
      setLoading(true);
      const params = { ...filters };
      const response = await adminAPI.getAllWorks(params);
      if (response.data.success) {
        setWorks(response.data.works);
        setPagination(response.data.pagination);
      }
    } catch (err) { error('Failed to fetch works'); }
    finally { setLoading(false); }
  };

  // ── Add/Edit Work Handlers ─────────────────────────────────────────────────
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => {
      const updated = { ...prev, [name]: value };
      
      // Recalculate amount if applicationFee changes or if it's already there
      const { total, discountTotal } = updated.items.reduce((acc, item) => {
        const qty = parseInt(item.quantity) || 1;
        const otherC = parseFloat(item.otherCharges) || 0;
        const itemDisc = parseFloat(item.discount) || 0;
        let rowCost = otherC - itemDisc;
        if (item.workItemId) {
          const wi = workItems.find(w => w._id === item.workItemId);
          rowCost += (wi ? (wi.workCharge + wi.serviceCharge) * qty : 0);
        }
        acc.total += rowCost;
        acc.discountTotal += itemDisc;
        return acc;
      }, { total: parseFloat(updated.applicationFee) || 0, discountTotal: 0 });

      updated.amount = total.toString();
      updated.totalDiscount = discountTotal.toString();

      const currentAmount = total;

      if (name === 'paymentStatus') {
        if (value === 'Pending') {
          updated.paymentMethod = '';
          updated.gpayAmount = '';
          updated.cashAmount = '';
        } else if (value === 'Paid' && !prev.paymentMethod) {
          updated.paymentMethod = 'Cash';
          updated.cashAmount = currentAmount.toString();
          updated.gpayAmount = '0';
        }
      }

      if (name === 'paymentMethod') {
        if (value === 'GPay') {
          updated.gpayAmount = currentAmount.toString();
          updated.cashAmount = '0';
        } else if (value === 'Cash') {
          updated.cashAmount = currentAmount.toString();
          updated.gpayAmount = '0';
        } else if (value === 'Both') {
          updated.gpayAmount = '';
          updated.cashAmount = '';
        }
      }

      // Handle split logic: if one changes, the other takes the remainder
      if (updated.paymentMethod === 'Both') {
        if (name === 'gpayAmount') {
          const gpayVal = Math.min(parseFloat(value) || 0, currentAmount);
          updated.gpayAmount = gpayVal.toString();
          updated.cashAmount = (currentAmount - gpayVal).toFixed(2);
        } else if (name === 'cashAmount') {
          const cashVal = Math.min(parseFloat(value) || 0, currentAmount);
          updated.cashAmount = cashVal.toString();
          updated.gpayAmount = (currentAmount - cashVal).toFixed(2);
        }
      }

      // Sync totalAmount state if needed
      if (updated.paymentMethod === 'Both') {
        updated.totalAmount = (parseFloat(updated.gpayAmount || 0) + parseFloat(updated.cashAmount || 0)).toString();
      } else {
        updated.totalAmount = currentAmount.toString();
      }

      return updated;
    });
  };

  const handleItemChange = (index, field, value) => {
    let newItems = [...editFormData.items];
    if (field === 'workItemId' && value !== '') {
      const existingIndex = newItems.findIndex((item, i) => i !== index && item.workItemId === value);
      if (existingIndex !== -1) {
        newItems[existingIndex].quantity = (parseInt(newItems[existingIndex].quantity) || 1) + 1;
        if (newItems.length > 1) newItems.splice(index, 1);
        else newItems[index] = { workItemId: '', workTitle: '', quantity: 1, otherCharges: '0', applicationNumber: '' };
      } else {
        newItems[index] = { ...newItems[index], [field]: value };
      }
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }

    const { total, discountTotal } = newItems.reduce((acc, item) => {
      const qty = parseInt(item.quantity) || 1;
      const otherC = parseFloat(item.otherCharges) || 0;
      const itemDisc = parseFloat(item.discount) || 0;
      let rowCost = otherC - itemDisc;
      if (item.workItemId) {
        const wi = workItems.find(w => w._id === item.workItemId);
        rowCost += (wi ? (wi.workCharge + wi.serviceCharge) * qty : 0);
      }
      acc.total += rowCost;
      acc.discountTotal += itemDisc;
      return acc;
    }, { total: parseFloat(editFormData.applicationFee) || 0, discountTotal: 0 });
    setEditFormData(prev => {
      const updated = { ...prev, items: newItems, amount: total.toString(), totalDiscount: discountTotal.toString() };
      
      // Sync payment amounts if Paid
      if (updated.paymentStatus === 'Paid') {
        if (updated.paymentMethod === 'GPay') {
          updated.gpayAmount = total.toString();
          updated.cashAmount = '0';
          updated.totalAmount = total.toString();
        } else if (updated.paymentMethod === 'Cash') {
          updated.cashAmount = total.toString();
          updated.gpayAmount = '0';
          updated.totalAmount = total.toString();
        } else if (updated.paymentMethod === 'Both') {
          const gpay = parseFloat(updated.gpayAmount) || 0;
          const cash = parseFloat(updated.cashAmount) || 0;
          updated.totalAmount = (gpay + cash).toString();
        }
      }
      return updated;
    });
  };

  const addItemRow = () => {
    setEditFormData(prev => ({ ...prev, items: [...prev.items, { workItemId: '', workTitle: '', quantity: 1, otherCharges: '0', discount: '0', applicationNumber: '' }] }));
  };

  const removeItemRow = (index) => {
    const newItems = editFormData.items.filter((_, i) => i !== index);
    const { total, discountTotal } = newItems.reduce((acc, item) => {
      const qty = parseInt(item.quantity) || 1;
      const otherC = parseFloat(item.otherCharges) || 0;
      const itemDisc = parseFloat(item.discount) || 0;
      let rowCost = otherC - itemDisc;
      if (item.workItemId) {
        const wi = workItems.find(w => w._id === item.workItemId);
        rowCost += (wi ? (wi.workCharge + wi.serviceCharge) * qty : 0);
      }
      acc.total += rowCost;
      acc.discountTotal += itemDisc;
      return acc;
    }, { total: parseFloat(editFormData.applicationFee) || 0, discountTotal: 0 });
    setEditFormData(prev => {
      const updated = {
        ...prev,
        items: newItems.length ? newItems : [{ workItemId: '', workTitle: '', quantity: 1, otherCharges: '0', discount: '0', applicationNumber: '' }],
        amount: total.toString(),
        totalDiscount: discountTotal.toString()
      };

      // Sync payment amounts if Paid
      if (updated.paymentStatus === 'Paid') {
        if (updated.paymentMethod === 'GPay') {
          updated.gpayAmount = total.toString();
          updated.cashAmount = '0';
          updated.totalAmount = total.toString();
        } else if (updated.paymentMethod === 'Cash') {
          updated.cashAmount = total.toString();
          updated.gpayAmount = '0';
          updated.totalAmount = total.toString();
        } else if (updated.paymentMethod === 'Both') {
          const gpay = parseFloat(updated.gpayAmount) || 0;
          const cash = parseFloat(updated.cashAmount) || 0;
          updated.totalAmount = (gpay + cash).toString();
        }
      }
      return updated;
    });
  };

  const handleSubmitWork = async (e) => {
    e.preventDefault();

    let finalGpay = 0;
    let finalCash = 0;
    const currentAmount = parseFloat(editFormData.amount) || 0;

    if (editFormData.paymentStatus === 'Paid') {
      if (editFormData.paymentMethod === 'GPay') {
        finalGpay = currentAmount;
        finalCash = 0;
      } else if (editFormData.paymentMethod === 'Cash') {
        finalCash = currentAmount;
        finalGpay = 0;
      } else if (editFormData.paymentMethod === 'Both') {
        finalGpay = parseFloat(editFormData.gpayAmount) || 0;
        finalCash = parseFloat(editFormData.cashAmount) || 0;

        if (Math.abs((finalGpay + finalCash) - currentAmount) > 0.01) {
          error(`GPay + Cash (₹${(finalGpay + finalCash).toFixed(2)}) must equal Final Amount (₹${currentAmount.toFixed(2)})`);
          return;
        }
      }
    }

    try {
      setSubmitting(true);
      const payload = { 
        ...editFormData, 
        gpayAmount: finalGpay,
        cashAmount: finalCash,
        totalAmount: editFormData.paymentStatus === 'Paid' ? currentAmount : 0,
        amount: currentAmount,
        date: new Date(`${editFormData.date}T${editFormData.time || '00:00'}`) 
      };
      const response = await workAPI.updateWork(editingItemId, payload);

      if (response.data.success) {
        success('Work updated successfully');
        setEditingItemId(null);
        fetchWorks();
      }
    } catch (err) { error(err.response?.data?.message || 'Failed to save work'); }
    finally { setSubmitting(false); }
  };

  const handleEditClick = (work) => {
    if (editingItemId === work._id) {
      setEditingItemId(null);
      return;
    }
    const workDate = new Date(work.date);
    setEditFormData({
      date: workDate.toISOString().split('T')[0],
      time: workDate.toTimeString().slice(0, 5),
      customerName: work.customerName,
      customerPhone: work.customerPhone || '',
      paymentMethod: work.paymentMethod === 'Hand Cash' ? 'Cash' : (work.paymentMethod || 'Cash'),
      gpayAmount: work.gpayAmount?.toString() || '',
      cashAmount: work.cashAmount?.toString() || '',
      totalAmount: work.totalAmount?.toString() || work.amount?.toString() || '',
      items: work.items?.length > 0 
        ? work.items.map(i => ({ 
            workItemId: i.workItemId || '', 
            workTitle: i.title || '', 
            quantity: i.quantity || 1, 
            otherCharges: (i.otherCharges || 0).toString(),
            discount: (i.discount || 0).toString(),
            applicationNumber: i.applicationNumber || ''
          }))
        : [{ workItemId: '', workTitle: '', quantity: 1, otherCharges: '0', discount: '0', applicationNumber: '' }],
      amount: work.amount.toString(),
      totalDiscount: (work.totalDiscount || 0).toString(),
      paymentStatus: work.paymentStatus,
      workStatus: work.workStatus,
      notes: work.notes || '',
      applicationFee: work.applicationFee || 0
    });
    setEditingItemId(work._id);
  };

  const handleDeleteWork = async (id) => {
    if (window.confirm('Are you sure you want to delete this work entry?')) {
      try {
        const response = await workAPI.deleteWork(id);
        if (response.data.success) {
          success('Work entry deleted successfully');
          fetchWorks();
        }
      } catch (err) { error('Failed to delete work'); }
    }
  };

  // ── Preset Handlers ────────────────────────────────────────────────────────
  const handleSaveWorkItem = async (e) => {
    e.preventDefault();
    const payload = {
      name: newItem.name.trim(),
      workCharge: Number(newItem.workCharge),
      serviceCharge: Number(newItem.serviceCharge),
      status: newItem.status
    };
    try {
      let response = editingPreset ? await adminAPI.updateWorkItem(editingPreset._id, payload) : await adminAPI.createWorkItem(payload);
      if (response.data.success) {
        success(editingPreset ? 'Work Item updated successfully' : 'Work Item created successfully');
        setNewItem({ name: '', workCharge: '', serviceCharge: '', status: true });
        setEditingPreset(null);
        fetchWorkItems();
      }
    } catch (err) { error('Failed to save Work Item'); }
  };

  const handleEditWorkItem = (item) => {
    setEditingPreset(item);
    setNewItem({
      name: item.name,
      workCharge: item.workCharge?.toString() || '',
      serviceCharge: item.serviceCharge?.toString() || '',
      status: item.status !== undefined ? item.status : item.isActive
    });
  };

  const handleTogglePresetStatus = async (item) => {
    try {
      const response = await adminAPI.updateWorkItem(item._id, {
        status: !item.status,
        workCharge: item.workCharge,
        serviceCharge: item.serviceCharge,
        name: item.name
      });

      if (response.data.success) {
        success(`Work Item marked ${!item.status ? 'Active' : 'Inactive'}`);
        fetchWorkItems();
      }
    } catch (err) {
      error('Failed to update preset status');
    }
  };

  // ── Render Helpers ─────────────────────────────────────────────────────────
  const formatDateTime = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }).replace(/\//g, '-').replace(/, /g, ' ').replace(/am/i, 'AM').replace(/pm/i, 'PM');
  };

  const getStatusBadge = (status, type) => {
    const isPayment = type === 'payment';
    const positive = isPayment ? status === 'Paid' : status === 'Completed';
    return (
      <span style={{ 
        ...styles.badge, 
        backgroundColor: positive ? '#3b8132' : (isPayment ? '#e74c3c' : '#f39c12'), 
        color: 'white',
        borderRadius: '20px'
      }}>
        {type === 'work' ? formatWorkStatus(status) : status}
      </span>
    );
  };

  if (loading && works.length === 0 && activeTab === 'entries') return <Loading text="Loading works..." />;

  return (
    <div className="container-fluid p-0">
      <div className="mb-4">
        <h1 style={{ color: '#3b8132', fontWeight: '700', margin: '0 0 8px 0', letterSpacing: '0.5px' }} className="fs-3">Work Management</h1>
        <p style={{ color: '#666', margin: 0 }}>Review employee entries and configure service pricing</p>
      </div>

      <div className="d-flex flex-wrap gap-2 mb-4">
        <button 
          style={{ 
            ...styles.tab, 
            ...(activeTab === 'entries' ? { backgroundColor: '#3b8132', color: 'white', borderColor: '#3b8132' } : { backgroundColor: 'white', color: '#3b8132', borderColor: '#3b8132' }),
            borderRadius: '10px',
            padding: '12px 24px',
            fontWeight: '700',
            transition: 'all 0.2s ease'
          }} 
          className="flex-grow-1 flex-sm-grow-0" 
          onClick={() => setActiveTab('entries')}
        >
          Employee Work Entries
        </button>
        <button 
          style={{ 
            ...styles.tab, 
            ...(activeTab === 'items' ? { backgroundColor: '#3b8132', color: 'white', borderColor: '#3b8132' } : { backgroundColor: 'white', color: '#3b8132', borderColor: '#3b8132' }),
            borderRadius: '10px',
            padding: '12px 24px',
            fontWeight: '700',
            transition: 'all 0.2s ease'
          }} 
          className="flex-grow-1 flex-sm-grow-0" 
          onClick={() => setActiveTab('items')}
        >
          Admin Work Pricing Presets
        </button>
      </div>

      {activeTab === 'entries' ? (
        <>
          <div style={styles.filtersCard} className="p-3 p-md-4 mb-4">
            <form onSubmit={(e) => { e.preventDefault(); fetchWorks(); }} className="d-flex flex-column gap-3">
              <div className="row g-3">
                <div className="col-12 col-md-4 d-flex flex-column gap-2">
                  <label style={styles.label}>Search</label>
                  <input type="text" name="search" value={filters.search} onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))} placeholder="Customer or title" className="form-control" style={{ borderRadius: '10px' }} />
                </div>
                <div className="col-12 col-sm-6 col-md-4 d-flex flex-column gap-2">
                  <label style={styles.label}>From Date</label>
                  <input type="date" name="startDate" value={filters.startDate} onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value, page: 1 }))} className="form-control" style={{ borderRadius: '10px' }} />
                </div>
                <div className="col-12 col-sm-6 col-md-4 d-flex flex-column gap-2">
                  <label style={styles.label}>To Date</label>
                  <input type="date" name="endDate" value={filters.endDate} onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value, page: 1 }))} className="form-control" style={{ borderRadius: '10px' }} />
                </div>
              </div>
              <div className="row g-3">
                <div className="col-12 col-md-4 d-flex flex-column gap-2">
                  <label style={styles.label}>Employee</label>
                  <select name="employeeId" value={filters.employeeId} onChange={(e) => setFilters(prev => ({ ...prev, employeeId: e.target.value, page: 1 }))} className="form-select" style={{ borderRadius: '10px' }}>
                    <option value="">All Employees</option>
                    {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name} ({emp.employeeId})</option>)}
                  </select>
                </div>
                <div className="col-12 col-sm-6 col-md-4 d-flex flex-column gap-2">
                  <label style={styles.label}>Payment Status</label>
                  <select name="paymentStatus" value={filters.paymentStatus} onChange={(e) => setFilters(prev => ({ ...prev, paymentStatus: e.target.value, page: 1 }))} className="form-select" style={{ borderRadius: '10px' }}>
                    <option value="">All</option>
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
                <div className="col-12 col-sm-6 col-md-4 d-flex flex-column gap-2">
                  <label style={styles.label}>Work Status</label>
                  <select name="workStatus" value={filters.workStatus} onChange={(e) => setFilters(prev => ({ ...prev, workStatus: e.target.value, page: 1 }))} className="form-select" style={{ borderRadius: '10px' }}>
                    <option value="">All</option>
                    <option value="Completed">Completed</option>
                    <option value="In Progress">Pending</option>
                  </select>
                </div>
              </div>
              <div className="d-flex flex-column flex-sm-row gap-2 mt-2">
                <button type="submit" style={styles.searchBtn} className="btn w-100 w-sm-auto text-white">Apply Filters</button>
                <button type="button" style={styles.filterResetBtn} className="btn w-100 w-sm-auto">Reset</button>
              </div>
            </form>
          </div>

          <WorkList
            works={works}
            loading={loading}
            onEdit={handleEditClick}
            onDelete={handleDeleteWork}
            formatDateTime={formatDateTime}
            getStatusBadge={getStatusBadge}
            isAdmin={true}
            isEmployee={false}
            editingItemId={editingItemId}
            renderEditForm={() => (
              <AddWorkForm
                formData={editFormData}
                onSubmit={handleSubmitWork}
                onReset={() => setEditingItemId(null)}
                onInputChange={handleInputChange}
                onItemChange={handleItemChange}
                addItemRow={addItemRow}
                removeItemRow={removeItemRow}
                submitting={submitting}
                workItems={workItems}
                isEditing={true}
              />
            )}
          />

          {pagination.totalWorks > 0 && (
            <div className="p-3 d-flex justify-content-center">
              <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} totalItems={pagination.totalWorks} itemsPerPage={pagination.limit} onPageChange={(page) => setFilters(prev => ({ ...prev, page }))} />
            </div>
          )}
        </>
      ) : (
        <div style={styles.tableCard}>
          <div className="p-3 p-md-4 border-bottom">
            <h3 className="fs-5 mb-3" style={{ color: '#3b8132', fontWeight: 'bold' }}>{editingPreset ? 'Edit Work Item Preset' : 'Add New Work Item Preset'}</h3>
            <form onSubmit={handleSaveWorkItem} className="row g-3 align-items-end">
              <div className="col-12 col-md-3 d-flex flex-column gap-2">
                <label style={styles.label}>Service Name</label>
                <input
                  type="text"
                  required
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="E.g. Logo Design"
                  className="form-control"
                  style={{ borderRadius: '10px' }}
                />
              </div>
              <div className="col-12 col-md-2 d-flex flex-column gap-2">
                <label style={styles.label}>Application Fees (₹)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={newItem.workCharge}
                  onChange={(e) => setNewItem({ ...newItem, workCharge: e.target.value })}
                  placeholder="0.00"
                  className="form-control"
                  style={{ borderRadius: '10px' }}
                />
              </div>
              <div className="col-12 col-md-2 d-flex flex-column gap-2">
                <label style={styles.label}>Service Charge (₹)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={newItem.serviceCharge}
                  onChange={(e) => setNewItem({ ...newItem, serviceCharge: e.target.value })}
                  placeholder="0.00"
                  className="form-control"
                  style={{ borderRadius: '10px' }}
                />
              </div>
              <div className="col-12 col-md-2 d-flex flex-column gap-2">
                <label style={styles.label}>Status</label>
                <select
                  value={newItem.status ? 'active' : 'inactive'}
                  onChange={(e) => setNewItem({ ...newItem, status: e.target.value === 'active' })}
                  className="form-select"
                  style={{ borderRadius: '10px' }}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="col-12 col-md-3 d-flex gap-2">
                <button type="submit" style={presetStyles.addBtn} className="btn w-100 text-white">
                  {editingPreset ? 'Update Preset' : 'Add Preset'}
                </button>
                {editingPreset && (
                  <button type="button" style={styles.resetBtn} className="btn w-100" onClick={() => { setEditingPreset(null); setNewItem({ name: '', workCharge: '', serviceCharge: '', status: true }); }}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th style={styles.th}>Service Name</th>
                  <th style={styles.th}>Application Fees (₹)</th>
                  <th style={styles.th}>Service Charge (₹)</th>
                  <th style={styles.th}>Total (₹)</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {workItems.map(item => (
                  <tr key={item._id}>
                    <td style={styles.td}><strong>{item.name}</strong></td>
                    <td style={styles.td}>₹{item.workCharge?.toLocaleString() || '0'}</td>
                    <td style={styles.td}>₹{item.serviceCharge?.toLocaleString() || '0'}</td>
                    <td style={styles.td}><strong>₹{(item.workCharge + item.serviceCharge)?.toLocaleString() || '0'}</strong></td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        backgroundColor: (item.status !== undefined ? item.status : item.isActive) ? '#3b8132' : '#95a5a6',
                        color: 'white'
                      }}>
                        {(item.status !== undefined ? item.status : item.isActive) ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div className="d-flex gap-2 flex-wrap">
                        <button style={presetStyles.editBtn} className="btn btn-sm text-white" onClick={() => handleEditWorkItem(item)}>
                          Edit
                        </button>
                        <button style={presetStyles.toggleBtn} className="btn btn-sm text-white" onClick={() => handleTogglePresetStatus(item)}>
                          {(item.status !== undefined ? item.status : item.isActive) ? 'Set Inactive' : 'Set Active'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const presetStyles = {
  addBtn: {
    padding: '10px 24px',
    backgroundColor: '#3b8132',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    height: '40px',
    transition: 'all 0.3s ease'
  },
  editBtn: {
    padding: '6px 16px',
    backgroundColor: '#3b8132',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  toggleBtn: {
    padding: '6px 16px',
    backgroundColor: '#ffffff',
    color: '#3b8132',
    border: '1px solid #3b8132',
    borderRadius: '6px',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  }
};

export default AdminWorks;
