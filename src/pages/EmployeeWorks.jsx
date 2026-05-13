import React, { useState, useEffect, useRef } from 'react';
import { workAPI } from '../services/api';
import Loading from '../components/common/Loading';
import Pagination from '../components/common/Pagination';
import { useToast } from '../components/common/Toast';
import { useLocation, useNavigate } from 'react-router-dom';
import { formatWorkStatus } from '../utils/formatters';
import { workStyles as styles } from '../components/works/workStyles';
import WorkList from '../components/works/WorkList';

const EmployeeWorks = () => {
  const location = useLocation();
  const tableRef = useRef(null);
  const navigate = useNavigate();
  const [shouldScroll, setShouldScroll] = useState(false);

  // ── Table state ────────────────────────────────────────────────────────────
  const [works, setWorks] = useState([]);
  const [workItems, setWorkItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    date: '',
    status: '',
    searchName: '',
    searchPhone: '',
    paymentStatus: ''
  });


  const { success, error } = useToast();

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchWorks();
    fetchWorkItems();
  }, [filters.page, filters.limit, filters.status, filters.paymentStatus]);

  useEffect(() => {
    if (shouldScroll && !loading && works.length > 0) {
      tableRef.current?.scrollIntoView({ behavior: 'smooth' });
      setShouldScroll(false);
    }
  }, [works, loading, shouldScroll]);

  useEffect(() => {
    const state = location.state;
    if (state) {
      const newFilters = {
        page: 1,
        limit: 10,
        date: '',
        status: state.status || '',
        paymentStatus: state.paymentStatus || '',
        searchName: '',
        searchPhone: ''
      };
      setFilters(newFilters);
      fetchWorksWithFilters(newFilters);
      setShouldScroll(true);
    }
  }, [location.state]);

  // ── API helpers ────────────────────────────────────────────────────────────
  const fetchWorkItems = async () => {
    try {
      const response = await workAPI.getActiveWorkItems();
      if (response.data.success) {
        setWorkItems(response.data.workItems);
      }
    } catch (err) {
      console.error('Error fetching work items:', err);
    }
  };

  const fetchWorks = async () => {
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

      const response = await workAPI.getMyWorks(params);
      if (response.data.success) {
        setWorks(response.data.works);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      console.error('Error fetching works:', err);
      error('Failed to fetch works');
    } finally {
      setLoading(false);
    }
  };

  const fetchWorksWithFilters = async (filterParams) => {
    try {
      setLoading(true);
      const params = {};
      Object.keys(filterParams).forEach(key => {
        if (filterParams[key] && key !== 'page' && key !== 'limit') {
          params[key] = filterParams[key];
        }
      });
      params.page = filterParams.page;
      params.limit = filterParams.limit;

      const response = await workAPI.getMyWorks(params);
      if (response.data.success) {
        setWorks(response.data.works);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      console.error('Error fetching works:', err);
      error('Failed to fetch works');
    } finally {
      setLoading(false);
    }
  };

  // ── Table handlers ─────────────────────────────────────────────────────────
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchWorks();
  };

  // Apply frontend filters to works list
  const getFilteredWorks = () => {
    return works.filter(work => {
      if (filters.searchName && !work.customerName?.toLowerCase().includes(filters.searchName.toLowerCase())) {
        return false;
      }
      if (filters.searchPhone && !work.customerPhone?.includes(filters.searchPhone)) {
        return false;
      }
      if (filters.paymentStatus && work.paymentStatus !== filters.paymentStatus) {
        return false;
      }
      return true;
    });
  };

  // ── Print ──────────────────────────────────────────────────────────────────
  const handlePrint = (work) => {
    const printWindow = window.open('', '_blank');

    const totalPresetAmount = work.items?.reduce((sum, i) => sum + (i.presetAmount || 0), 0) || 0;
    const itemsHtml = work.items?.length
      ? work.items.map(i => {
        const qty = i.quantity || 1;
        const price = (i.workChargeAtTime || 0) + (i.serviceChargeAtTime || 0);
        const presetAmt = i.presetAmount || 0;
        const otherC = i.otherCharges || 0;
        const itemDiscount = i.discount || 0;
        const subtotal = (qty * price) + presetAmt + otherC - itemDiscount;

        const chargeLabel = i.presetChargeType && i.presetChargeType !== 'None' ? i.presetChargeType : 'Amt';

        return `
          <div class="row">
            <span class="bold">${i.title}</span>
            <span class="bold">₹${subtotal.toLocaleString()}</span>
          </div>
          ${price > 0 ? `<div class="row small-text"><span>Rate:</span><span>${qty} x ₹${price} = ₹${qty * price}</span></div>` : ''}
          ${presetAmt > 0 ? `<div class="row small-text"><span>${chargeLabel}:</span><span>₹${presetAmt.toLocaleString()}</span></div>` : ''}
          ${otherC > 0 ? `<div class="row small-text"><span>Other:</span><span>₹${otherC.toLocaleString()}</span></div>` : ''}
          ${itemDiscount > 0 ? `<div class="row small-text"><span>Discount:</span><span>-₹${itemDiscount.toLocaleString()}</span></div>` : ''}
          ${i.applicationNumber
            ? `<div class="row small-text"><span>App No:</span><span>${i.applicationNumber}</span></div>`
            : ''
          }
        `;
      }).join('')
      : '';

    const content = `
  <html>
  <head>
    <style>
      body { width: 280px; font-family: 'Courier New', Courier, monospace; font-size: 12px; padding: 10px; color: #000; }
      .center { text-align: center; }
      .bold { font-weight: bold; }
      .line { border-top: 1px dashed #000; margin: 8px 0; }
      .row { display: flex; justify-content: space-between; margin: 4px 0; }
      .header-title { font-size: 16px; font-weight: bold; text-align: center; line-height: 1.2; }
      .small-text { font-size: 11px; color: #333; }
      .total-section { margin-top: 10px; border-top: 1px solid #000; padding-top: 5px; }
    </style>
  </head>
  <body>
    <div class="header-title">SEVAGAN CSC &<br/>E-SEVA CENTRE</div>
    <div class="center small-text">Tiruchirappalli, Tamil Nadu</div>
    <div class="line"></div>

    <div class="row">
      <span>Date: ${new Date(work.date).toLocaleDateString('en-IN')}</span>
      <span>Time: ${new Date(work.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
    </div>

    <div class="line"></div>
    <div><span class="bold">Customer:</span> ${work.customerName}</div>
    ${work.customerPhone ? `<div><span class="bold">Phone:</span> ${work.customerPhone}</div>` : ''}

    <div class="line"></div>
    <div class="bold row"><span>Description</span><span>Amount</span></div>
    <div class="line" style="margin-top: 2px;"></div>

    ${itemsHtml}

    <div class="total-section">
      ${totalPresetAmount > 0 ? `<div class="row"><span>Recharge/Transfer Total:</span><span>₹${totalPresetAmount.toLocaleString()}</span></div>` : ''}
      ${work.totalDiscount > 0 ? `<div class="row"><span>Total Discount:</span><span>-₹${work.totalDiscount.toLocaleString()}</span></div>` : ''}
      <div class="row bold" style="font-size: 14px;"><span>FINAL PAYABLE</span><span>₹${(work.totalAmount || work.amount || 0).toLocaleString()}</span></div>
    </div>

    <div class="line"></div>
    

    <div class="line"></div>
    <div class="center bold">Thank You! Visit Again 🙏</div>

  </body>
  </html>`;

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  };

    // <div class="center small-text" style="margin-top: 5px;">* Software generated bill *</div>
  // <div class="row small-text">
  //   //   <span>Payment Method:</span>
  //   //   <span>${work.paymentMethod || 'Cash'}</span>
  //   // </div>
    // ${work.paymentMethod === 'Both' ? `
    //   <div class="row small-text"><span>GPay Portion:</span><span>₹${work.gpayAmount || 0}</span></div>
    //   <div class="row small-text"><span>Cash Portion:</span><span>₹${work.cashAmount || 0}</span></div>
    // ` : ''}
    
    // ${work.notes ? `<div class="line"></div><div class="small-text"><span class="bold">Notes:</span> ${work.notes}</div>` : ''}

  const formatDateTime = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    }).replace(/\//g, '-').replace(/, /g, ' ').replace(/am/i, 'AM').replace(/pm/i, 'PM');
  };

  const getStatusBadge = (status, type) => {
    const isPayment = type === 'payment';
    const positive = isPayment ? status === 'Paid' : status === 'Completed';
    return (
      <span style={{
        ...styles.badge,
        backgroundColor: positive ? 'var(--success-color)' : (isPayment ? 'var(--danger-color)' : 'var(--warning-color)'),
        color: 'white'
      }}>
        {type === 'work' ? formatWorkStatus(status) : status}
      </span>
    );
  };

  if (loading && works.length === 0) {
    return <Loading text="Loading works..." />;
  }

  return (
    <div className="container-fluid p-0">
      <div className="mb-4">
        <h1 style={{ color: '#3b8132', fontWeight: '700', margin: '0 0 8px 0', letterSpacing: '0.5px' }} className="fs-3">My Sales Entries</h1>
        <p style={{ color: '#666', margin: 0 }} className="mb-0">Manage and track your work entries</p>
      </div>

      <div className="d-flex justify-content-end mb-4">
        <button
          className="btn"
          style={{ backgroundColor: '#3b8132', color: 'white', borderRadius: '10px', fontWeight: '700', padding: '10px 24px', boxShadow: '0 4px 10px rgba(59, 129, 50, 0.2)' }}
          onClick={() => navigate('/add-work')}
        >
          ➕ Add New Work
        </button>
      </div>

      <div style={styles.filtersCard} className="p-3 p-md-4 mb-4">
        <form onSubmit={handleSearch} className="d-flex flex-column gap-3">
          <div className="row g-3">
            <div className="col-12 col-md-4 d-flex flex-column gap-2">
              <label style={styles.label}>Date</label>
              <input type="date" name="date" value={filters.date} onChange={handleFilterChange} className="form-control" />
            </div>
            <div className="col-12 col-md-4 d-flex flex-column gap-2">
              <label style={styles.label}>Work Status</label>
              <select name="status" value={filters.status} onChange={handleFilterChange} className="form-select">
                <option value="">All</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            <div className="col-12 col-md-4 d-flex flex-column gap-2">
              <label style={styles.label}>Payment Status</label>
              <select name="paymentStatus" value={filters.paymentStatus} onChange={handleFilterChange} className="form-select">
                <option value="">All</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            <div className="col-12 col-md-6 d-flex flex-column gap-2">
              <label style={styles.label}>Customer Name</label>
              <input type="text" name="searchName" value={filters.searchName} onChange={handleFilterChange} className="form-control" placeholder="Search customer name..." />
            </div>
            <div className="col-12 col-md-6 d-flex flex-column gap-2">
              <label style={styles.label}>Customer Phone</label>
              <input type="text" name="searchPhone" value={filters.searchPhone} onChange={handleFilterChange} className="form-control" placeholder="Search phone number..." />
            </div>
          </div>
          <div className="d-flex flex-column flex-sm-row gap-2 mt-1">
            <button type="submit" style={styles.searchBtn} className="btn w-100 w-sm-auto text-white">Search</button>
            <button type="button" style={styles.filterResetBtn} className="btn w-100 w-sm-auto text-white" onClick={() => setFilters({ page: 1, limit: 10, date: '', status: '', searchName: '', searchPhone: '', paymentStatus: '' })}>Reset</button>
          </div>
        </form>
      </div>

      <WorkList
        works={getFilteredWorks()}
        loading={loading}
        onEdit={() => { }} // Disabled for employee
        onDelete={() => { }} // Disabled for employee
        onPrint={handlePrint}
        formatDateTime={formatDateTime}
        getStatusBadge={getStatusBadge}
        isAdmin={false}
        isEmployee={true}
        tableRef={tableRef}
      />

      {pagination.totalWorks > 0 && (
        <div className="p-3 d-flex justify-content-center">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalWorks}
            itemsPerPage={pagination.limit}
            onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
          />
        </div>
      )}
    </div>
  );
};

export default EmployeeWorks;
