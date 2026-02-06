// frontend/src/pages/EditOrderPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderAPI, schoolAPI } from '../../api/api.js';

const EditOrderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    orderItems: [],
    kitItems: [],
    discount: 0,
    toAddress: {}
  });
  const [originalOrder, setOriginalOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [school, setSchool] = useState(null);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getOrder(id);
      const order = response.data;
      
      if (!order.isEditable) {
        alert('This order cannot be edited as it has been dispatched or delivered.');
        navigate(`/orders/${id}`);
        return;
      }

      setOriginalOrder(order);
      setFormData({
        orderItems: order.orderItems || [],
        kitItems: order.kitItems || [],
        discount: order.discount || 0,
        toAddress: order.toAddress || {}
      });
      setSchool(order.school);
    } catch (error) {
      console.error('Error fetching order:', error);
      alert('Failed to load order for editing');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  // Reuse the calculate totals functions from CreateOrderPage
  const calculateTotals = () => {
    const calculateItemTotal = (items) => {
      return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    };

    const orderTotal = calculateItemTotal(formData.orderItems);
    const kitTotal = calculateItemTotal(formData.kitItems);
    const subtotal = orderTotal + kitTotal;
    const total = Math.max(0, subtotal - formData.discount);

    return { orderTotal, kitTotal, subtotal, total };
  };

  const { orderTotal, kitTotal, subtotal, total } = calculateTotals();

  // Reuse item update functions from CreateOrderPage
  const updateItem = (index, field, value, type = 'order') => {
    const items = type === 'order' ? [...formData.orderItems] : [...formData.kitItems];
    const numericValue = parseFloat(value) || 0;
    items[index][field] = numericValue;

    if (field === 'quantity' || field === 'unitPrice') {
      items[index].totalPrice = items[index].quantity * items[index].unitPrice;
    }

    if (type === 'order') {
      setFormData(prev => ({ ...prev, orderItems: items }));
    } else {
      setFormData(prev => ({ ...prev, kitItems: items }));
    }
  };

  const removeItem = (index, type = 'order') => {
    if (type === 'order') {
      setFormData(prev => ({
        ...prev,
        orderItems: prev.orderItems.filter((_, i) => i !== index)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        kitItems: prev.kitItems.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.orderItems.length === 0) {
      alert('Please add at least one book');
      return;
    }

    // Check if all items have unit price
    const itemsWithoutPrice = formData.orderItems.filter(item => item.unitPrice <= 0);
    if (itemsWithoutPrice.length > 0) {
      alert('Please set unit price for all book items');
      return;
    }

    const kitsWithoutPrice = formData.kitItems.filter(item => item.unitPrice <= 0);
    if (kitsWithoutPrice.length > 0) {
      alert('Please set unit price for all kit items');
      return;
    }

    setSaving(true);
    try {
      await orderAPI.updateOrder(id, formData);
      alert('Order updated successfully!');
      navigate(`/orders/${id}`);
    } catch (error) {
      console.error('Error updating order:', error);
      alert(`Error: ${error.message || error}`);
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading order...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 bg-gradient-to-r from-[#0B234A] to-[#1a3a6a] rounded-2xl shadow-xl p-8 text-white">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-6 lg:space-y-0">
            <div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate(`/orders/${id}`)}
                  className="text-blue-200 hover:text-white transition-colors"
                >
                  ← Back to Order
                </button>
                <h1 className="text-3xl font-bold">Edit Order</h1>
              </div>
              <div className="mt-4">
                <p className="text-blue-200">Editing order for {school?.name}</p>
                <p className="text-blue-200">Invoice: {originalOrder?.invoiceNumber || 'Pending'}</p>
              </div>
            </div>
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
              <p className="text-yellow-200">
                Note: Only orders with 'Pending' or 'Processing' dispatch status can be edited
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Books & Kits */}
            <div className="lg:col-span-2 space-y-8">
              {/* Books Section */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Books</h2>
                {formData.orderItems.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {formData.orderItems.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm">{item.bookType}</td>
                            <td className="px-4 py-3">
                              <p className="font-medium">
                                {item.isComboPack ? `${item.grade} Combo Pack` : 
                                 item.bookName || `${item.bookType} ${item.grade}`}
                              </p>
                              {item.grade && <p className="text-sm text-gray-500">Grade: {item.grade}</p>}
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateItem(index, 'quantity', e.target.value, 'order')}
                                className="w-20 px-2 py-1 border border-gray-300 rounded"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                min="0"
                                value={item.unitPrice}
                                onChange={(e) => updateItem(index, 'unitPrice', e.target.value, 'order')}
                                className="w-32 px-2 py-1 border border-gray-300 rounded"
                              />
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold">
                              {formatCurrency(item.totalPrice)}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                type="button"
                                onClick={() => removeItem(index, 'order')}
                                className="text-red-600 hover:text-red-800"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No books added</p>
                    <p className="text-sm text-gray-400 mt-2">Books cannot be added in edit mode</p>
                  </div>
                )}
              </div>

              {/* Kits Section */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Kits</h2>
                {formData.kitItems.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kit Type</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {formData.kitItems.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm">{item.kitType}</td>
                            <td className="px-4 py-3">
                              <p className="font-medium">{item.kitName}</p>
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateItem(index, 'quantity', e.target.value, 'kit')}
                                className="w-20 px-2 py-1 border border-gray-300 rounded"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                min="0"
                                value={item.unitPrice}
                                onChange={(e) => updateItem(index, 'unitPrice', e.target.value, 'kit')}
                                className="w-32 px-2 py-1 border border-gray-300 rounded"
                              />
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold">
                              {formatCurrency(item.totalPrice)}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                type="button"
                                onClick={() => removeItem(index, 'kit')}
                                className="text-red-600 hover:text-red-800"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No kits added</p>
                  </div>
                )}
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Shipping Address</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={formData.toAddress.name || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        toAddress: { ...prev.toAddress, name: e.target.value }
                      }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea
                      value={formData.toAddress.address || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        toAddress: { ...prev.toAddress, address: e.target.value }
                      }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows="3"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        value={formData.toAddress.city || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          toAddress: { ...prev.toAddress, city: e.target.value }
                        }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                      <input
                        type="text"
                        value={formData.toAddress.pincode || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          toAddress: { ...prev.toAddress, pincode: e.target.value }
                        }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Summary & Actions */}
            <div className="space-y-8">
              {/* Order Summary */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Books Total:</span>
                    <span className="font-medium">{formatCurrency(orderTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kits Total:</span>
                    <span className="font-medium">{formatCurrency(kitTotal)}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-3">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Discount:</span>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                        max={subtotal}
                        value={formData.discount}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          discount: parseFloat(e.target.value) || 0
                        }))}
                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-right"
                      />
                      <span className="text-sm text-gray-500">₹</span>
                    </div>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-3">
                    <span className="text-lg font-semibold">Total Amount:</span>
                    <span className="text-2xl font-bold text-blue-600">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Actions</h2>
                <div className="space-y-4">
                  <button
                    type="submit"
                    disabled={saving || formData.orderItems.length === 0}
                    className={`w-full py-4 px-6 rounded-lg font-medium transition-colors ${
                      saving || formData.orderItems.length === 0
                        ? 'bg-gray-400 cursor-not-allowed text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {saving ? 'Saving Changes...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/orders/${id}`)}
                    className="w-full py-4 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <div className="text-sm text-gray-500 pt-4 border-t border-gray-200">
                    <p className="font-medium">Note:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Only quantity, price, and address can be updated</li>
                      <li>New items cannot be added in edit mode</li>
                      <li>Discount cannot exceed total amount</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Original Order Info */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
                <h3 className="font-semibold text-yellow-800 mb-3">Original Order</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-yellow-700">Original Total:</span>
                    <span className="font-medium">{formatCurrency(originalOrder?.totalAmount || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-yellow-700">Items Count:</span>
                    <span>{originalOrder?.orderItems?.length || 0} books, {originalOrder?.kitItems?.length || 0} kits</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-yellow-700">Created:</span>
                    <span>{new Date(originalOrder?.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditOrderPage;