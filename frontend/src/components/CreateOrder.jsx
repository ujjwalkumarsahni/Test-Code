import React, { useState } from 'react';
import { orderAPI, orderUtils, bookCatalogUtils } from '../services/api';

const CreateOrder = () => {
  const [formData, setFormData] = useState({
    school: '',
    academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
    orderItems: [],
    kitItems: orderUtils.getDefaultKitItems(),
    discount: 0,
    toAddress: {},
  });

  const [bookType, setBookType] = useState('ELP');
  const [grade, setGrade] = useState('Pre-Nursery');

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate data
    const validation = orderUtils.validateOrderData(formData);
    if (!validation.isValid) {
      alert('Please fix validation errors');
      return;
    }

    try {
      const response = await orderAPI.createOrder(formData);
      console.log('Order created:', response.data);
      alert('Order created successfully!');
    } catch (error) {
      console.error('Error creating order:', error);
      alert(`Error: ${error}`);
    }
  };

  // Add book item
  const addBookItem = () => {
    const defaultPrice = bookCatalogUtils.getDefaultPrice(bookType, grade);
    const newItem = {
      bookType,
      grade,
      quantity: 1,
      unitPrice: defaultPrice,
      totalPrice: defaultPrice,
    };

    setFormData(prev => ({
      ...prev,
      orderItems: [...prev.orderItems, newItem],
    }));
  };

  // Add individual kit
  const addIndividualKit = () => {
    const newKit = {
      kitType: 'Individual Kit',
      kitName: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
    };

    setFormData(prev => ({
      ...prev,
      kitItems: [...prev.kitItems, newKit],
    }));
  };

  // Calculate totals
  const subtotal = orderUtils.calculateSubtotal(formData.orderItems, formData.kitItems);
  const total = orderUtils.calculateFinalTotal(subtotal, formData.discount);

  return (
    <form onSubmit={handleSubmit}>
      {/* School selection */}
      <div>
        <label>Select School:</label>
        <SchoolDropdown onSelect={(schoolId) => 
          setFormData(prev => ({ ...prev, school: schoolId }))
        } />
      </div>

      {/* Book type selection */}
      <div>
        <label>Book Type:</label>
        <select value={bookType} onChange={(e) => setBookType(e.target.value)}>
          <option value="ELP">ELP</option>
          <option value="LTE">LTE</option>
          <option value="CAC">CAC</option>
          <option value="CTF">CTF</option>
        </select>
      </div>

      {/* Grade selection */}
      <div>
        <label>Grade:</label>
        <select value={grade} onChange={(e) => setGrade(e.target.value)}>
          {bookCatalogUtils.getGradesByBookType(bookType).map(g => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>

      {/* Add book button */}
      <button type="button" onClick={addBookItem}>
        Add Book Item
      </button>

      {/* Display order items */}
      {formData.orderItems.map((item, index) => (
        <div key={index}>
          <span>{item.bookType} - {item.grade}</span>
          <input 
            type="number" 
            value={item.quantity}
            onChange={(e) => updateItem(index, 'quantity', e.target.value)}
          />
          <input 
            type="number" 
            value={item.unitPrice}
            onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
          />
          <span>Total: {orderUtils.formatCurrency(item.totalPrice)}</span>
        </div>
      ))}

      {/* Kits section */}
      <div>
        <h3>Kits</h3>
        {formData.kitItems.map((kit, index) => (
          <div key={index}>
            {/* Kit inputs */}
          </div>
        ))}
        <button type="button" onClick={addIndividualKit}>
          Add Individual Kit
        </button>
      </div>

      {/* Discount */}
      <div>
        <label>Discount:</label>
        <input 
          type="number"
          value={formData.discount}
          onChange={(e) => setFormData(prev => ({ 
            ...prev, 
            discount: parseFloat(e.target.value) || 0 
          }))}
        />
      </div>

      {/* Totals */}
      <div>
        <h4>Subtotal: {orderUtils.formatCurrency(subtotal)}</h4>
        <h4>Discount: {orderUtils.formatCurrency(formData.discount)}</h4>
        <h3>Total: {orderUtils.formatCurrency(total)}</h3>
      </div>

      <button type="submit">Create Order</button>
    </form>
  );
};

export default CreateOrder;