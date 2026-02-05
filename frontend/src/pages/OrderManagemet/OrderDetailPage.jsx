// frontend/src/pages/OrderDetailPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { orderAPI } from "../../api/api.js";
import {
  ArrowLeft,
  Edit,
  Save,
  X,
  Printer,
  Download,
  Truck,
  CheckCircle,
  AlertCircle,
  Package,
  BookOpen,
} from "lucide-react";

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = window.location.pathname.includes("/edit");
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(isEditMode);
  const [formData, setFormData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [updatingDispatch, setUpdatingDispatch] = useState(false);

  // Fetch order details
  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getOrder(id);
      setOrder(response.data);
      setFormData(response.data);
    } catch (error) {
      console.error("Error fetching order:", error);
      alert("Failed to load order details");
      navigate("/orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  // Handle form changes
  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleItemUpdate = (index, field, value, type = "order") => {
    const items = type === "order" 
      ? [...formData.orderItems] 
      : [...formData.kitItems];
    
    items[index][field] = parseFloat(value) || 0;
    
    // Recalculate total price
    if (field === "quantity" || field === "unitPrice") {
      items[index].totalPrice = items[index].quantity * items[index].unitPrice;
    }
    
    if (type === "order") {
      setFormData(prev => ({ ...prev, orderItems: items }));
    } else {
      setFormData(prev => ({ ...prev, kitItems: items }));
    }
  };

  const removeItem = (index, type = "order") => {
    if (type === "order") {
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

  // Calculate totals
  const calculateTotals = (data) => {
    const orderTotal = data.orderItems.reduce(
      (sum, item) => sum + item.totalPrice,
      0
    );
    const kitTotal = data.kitItems.reduce(
      (sum, item) => sum + item.totalPrice,
      0
    );
    const subtotal = orderTotal + kitTotal;
    const total = Math.max(0, subtotal - data.discount);

    return { orderTotal, kitTotal, subtotal, total };
  };

  // Save order changes
  const handleSave = async () => {
    if (!formData.orderItems.length) {
      alert("Order must have at least one item");
      return;
    }

    setSaving(true);
    try {
      const { subtotal, total } = calculateTotals(formData);
      const dataToSend = {
        ...formData,
        subtotal,
        totalAmount: total
      };

      await orderAPI.updateOrder(id, dataToSend);
      alert("Order updated successfully");
      setEditing(false);
      fetchOrder();
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Failed to update order");
    } finally {
      setSaving(false);
    }
  };

  // Update dispatch status
  const updateDispatchStatus = async (status) => {
    setUpdatingDispatch(true);
    try {
      await orderAPI.dispatchOrder(id, { dispatchStatus: status });
      alert(`Order marked as ${status}`);
      fetchOrder();
    } catch (error) {
      console.error("Error updating dispatch status:", error);
      alert("Failed to update status");
    } finally {
      setUpdatingDispatch(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Order not found
          </h2>
          <button
            onClick={() => navigate("/orders")}
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const { orderTotal, kitTotal, subtotal, total } = calculateTotals(
    editing ? formData : order
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8 bg-gradient-to-r from-[#0B234A] to-[#1a3a6a] rounded-xl shadow-lg p-6 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div>
              <div className="flex items-center space-x-4 mb-2">
                <button
                  onClick={() => navigate("/orders")}
                  className="text-blue-200 hover:text-white"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-3xl font-bold">
                  {editing ? "Edit Order" : "Order Details"}
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-blue-200">
                <span className="font-medium bg-blue-900/50 px-3 py-1 rounded">
                  {order.invoiceNumber}
                </span>
                <span>{order.schoolName}</span>
                <span>{order.academicYear}</span>
                <span className={`px-2 py-1 rounded ${
                  order.paymentStatus === "paid" 
                    ? "bg-green-500/20 text-green-300" 
                    : order.paymentStatus === "partial"
                    ? "bg-yellow-500/20 text-yellow-300"
                    : "bg-red-500/20 text-red-300"
                }`}>
                  Payment: {order.paymentStatus}
                </span>
                <span className={`px-2 py-1 rounded ${
                  order.dispatchStatus === "delivered"
                    ? "bg-green-500/20 text-green-300"
                    : order.dispatchStatus === "dispatched"
                    ? "bg-blue-500/20 text-blue-300"
                    : order.dispatchStatus === "processing"
                    ? "bg-purple-500/20 text-purple-300"
                    : "bg-gray-500/20 text-gray-300"
                }`}>
                  Dispatch: {order.dispatchStatus}
                </span>
              </div>
            </div>
            <div className="flex space-x-3">
              {!editing && order.isEditable && (
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg flex items-center"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Order
                </button>
              )}
              {editing && (
                <>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setFormData(order);
                    }}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg flex items-center"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </>
              )}
              <a
                href={`/orders/${id}/invoice`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print Invoice
              </a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Order Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Books Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                  Books
                </h2>
                {editing && (
                  <button
                    onClick={() => navigate("/orders/create")}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    + Add More Books
                  </button>
                )}
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Grade/Book
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Qty
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Unit Price
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Total
                      </th>
                      {editing && (
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(editing ? formData.orderItems : order.orderItems).map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm">{item.bookType}</td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium">
                            {item.isComboPack
                              ? `${item.grade} Combo Pack`
                              : item.bookName || `${item.bookType} ${item.grade}`}
                          </div>
                          {item.isIndividualBook && (
                            <div className="text-xs text-gray-500">Individual Book</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {editing ? (
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                handleItemUpdate(index, "quantity", e.target.value, "order")
                              }
                              className="w-20 px-2 py-1 border border-gray-300 rounded"
                            />
                          ) : (
                            <span className="text-sm">{item.quantity}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {editing ? (
                            <input
                              type="number"
                              min="0"
                              value={item.unitPrice}
                              onChange={(e) =>
                                handleItemUpdate(index, "unitPrice", e.target.value, "order")
                              }
                              className="w-32 px-2 py-1 border border-gray-300 rounded"
                            />
                          ) : (
                            <span className="text-sm">{formatCurrency(item.unitPrice)}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">
                          {formatCurrency(item.totalPrice)}
                        </td>
                        {editing && (
                          <td className="px-4 py-3">
                            <button
                              onClick={() => removeItem(index, "order")}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Remove
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Kits Section */}
            {order.kitItems.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <Package className="w-5 h-5 mr-2 text-purple-600" />
                    Kits
                  </h2>
                  {editing && (
                    <button
                      onClick={() => navigate("/orders/create")}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      + Add More Kits
                    </button>
                  )}
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Qty
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Unit Price
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Total
                        </th>
                        {editing && (
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Actions
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(editing ? formData.kitItems : order.kitItems).map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm">{item.kitType}</td>
                          <td className="px-4 py-3 text-sm">{item.kitName}</td>
                          <td className="px-4 py-3">
                            {editing ? (
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleItemUpdate(index, "quantity", e.target.value, "kit")
                                }
                                className="w-20 px-2 py-1 border border-gray-300 rounded"
                              />
                            ) : (
                              <span className="text-sm">{item.quantity}</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {editing ? (
                              <input
                                type="number"
                                min="0"
                                value={item.unitPrice}
                                onChange={(e) =>
                                  handleItemUpdate(index, "unitPrice", e.target.value, "kit")
                                }
                                className="w-32 px-2 py-1 border border-gray-300 rounded"
                              />
                            ) : (
                              <span className="text-sm">{formatCurrency(item.unitPrice)}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium">
                            {formatCurrency(item.totalPrice)}
                          </td>
                          {editing && (
                            <td className="px-4 py-3">
                              <button
                                onClick={() => removeItem(index, "kit")}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                Remove
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Truck className="w-5 h-5 mr-2 text-green-600" />
                Shipping Address
              </h2>
              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={formData.toAddress.name}
                      onChange={(e) =>
                        setFormData(prev => ({
                          ...prev,
                          toAddress: { ...prev.toAddress, name: e.target.value }
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <textarea
                      value={formData.toAddress.address}
                      onChange={(e) =>
                        setFormData(prev => ({
                          ...prev,
                          toAddress: { ...prev.toAddress, address: e.target.value }
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      rows="3"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={formData.toAddress.city}
                        onChange={(e) =>
                          setFormData(prev => ({
                            ...prev,
                            toAddress: { ...prev.toAddress, city: e.target.value }
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pincode
                      </label>
                      <input
                        type="text"
                        value={formData.toAddress.pincode}
                        onChange={(e) =>
                          setFormData(prev => ({
                            ...prev,
                            toAddress: { ...prev.toAddress, pincode: e.target.value }
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-gray-700">
                    <strong>Name:</strong> {order.toAddress.name}
                  </p>
                  <p className="text-gray-700">
                    <strong>Address:</strong> {order.toAddress.address}
                  </p>
                  <p className="text-gray-700">
                    <strong>City:</strong> {order.toAddress.city}, {order.toAddress.pincode}
                  </p>
                  <p className="text-gray-700">
                    <strong>Mobile:</strong> {order.toAddress.mobile}
                  </p>
                  <p className="text-gray-700">
                    <strong>Email:</strong> {order.toAddress.email}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Summary & Actions */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Order Summary
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Books Total:</span>
                  <span className="font-medium">
                    {formatCurrency(orderTotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Kits Total:</span>
                  <span className="font-medium">
                    {formatCurrency(kitTotal)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-3">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                {editing ? (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Discount:</span>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-2">₹</span>
                      <input
                        type="number"
                        min="0"
                        max={subtotal}
                        value={formData.discount}
                        onChange={(e) =>
                          handleFormChange("discount", parseFloat(e.target.value) || 0)
                        }
                        className="w-32 px-2 py-1 border border-gray-300 rounded text-right"
                      />
                    </div>
                  </div>
                ) : order.discount > 0 ? (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount:</span>
                    <span className="font-medium text-red-600">
                      -{formatCurrency(order.discount)}
                    </span>
                  </div>
                ) : null}
                <div className="flex justify-between border-t border-gray-200 pt-3">
                  <span className="text-lg font-semibold">Total Amount:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Order Information
              </h2>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500">Order ID</div>
                  <div className="font-medium">{order._id}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Created On</div>
                  <div className="font-medium">{formatDate(order.createdAt)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Created By</div>
                  <div className="font-medium">{order.createdBy?.name}</div>
                </div>
                {order.updatedAt && (
                  <div>
                    <div className="text-sm text-gray-500">Last Updated</div>
                    <div className="font-medium">{formatDate(order.updatedAt)}</div>
                  </div>
                )}
                {order.dispatchedAt && (
                  <div>
                    <div className="text-sm text-gray-500">Dispatched On</div>
                    <div className="font-medium">{formatDate(order.dispatchedAt)}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Dispatch Actions */}
            {!editing && order.isEditable && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Update Status
                </h2>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => updateDispatchStatus("processing")}
                      disabled={updatingDispatch}
                      className="px-3 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 disabled:opacity-50"
                    >
                      Processing
                    </button>
                    <button
                      onClick={() => updateDispatchStatus("dispatched")}
                      disabled={updatingDispatch}
                      className="px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 disabled:opacity-50"
                    >
                      Dispatched
                    </button>
                  </div>
                  <button
                    onClick={() => updateDispatchStatus("delivered")}
                    disabled={updatingDispatch}
                    className="w-full px-3 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 disabled:opacity-50"
                  >
                    Mark as Delivered
                  </button>
                </div>
              </div>
            )}

            {/* Notes */}
            {order.notes && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Notes
                </h2>
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <p className="text-gray-700">{order.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;