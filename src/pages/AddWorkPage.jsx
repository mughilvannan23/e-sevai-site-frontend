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
  paymentMethod: 'Hand Cash',
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
      if (name === 'paymentStatus' && value === 'Pending') {
        updated.paymentMethod = '';
      } else if (name === 'paymentStatus' && value === 'Paid' && !prev.paymentMethod) {
        updated.paymentMethod = 'Hand Cash';
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
    setFormData(prev => ({ ...prev, items: newItems, amount: total.toString(), totalDiscount: discountTotal.toString() }));
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

    setFormData(prev => ({
      ...prev,
      items: newItems.length ? newItems : [{ workItemId: '', workTitle: '', quantity: 1, otherCharges: '0', discount: '0', applicationNumber: '' }],
      amount: total.toString(),
      totalDiscount: discountTotal.toString()
    }));
  };

  const handleReset = () => {
    setFormData({ ...defaultFormData, date: new Date().toISOString().split('T')[0], time: getCurrentTime() });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        ...formData,
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
