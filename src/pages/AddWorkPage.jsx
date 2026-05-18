import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { workAPI } from '../services/api';
import { useToast } from '../components/common/Toast';
import { workStyles as styles } from '../components/works/workStyles';
import AddWorkForm from '../components/works/AddWorkForm';
import WorkPreviewModal from '../components/works/WorkPreviewModal';

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
  items: [{ workItemId: '', workTitle: '', quantity: 1, otherCharges: '0', presetAmount: '0', presetChargeType: 'None', discount: '0', applicationNumber: '' }],
  amount: '',
  totalDiscount: '0',
  paymentStatus: 'Pending',
  workStatus: 'In Progress',
  notes: '',
  applicationFee: 0
};

const AddWorkPage = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [formData, setFormData] = useState(defaultFormData);
  const [submitting, setSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [workItems, setWorkItems] = useState([]);
  const [shopBalance, setShopBalance] = useState(0);
  const [gpayBalance, setGpayBalance] = useState(0);

  useEffect(() => {
    fetchWorkItems();
    fetchShopBalance();
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

  const fetchShopBalance = async () => {
    try {
      const response = await workAPI.getShopBalance();
      if (response.data.success) {
        setShopBalance(response.data.shopBalance);
        setGpayBalance(response.data.gpayBalance);
      }
    } catch (err) {
      console.error('Error fetching shop balance:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };

      // Recalculate amount if applicationFee changes or if it's already there
      const { total, discountTotal, appFeeTotal } = updated.items.reduce((acc, item) => {
        const qty = parseInt(item.quantity) || 1;
        const otherC = parseFloat(item.otherCharges) || 0;
        const presetC = parseFloat(item.presetAmount) || 0;
        const itemDisc = parseFloat(item.discount) || 0;
        let rowCost = otherC + presetC - itemDisc;
        if (item.workItemId) {
          const wi = workItems.find(w => w._id === item.workItemId);
          rowCost += (wi ? (wi.workCharge + wi.serviceCharge) * qty : 0);
        }
        acc.total += rowCost;
        acc.discountTotal += itemDisc;
        acc.appFeeTotal += presetC;
        return acc;
      }, { total: 0, discountTotal: 0, appFeeTotal: 0 });

      updated.amount = total.toString();
      updated.totalDiscount = discountTotal.toString();
      updated.applicationFee = appFeeTotal;

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
      const selectedWI = workItems.find(w => w._id === value);
      newItems[index] = { 
        ...newItems[index], 
        [field]: value,
        presetChargeType: selectedWI ? selectedWI.chargeType : 'None',
        presetAmount: '0' 
      };
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }

    const { total, discountTotal, appFeeTotal } = newItems.reduce((acc, item) => {
      const qty = parseInt(item.quantity) || 1;
      const otherC = parseFloat(item.otherCharges) || 0;
      const presetC = parseFloat(item.presetAmount) || 0;
      const itemDisc = parseFloat(item.discount) || 0;
      let rowCost = otherC + presetC - itemDisc;
      if (item.workItemId) {
        const wi = workItems.find(w => w._id === item.workItemId);
        rowCost += (wi ? (wi.workCharge + wi.serviceCharge) * qty : 0);
      }
      acc.total += rowCost;
      acc.discountTotal += itemDisc;
      acc.appFeeTotal += presetC;
      return acc;
    }, { total: 0, discountTotal: 0, appFeeTotal: 0 });
    setFormData(prev => {
      const updated = {
        ...prev,
        items: newItems,
        amount: total.toString(),
        totalDiscount: discountTotal.toString(),
        applicationFee: appFeeTotal
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
      items: [...prev.items, { workItemId: '', workTitle: '', quantity: 1, otherCharges: '0', presetAmount: '0', presetChargeType: 'None', discount: '0', applicationNumber: '' }]
    }));
  };

  const removeItemRow = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    const { total, discountTotal, appFeeTotal } = newItems.reduce((acc, item) => {
      const qty = parseInt(item.quantity) || 1;
      const otherC = parseFloat(item.otherCharges) || 0;
      const presetC = parseFloat(item.presetAmount) || 0;
      const itemDisc = parseFloat(item.discount) || 0;
      let rowCost = otherC + presetC - itemDisc;
      if (item.workItemId) {
        const wi = workItems.find(w => w._id === item.workItemId);
        rowCost += (wi ? (wi.workCharge + wi.serviceCharge) * qty : 0);
      }
      acc.total += rowCost;
      acc.discountTotal += itemDisc;
      acc.appFeeTotal += presetC;
      return acc;
    }, { total: 0, discountTotal: 0, appFeeTotal: 0 });

    setFormData(prev => {
      const updated = {
        ...prev,
        items: newItems.length ? newItems : [{ workItemId: '', workTitle: '', quantity: 1, otherCharges: '0', discount: '0', applicationNumber: '' }],
        amount: total.toString(),
        totalDiscount: discountTotal.toString(),
        applicationFee: appFeeTotal
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
    e.preventDefault();

    let finalGpay = 0;
    let finalCash = 0;
    const currentAmount = parseFloat(formData.amount) || 0;

    if (formData.paymentStatus === 'Paid') {
      if (formData.paymentMethod === 'Both') {
        const gpay = parseFloat(formData.gpayAmount) || 0;
        const cash = parseFloat(formData.cashAmount) || 0;
        if (Math.abs((gpay + cash) - currentAmount) > 0.01) {
          error(`GPay + Cash (₹${(gpay + cash).toFixed(2)}) must equal Final Amount (₹${currentAmount.toFixed(2)})`);
          return;
        }
      }
    }

    setShowPreview(true);
  };

  const handleConfirmSubmit = async () => {
    setShowPreview(false);

    let finalGpay = 0;
    let finalCash = 0;
    const currentAmount = parseFloat(formData.amount) || 0;

    if (formData.paymentStatus === 'Paid') {
      if (formData.paymentMethod === 'GPay') {
        finalGpay = currentAmount;
        finalCash = 0;
      } else if (formData.paymentMethod === 'Cash') {
        finalCash = currentAmount;
        finalGpay = 0;
      } else if (formData.paymentMethod === 'Both') {
        finalGpay = parseFloat(formData.gpayAmount) || 0;
        finalCash = parseFloat(formData.cashAmount) || 0;
      }
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        gpayAmount: finalGpay,
        cashAmount: finalCash,
        totalAmount: formData.paymentStatus === 'Paid' ? currentAmount : 0,
        amount: currentAmount,
        date: new Date(`${formData.date}T${formData.time || '00:00'}`)
      };

      console.log("Submitting Work Data:", payload);

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
      <div className="mb-2">
        <h1 style={{ color: '#3b8132', fontWeight: '700', margin: '0', letterSpacing: '0.5px' }} className="fs-5">New Sales Entry</h1>
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
        shopBalance={shopBalance}
        gpayBalance={gpayBalance}
      />

      <WorkPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        onConfirm={handleConfirmSubmit}
        formData={formData}
        workItems={workItems}
      />

      <div className="mt-1">
        <button
          className="btn btn-sm"
          style={{ backgroundColor: 'white', color: '#3b8132', border: '1px solid #3b8132', borderRadius: '8px', fontWeight: '600', padding: '4px 16px' }}
          onClick={() => navigate('/employee/works')}
        >
          Cancel & View All Entries
        </button>
      </div>
    </div>
  );
};

export default AddWorkPage;
