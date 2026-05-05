import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { workAPI } from '../services/api';
import { useToast } from '../components/common/Toast';
import { workStyles as styles } from '../components/works/workStyles';
import AddWorkForm from '../components/works/AddWorkForm';

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
  notes: ''
};

const AddWorkPage = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [formData, setFormData] = useState(defaultFormData);
  const [submitting, setSubmitting] = useState(false);
  const [workItems, setWorkItems] = useState([]);

  useEffect(() => {
    fetchWorkItems();
  }, []);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      const currentAmount = parseFloat(updated.amount) || 0;

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

      // Sync totalAmount state
      if (updated.paymentMethod === 'Both') {
        updated.totalAmount = (parseFloat(updated.gpayAmount || 0) + parseFloat(updated.cashAmount || 0)).toString();
      } else {
        updated.totalAmount = currentAmount.toString();
      }

      return updated;
    });
  };

  const handleItemChange = (index, field, value) => {
    let newItems = [...formData.items];

    if (field === 'workItemId' && value !== '') {
      const existingIndex = newItems.findIndex((item, i) => i !== index && item.workItemId === value);
      if (existingIndex !== -1) {
        newItems[existingIndex].quantity = (parseInt(newItems[existingIndex].quantity) || 1) + 1;
        if (newItems.length > 1) {
          newItems.splice(index, 1);
        } else {
          newItems[index] = { workItemId: '', workTitle: '', quantity: 1, otherCharges: '0', discount: '0', applicationNumber: '' };
        }
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
    }, { total: 0, discountTotal: 0 });
    setFormData(prev => {
      const updated = { 
        ...prev, 
        items: newItems, 
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
          // If split, we don't know how to auto-split perfectly, 
          // but we should probably update totalAmount at least.
          const gpay = parseFloat(updated.gpayAmount) || 0;
          const cash = parseFloat(updated.cashAmount) || 0;
          updated.totalAmount = (gpay + cash).toString();
        }
      }

      return updated;
    });
  };

  const addItemRow = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { workItemId: '', workTitle: '', quantity: 1, otherCharges: '0', discount: '0', applicationNumber: '' }]
    }));
  };

  const removeItemRow = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
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
    }, { total: 0, discountTotal: 0 });

    setFormData(prev => {
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

  const handleReset = () => {
    setFormData({ ...defaultFormData, date: new Date().toISOString().split('T')[0], time: getCurrentTime() });
  };

  const handleSubmit = async (e) => {
    if (formData.paymentStatus === 'Paid') {
      const finalAmount = parseFloat(formData.amount) || 0;
      const gpay = parseFloat(formData.gpayAmount) || 0;
      const cash = parseFloat(formData.cashAmount) || 0;

      if (formData.paymentMethod === 'Both') {
        if (Math.abs((gpay + cash) - finalAmount) > 0.01) {
          error(`GPay + Cash (₹${(gpay + cash).toFixed(2)}) must equal Final Amount (₹${finalAmount.toFixed(2)})`);
          return;
        }
      } else if (formData.paymentMethod === 'GPay') {
        if (Math.abs(gpay - finalAmount) > 0.01) {
          error(`GPay amount must equal Final Amount (₹${finalAmount.toFixed(2)})`);
          return;
        }
      } else if (formData.paymentMethod === 'Cash') {
        if (Math.abs(cash - finalAmount) > 0.01) {
          error(`Cash amount must equal Final Amount (₹${finalAmount.toFixed(2)})`);
          return;
        }
      }
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        totalAmount: formData.paymentStatus === 'Paid' ? formData.amount : '0',
        date: new Date(`${formData.date}T${formData.time || '00:00'}`)
      };

      const response = await workAPI.createWork(payload);
      if (response.data.success) {
        success('Work entry created successfully');
        handleReset();
        navigate('/employee/works');
      }
    } catch (err) {
      console.error('Error saving work:', err);
      error(err.response?.data?.message || 'Failed to save work');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-fluid p-0">
      <div className="mb-4">
        <h1 style={styles.title} className="fs-3">Add Work</h1>
        <p style={styles.subtitle} className="mb-0">Enter new work details</p>
      </div>

      <AddWorkForm
        formData={formData}
        onSubmit={handleSubmit}
        onReset={handleReset}
        onInputChange={handleInputChange}
        onItemChange={handleItemChange}
        addItemRow={addItemRow}
        removeItemRow={removeItemRow}
        submitting={submitting}
        workItems={workItems}
      />
      
      <div className="mt-3">
        <button 
          className="btn btn-secondary" 
          onClick={() => navigate('/employee/works')}
        >
          Cancel & View List
        </button>
      </div>
    </div>
  );
};

export default AddWorkPage;
