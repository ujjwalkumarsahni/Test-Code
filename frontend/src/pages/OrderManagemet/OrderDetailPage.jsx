// frontend/src/pages/OrderDetailPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { orderAPI } from "../../api/api.js";
import { formatCurrency, formatDate } from "../../utils/formatters.js";
import { toast } from "react-hot-toast";

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState(false);

  // Payment Modal State
  const [paymentStatus, setPaymentStatus] = useState("");
  const [paidAmount, setPaidAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");

  // Dispatch Modal State
  const [dispatchStatus, setDispatchStatus] = useState("");
  const [dispatchNotes, setDispatchNotes] = useState("");

  // Status badge styling with new colors
  const getStatusBadge = (type, status) => {
    const styles = {
      payment: {
        pending: "bg-[#FFF3CD] text-[#856404] border-[#EA8E0A]",
        paid: "bg-[#D4EDDA] text-[#155724] border-[#C3E6CB]",
        partial: "bg-[#D1ECF1] text-[#0C5460] border-[#BEE5EB]",
      },
      dispatch: {
        pending: "bg-gray-100 text-gray-800 border-gray-300",
        processing: "bg-[#E0E7FF] text-[#3730A3] border-[#C7D2FE]",
        dispatched: "bg-[#EDE9FE] text-[#5B21B6] border-[#DDD6FE]",
        delivered: "bg-[#D1FAE5] text-[#065F46] border-[#A7F3D0]",
      },
    };
    return (
      styles[type]?.[status] || "bg-gray-100 text-gray-800 border-gray-300"
    );
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getOrder(id);
      setOrder(response.data);
      setPaymentStatus(response.data.paymentStatus);
      setDispatchStatus(response.data.dispatchStatus);
    } catch (error) {
      console.error("Error fetching order:", error);
      toast.error("Failed to load order details");
      navigate("/orders");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePaymentStatus = async () => {
    try {
      setUpdating(true);

      const remaining = order.remainingAmount ?? order.totalAmount;

      // Determine which status options should be available
      const canSetToPending = order.paymentStatus === "pending";
      const canSetToPartial = order.paymentStatus !== "paid";
      const canSetToPaid = order.paymentStatus !== "paid";

      // Prepare payment data
      const paymentData = {
        paymentStatus,
        paymentMethod: paymentStatus !== "pending" ? paymentMethod : null,
        notes: paymentNotes,
      };

      // Handle each status
      if (paymentStatus === "pending") {
        if (!canSetToPending) {
          toast.error("Cannot revert to pending once payment has been made");
          return;
        }
        paymentData.paidAmount = 0;
      } else if (paymentStatus === "partial") {
        if (!canSetToPartial) {
          toast.error("Cannot change to partial once order is fully paid");
          return;
        }

        if (!paidAmount || paidAmount <= 0) {
          toast.error("Please enter a valid payment amount");
          return;
        }

        if (paidAmount > remaining) {
          toast.error(
            `Amount cannot exceed remaining balance (${formatCurrency(remaining)})`,
          );
          return;
        }

        paymentData.paidAmount = paidAmount;
      } else if (paymentStatus === "paid") {
        if (!canSetToPaid) {
          toast.error("Order is already paid");
          return;
        }

        // For "paid", use the remaining amount
        paymentData.paidAmount = remaining;
      }

      // Validate payment method for non-pending status
      if (paymentStatus !== "pending" && !paymentMethod) {
        toast.error("Please select a payment method");
        return;
      }

      await orderAPI.updatePaymentStatus(id, paymentData);

      toast.success("Payment updated successfully!");

      // Reset modal state
      setPaidAmount(0);
      setPaymentNotes("");
      setPaymentMethod("");
      setShowPaymentModal(false);

      // Refresh order data
      fetchOrder();
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "Failed to update payment";
      toast.error(errorMessage);
    } finally {
      setUpdating(false);
    }
  };
  const handleDispatchOrder = async () => {
    try {
      setUpdating(true);
      await orderAPI.dispatchOrder(id, {
        dispatchStatus,
        notes: dispatchNotes,
      });
      toast.success("Order status updated successfully!");
      setShowDispatchModal(false);
      fetchOrder();
    } catch (error) {
      toast.error("Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        await orderAPI.deleteOrder(id);
        toast.success("Order deleted successfully!");
        navigate("/orders");
      } catch (error) {
        toast.error("Failed to delete order");
      }
    }
  };
  const handleGenerateInvoice = async () => {
    try {
      toast.loading("Generating invoice...");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/orders/${id}/invoice`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to generate invoice");
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = `Invoice-${order.invoiceNumber}.pdf`;

      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);

      toast.dismiss();
      toast.success("Invoice downloaded!");
    } catch (err) {
      toast.dismiss();
      toast.error("Invoice download failed");
      console.error(err);
    }
  };

  const calculateDiscountPercentage = () => {
    if (!order.discount || !order.subtotal) return 0;
    return ((order.discount / order.subtotal) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-[#0B234A] border-t-[#EA8E0A] mb-6"></div>
          <p className="text-gray-700 text-lg font-medium">
            Loading order details...
          </p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-[#E22213]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-[#E22213]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Order not found
          </h3>
          <p className="text-gray-600 mb-6">
            The order you're looking for doesn't exist or has been deleted.
          </p>
          <Link
            to="/orders"
            className="inline-flex items-center justify-center px-6 py-3 bg-[#0B234A] hover:bg-[#1a3a6a] text-white rounded-lg transition-all duration-300 font-medium"
          >
            ← Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const isPaymentCompleted = order.paymentStatus === "paid";
  const discountPercentage = calculateDiscountPercentage();

  return (
    <div className="min-h-screen">
      <div className="mx-auto px-4">
        {/* Header */}
        <div className="mb-8 bg-gradient-to-r from-[#0B234A] to-[#1a3a6a] rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#EA8E0A]/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="relative">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-6 lg:space-y-0">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-6">
                  <Link
                    to="/orders"
                    className="flex items-center text-[#EA8E0A] hover:text-white transition-colors font-medium group"
                  >
                    <svg
                      className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      />
                    </svg>
                    Back to Orders
                  </Link>
                </div>
                <h1 className="text-3xl font-bold mb-8">Order Details</h1>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-[#EA8E0A] text-sm font-medium mb-1">
                      Invoice Number
                    </p>
                    <p className="text-xl font-semibold">
                      {order.invoiceNumber || (
                        <span className="text-yellow-200">Pending</span>
                      )}
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-[#EA8E0A] text-sm font-medium mb-1">
                      Academic Year
                    </p>
                    <p className="text-xl font-semibold">
                      {order.academicYear}
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-[#EA8E0A] text-sm font-medium mb-1">
                      Order Date
                    </p>
                    <p className="text-xl font-semibold">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Left Column - Order Details */}
          <div className="space-y-8">
            {/* School Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  School Information
                </h2>
                <div className="w-10 h-10 bg-[#0B234A]/10 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-[#0B234A]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">School Name</p>
                    <p className="font-semibold text-gray-800">
                      {order.schoolName}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">Contact Person</p>
                    <p className="font-semibold text-gray-800">
                      {order.toAddress?.name}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <p className="font-semibold text-gray-800">
                      {order.toAddress?.email}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">Mobile</p>
                    <p className="font-semibold text-gray-800">
                      {order.toAddress?.mobile}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">Address</p>
                    <p className="font-semibold text-gray-800">
                      {order.toAddress?.address}
                    </p>
                    <p className="text-gray-600 text-sm mt-1">
                      {order.toAddress?.city}, {order.toAddress?.state} -{" "}
                      {order.toAddress?.pincode}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Timeline */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  Order Timeline
                </h2>
                <div className="w-10 h-10 bg-[#EA8E0A]/10 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-[#EA8E0A]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#0B234A] to-[#1a3a6a] flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="font-bold text-gray-800">Order Created</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDate(order.createdAt)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      By{" "}
                      <span className="font-medium">
                        {order.createdBy?.name}
                      </span>
                    </p>
                  </div>
                </div>

                {order.dispatchedAt && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#EA8E0A] to-[#F5A623] flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="font-bold text-gray-800">
                        Order Dispatched
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDate(order.dispatchedAt)}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        By{" "}
                        <span className="font-medium">
                          {order.dispatchedBy?.name}
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                {order.notes && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#E22213] to-[#FF6B6B] flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="font-bold text-gray-800">Dispatch Notes</p>
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{order.notes}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Order Items */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Order Items</h2>
                <div className="w-10 h-10 bg-[#EA8E0A]/10 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-[#EA8E0A]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>
              </div>

              {/* Books */}
              {order.orderItems && order.orderItems.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-700 text-lg flex items-center">
                      <svg
                        className="w-5 h-5 mr-2 text-[#0B234A]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                      Books
                    </h3>
                    <span className="text-sm text-gray-500">
                      {order.orderItems.length} items
                    </span>
                  </div>
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Book Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Description
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Unit Price
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {order.orderItems.map((item, index) => (
                          <tr
                            key={index}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                  item.bookType === "ELP"
                                    ? "bg-blue-100 text-blue-800"
                                    : item.bookType === "LTE"
                                      ? "bg-purple-100 text-purple-800"
                                      : item.bookType === "CAC"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-orange-100 text-orange-800"
                                }`}
                              >
                                {item.bookType}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {item.isComboPack
                                    ? `${item.grade} Combo Pack`
                                    : item.bookName ||
                                      `${item.bookType} ${item.grade}`}
                                </p>
                                {item.grade && (
                                  <p className="text-sm text-gray-500 mt-1">
                                    Grade:{" "}
                                    <span className="font-medium">
                                      {item.grade}
                                    </span>
                                  </p>
                                )}
                                {item.isIndividualBook && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 mt-1">
                                    Individual Book
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                                {item.quantity}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(item.unitPrice)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                              {formatCurrency(item.totalPrice)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Kits */}
              {order.kitItems && order.kitItems.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-700 text-lg flex items-center">
                      <svg
                        className="w-5 h-5 mr-2 text-[#E22213]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                      Kits
                    </h3>
                    <span className="text-sm text-gray-500">
                      {order.kitItems.length} items
                    </span>
                  </div>
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Kit Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Unit Price
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {order.kitItems.map((item, index) => (
                          <tr
                            key={index}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                  item.kitType === "Wonder Kit"
                                    ? "bg-pink-100 text-pink-800"
                                    : item.kitType === "Nexus Kit"
                                      ? "bg-indigo-100 text-indigo-800"
                                      : "bg-teal-100 text-teal-800"
                                }`}
                              >
                                {item.kitType}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <p className="font-semibold text-gray-900">
                                {item.kitName}
                              </p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                                {item.quantity}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(item.unitPrice)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                              {formatCurrency(item.totalPrice)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ================= TOP SECTION ================= */}
          <div className="grid grid-cols-1 gap-8">
            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  Order Summary
                </h2>
                <div className="w-10 h-10 bg-[#0B234A]/10 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-[#0B234A]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold text-gray-800">
                    {formatCurrency(order.subtotal)}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <div>
                      <span className="text-gray-600">Discount:</span>
                      <span className="ml-2 text-sm text-gray-500">
                        ({discountPercentage}%)
                      </span>
                    </div>
                    <span className="font-semibold text-[#E22213]">
                      -{formatCurrency(order.discount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-700 font-bold">Total Amount:</span>
                  <span className="font-bold text-2xl text-[#0B234A]">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>

                {/* Payment Details Section */}
                {order.paymentStatus !== "pending" && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="font-bold text-gray-700 mb-4 flex items-center">
                      <svg
                        className="w-5 h-5 mr-2 text-[#EA8E0A]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      Payment Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Paid Amount:</span>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(order.paidAmount || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Remaining:</span>
                        <span className="font-semibold text-[#E22213]">
                          {formatCurrency(order.remainingAmount || 0)}
                        </span>
                      </div>
                      {order.paymentMethod && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Method:</span>
                          <span className="font-medium capitalize">
                            {order.paymentMethod.replace("_", " ")}
                          </span>
                        </div>
                      )}
                      {order.paymentDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Date:</span>
                          <span className="font-medium">
                            {formatDate(order.paymentDate)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Payment Progress Bar */}
                {order.paymentStatus === "partial" && (
                  <div className="mt-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 font-medium">
                        Payment Progress
                      </span>
                      <span className="font-bold text-[#0B234A]">
                        {Math.round(
                          ((order.paidAmount || 0) / order.totalAmount) * 100,
                        )}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-[#EA8E0A] to-[#F5A623] h-3 rounded-full transition-all duration-500"
                        style={{
                          width: `${((order.paidAmount || 0) / order.totalAmount) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>₹0</span>
                      <span>{formatCurrency(order.totalAmount)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Status */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  Order Status
                </h2>
              </div>
              <div className="space-y-6 flex gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-2 font-bold">Payment Status</p>
                  <div className="flex items-center">
                    <span
                      className={`inline-flex items-center px-4 py-1 rounded-full text-sm font-semibold border ${getStatusBadge("payment", order.paymentStatus)}`}
                    >
                      {order.paymentStatus === "pending"
                        ? "Pending Payment"
                        : order.paymentStatus}

                        {order.paymentStatus === "paid" && (
                      <svg
                        className="w-5 h-5 text-green-500 ml-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    </span>
                    
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2 font-bold">Dispatch Status</p>
                  <span
                    className={`inline-flex items-center px-4 py-1 rounded-full text-sm font-semibold border ${getStatusBadge("dispatch", order.dispatchStatus)}`}
                  >
                    {order.dispatchStatus}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2 font-bold">Order Status</p>
                  <span
                    className={`inline-flex items-center px-4 py-1 rounded-full text-sm font-semibold ${
                      order.isEditable
                        ? "bg-green-100 text-green-800 border border-green-300"
                        : "bg-gray-100 text-gray-800 border border-gray-300"
                    }`}
                  >
                    {order.isEditable ? "Editable" : "Locked"}
                    {order.isEditable ? (
                      <svg
                        className="w-4 h-4 ml-2 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4 ml-2 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= MIDDLE SECTION ================= */}
          {/* Payment History */}
          {order.paymentHistory?.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-[#0B234A]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Payment History
              </h3>
              <div className="space-y-3">
                {order.paymentHistory.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {formatDate(p.date)}
                      </p>
                      <p className="text-xs text-gray-500">{p.method}</p>
                      {p.notes && (
                        <p className="text-xs text-gray-600 mt-1">{p.notes}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        {formatCurrency(p.amount)}
                      </p>
                      {p.receivedBy && (
                        <p className="text-xs text-gray-500">
                          By {p.receivedBy?.name}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= BOTTOM SECTION ================= */}
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Quick Actions
            </h2>

            <div className="flex flex-wrap gap-4">
              {/* Update Payment */}
              <button
                onClick={() => setShowPaymentModal(true)}
                disabled={isPaymentCompleted}
                className={`flex items-center justify-center px-5 py-3 rounded-lg font-medium transition-all
      ${
        isPaymentCompleted
          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
          : "bg-gradient-to-r from-[#EA8E0A] to-[#F5A623] text-white hover:scale-[1.02]"
      }`}
              >
                Update Payment
              </button>

              {/* Update Dispatch */}
              <button
                onClick={() => setShowDispatchModal(true)}
                className="px-5 py-3 bg-gradient-to-r from-[#0B234A] to-[#1a3a6a] text-white rounded-lg font-medium hover:scale-[1.02]"
              >
                Update Dispatch
              </button>

              {/* Download Invoice */}
              <button
                onClick={handleGenerateInvoice}
                className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg font-medium hover:scale-[1.02]"
              >
                Download Invoice
              </button>

              {/* Edit Order */}
              <Link
                to={`/orders/${id}/edit`}
                onClick={(e) => !order.isEditable && e.preventDefault()}
                className={`flex justify-center px-5 py-3 rounded-lg font-medium
      ${
        order.isEditable
          ? "bg-indigo-600 text-white"
          : "bg-gray-200 text-gray-500 cursor-not-allowed"
      }`}
              >
                Edit Order
              </Link>

              {/* Delete Order */}
              <button
                onClick={handleDeleteOrder}
                disabled={order.dispatchStatus !== "pending"}
                className={`px-5 py-3 rounded-lg font-medium
      ${
        order.dispatchStatus === "pending"
          ? "bg-red-600 text-white"
          : "bg-gray-200 text-gray-500 cursor-not-allowed"
      }`}
              >
                Delete Order
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Status Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-slideUp border border-gray-200">
            {/* Modal Header */}
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Update Payment
                    </h3>
                    <p className="text-sm text-gray-500">
                      Invoice: {order.invoiceNumber || "Pending"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-gray-400 hover:text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-3">
              {/* Payment Summary Card */}
              <div className="bg-gradient-to-r from-[#0B234A]/5 to-[#0B234A]/10 rounded-xl p-4 border border-[#0B234A]/20 mb-6">
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      Total
                    </p>
                    <p className="text-lg font-bold text-[#0B234A]">
                      {formatCurrency(order.totalAmount)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      Paid
                    </p>
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(order.paidAmount || 0)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      Remaining
                    </p>
                    <p className="text-lg font-bold text-[#E22213]">
                      {formatCurrency(
                        order.remainingAmount || order.totalAmount,
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Payment Status Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Payment Status
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {/* Pending Button - Only show if current status is pending */}
                    {order.paymentStatus === "pending" && (
                      <button
                        onClick={() => {
                          setPaymentStatus("pending");
                          setPaidAmount(0);
                        }}
                        className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                          paymentStatus === "pending"
                            ? "border-[#EA8E0A] bg-[#EA8E0A]/10"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-[#EA8E0A]/20 flex items-center justify-center mb-2">
                          <svg
                            className={`w-4 h-4 ${
                              paymentStatus === "pending"
                                ? "text-[#EA8E0A]"
                                : "text-gray-400"
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <span
                          className={`text-sm font-medium ${
                            paymentStatus === "pending"
                              ? "text-[#EA8E0A]"
                              : "text-gray-600"
                          }`}
                        >
                          Pending
                        </span>
                      </button>
                    )}

                    {/* Partial Button - Hide if already paid */}
                    {order.paymentStatus !== "paid" && (
                      <button
                        onClick={() => {
                          setPaymentStatus("partial");
                          // Auto-fill with remaining amount or 1000, whichever is smaller
                          const suggestedAmount = Math.min(remaining, 1000);
                          setPaidAmount(suggestedAmount);
                        }}
                        className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                          paymentStatus === "partial"
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                          <svg
                            className={`w-4 h-4 ${
                              paymentStatus === "partial"
                                ? "text-blue-600"
                                : "text-gray-400"
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                            />
                          </svg>
                        </div>
                        <span
                          className={`text-sm font-medium ${
                            paymentStatus === "partial"
                              ? "text-blue-600"
                              : "text-gray-600"
                          }`}
                        >
                          Partial
                        </span>
                      </button>
                    )}

                    {/* Paid Button - Hide if already paid */}
                    {order.paymentStatus !== "paid" && (
                      <button
                        onClick={() => {
                          setPaymentStatus("paid");
                          // Auto-fill with remaining amount
                          setPaidAmount(remaining);
                        }}
                        className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                          paymentStatus === "paid"
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mb-2">
                          <svg
                            className={`w-4 h-4 ${
                              paymentStatus === "paid"
                                ? "text-green-600"
                                : "text-gray-400"
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <span
                          className={`text-sm font-medium ${
                            paymentStatus === "paid"
                              ? "text-green-600"
                              : "text-gray-600"
                          }`}
                        >
                          Paid
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Status transition info */}
                  <div className="mt-2 text-xs text-gray-500">
                    {order.paymentStatus === "pending" && (
                      <p>
                        Once you record a payment, you cannot revert to pending
                      </p>
                    )}
                    {order.paymentStatus === "partial" && (
                      <p>
                        You can add more payments until the order is fully paid
                      </p>
                    )}
                    {order.paymentStatus === "paid" && (
                      <p>This order is already paid in full</p>
                    )}
                  </div>
                </div>

                {/* Amount Input for Partial Payment */}
                {paymentStatus === "partial" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Payment Amount
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <span className="text-gray-500 font-bold">₹</span>
                        </div>
                        <input
                          type="number"
                          min="1"
                          max={order?.remainingAmount || order?.totalAmount}
                          value={paidAmount}
                          onChange={(e) =>
                            setPaidAmount(parseFloat(e.target.value) || 0)
                          }
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B234A]/50 focus:border-[#0B234A] bg-white"
                          placeholder="Enter amount"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <span className="text-xs text-gray-500">
                            Max:{" "}
                            {formatCurrency(
                              order.remainingAmount || order.totalAmount,
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Visual Balance Indicator */}
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">New Balance:</span>
                        <span className="font-semibold text-[#0B234A]">
                          {formatCurrency((order.paidAmount || 0) + paidAmount)}{" "}
                          / {formatCurrency(order.totalAmount)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-[#0B234A] to-[#1a3a6a] h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${(((order.paidAmount || 0) + paidAmount) / order.totalAmount) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Method */}
                {(paymentStatus === "paid" || paymentStatus === "partial") && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Payment Method
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {["cash", "online", "cheque", "bank_transfer"].map(
                        (method) => (
                          <button
                            key={method}
                            onClick={() => setPaymentMethod(method)}
                            className={`flex items-center justify-center p-3 rounded-lg border transition-all ${
                              paymentMethod === method
                                ? "border-[#0B234A] bg-[#0B234A]/5"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <span className="text-sm font-medium capitalize">
                              {method.replace("_", " ")}
                            </span>
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                )}

                {/* Payment Notes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                      />
                    </svg>
                    Payment Notes (Optional)
                  </label>
                  <textarea
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    rows="2"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B234A]/50 focus:border-[#0B234A] bg-white placeholder-gray-400"
                    placeholder="Add reference, transaction ID, or notes..."
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  <span className="font-medium">
                    Current Status:{" "}
                    <span
                      className={`capitalize ${
                        order.paymentStatus === "paid"
                          ? "text-green-600"
                          : order.paymentStatus === "partial"
                            ? "text-blue-600"
                            : "text-[#EA8E0A]"
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </span>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowPaymentModal(false);
                      setPaidAmount(0);
                      setPaymentNotes("");
                      setPaymentMethod("");
                      setPaymentStatus(order.paymentStatus);
                    }}
                    className="px-5 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdatePaymentStatus}
                    disabled={
                      updating ||
                      (paymentStatus === "paid" &&
                        order.paymentStatus === "paid") ||
                      (paymentStatus === "partial" &&
                        (!paidAmount || paidAmount <= 0))
                    }
                    className={`px-5 py-2.5 rounded-lg font-medium transition-all ${
                      updating ||
                      (paymentStatus === "paid" &&
                        order.paymentStatus === "paid") ||
                      (paymentStatus === "partial" &&
                        (!paidAmount || paidAmount <= 0))
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : paymentStatus === "paid"
                          ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-md hover:shadow-lg"
                          : paymentStatus === "partial"
                            ? "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md hover:shadow-lg"
                            : "bg-gradient-to-r from-[#EA8E0A] to-[#F5A623] hover:from-[#F5A623] hover:to-[#EA8E0A] text-white shadow-md hover:shadow-lg"
                    }`}
                  >
                    {updating ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Updating...
                      </span>
                    ) : paymentStatus === "paid" ? (
                      `Mark as Paid (${formatCurrency(order.remainingAmount)})`
                    ) : paymentStatus === "partial" ? (
                      `Add Payment (${formatCurrency(paidAmount)})`
                    ) : (
                      "Mark as Pending"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dispatch Status Modal
      {showDispatchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-slideUp">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  Update Dispatch Status
                </h3>
                <button
                  onClick={() => setShowDispatchModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Status *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {["pending", "processing", "dispatched", "delivered"].map(
                      (status) => (
                        <button
                          key={status}
                          onClick={() => setDispatchStatus(status)}
                          className={`py-3 rounded-lg transition-all capitalize ${dispatchStatus === status ? "bg-[#0B234A] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                        >
                          {status}
                        </button>
                      ),
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={dispatchNotes}
                    onChange={(e) => setDispatchNotes(e.target.value)}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B234A] focus:border-[#0B234A] transition-all"
                    placeholder="Add dispatch tracking or notes..."
                  />
                </div>
              </div>
              <div className="mt-8 flex justify-end space-x-3">
                <button
                  onClick={() => setShowDispatchModal(false)}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDispatchOrder}
                  disabled={updating}
                  className="px-6 py-3 bg-gradient-to-r from-[#0B234A] to-[#1a3a6a] hover:from-[#1a3a6a] hover:to-[#0B234A] text-white rounded-lg transition-all font-medium"
                >
                  {updating ? "Updating..." : "Update Status"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )} */}

      {/* Dispatch Status Modal */}
      {showDispatchModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-slideUp border border-gray-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#0B234A]/10 to-[#0B234A]/20 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-[#0B234A]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Update Dispatch Status
                    </h3>
                    <p className="text-sm text-gray-500">
                      Invoice: {order.invoiceNumber || "Pending"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDispatchModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-gray-400 hover:text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                {/* Dispatch Status Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Select Status
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["pending", "dispatched", "delivered"].map((status) => (
                      <button
                        key={status}
                        onClick={() => setDispatchStatus(status)}
                        className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all capitalize ${
                          dispatchStatus === status
                            ? status === "pending"
                              ? "border-[#EA8E0A] bg-[#EA8E0A]/10"
                              : status === "dispatched"
                                ? "border-blue-500 bg-blue-50"
                                : "border-green-500 bg-green-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                            status === "pending"
                              ? "bg-[#EA8E0A]/20"
                              : status === "dispatched"
                                ? "bg-blue-100"
                                : "bg-green-100"
                          }`}
                        >
                          <svg
                            className={`w-4 h-4 ${
                              dispatchStatus === status
                                ? status === "pending"
                                  ? "text-[#EA8E0A]"
                                  : status === "dispatched"
                                    ? "text-blue-600"
                                    : "text-green-600"
                                : "text-gray-400"
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            {status === "pending" ? (
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            ) : status === "dispatched" ? (
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                              />
                            ) : (
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            )}
                          </svg>
                        </div>
                        <span
                          className={`text-sm font-medium ${
                            dispatchStatus === status
                              ? status === "pending"
                                ? "text-[#EA8E0A]"
                                : status === "dispatched"
                                  ? "text-blue-600"
                                  : "text-green-600"
                              : "text-gray-600"
                          }`}
                        >
                          {status}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                      />
                    </svg>
                    Dispatch Notes (Optional)
                  </label>
                  <textarea
                    value={dispatchNotes}
                    onChange={(e) => setDispatchNotes(e.target.value)}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B234A]/50 focus:border-[#0B234A] bg-white placeholder-gray-400"
                    placeholder="Add tracking number, courier details, or notes..."
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  <span className="font-medium">
                    Current Status:{" "}
                    <span className="capitalize">{order.dispatchStatus}</span>
                  </span>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowDispatchModal(false)}
                    className="px-5 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDispatchOrder}
                    disabled={updating}
                    className="px-5 py-2.5 bg-gradient-to-r from-[#0B234A] to-[#1a3a6a] hover:from-[#1a3a6a] hover:to-[#0B234A] text-white rounded-lg transition-all font-medium shadow-md hover:shadow-lg"
                  >
                    {updating ? "Updating..." : "Update Status"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailPage;
