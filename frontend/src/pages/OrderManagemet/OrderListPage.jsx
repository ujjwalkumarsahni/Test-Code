// frontend/src/pages/OrderListPage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { orderAPI } from "../../api/api.js";
import { formatCurrency, formatDate } from "../../utils/formatters.js";
import { toast } from "react-hot-toast";

const OrderListPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    paymentStatus: "",
    dispatchStatus: "",
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    currentPage: 1,
  });

  // Status badges styling - Updated with OrderDetailPage colors
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
    fetchOrders();
  }, [filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getOrders(filters);
      setOrders(response.data);
      setPagination({
        total: response.total,
        pages: response.pages,
        currentPage: response.currentPage,
      });
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page on filter change
    }));
  };

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        await orderAPI.deleteOrder(orderId);
        toast.success("Order deleted successfully");
        fetchOrders();
      } catch (error) {
        toast.error("Failed to delete order");
      }
    }
  };

  const handleGenerateInvoice = async (orderId, invoiceNumber) => {
    try {
      toast.loading("Generating invoice...");

      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login again");
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/orders/${orderId}/invoice`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate invoice");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = `Invoice-${invoiceNumber || orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.dismiss();
      toast.success("Invoice downloaded!");
    } catch (error) {
      toast.dismiss();
      toast.error("Invoice download failed");
      console.error("Invoice download error:", error);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto px-4">
        {/* Header */}
        <div className="mb-8 bg-gradient-to-r from-[#0B234A] to-[#1a3a6a] rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#EA8E0A]/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="relative">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-6 lg:space-y-0">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-8">Order Management</h1>
                <p className="text-lg text-blue-200 mb-6">
                  View and manage all school orders in one place
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                    <p className="text-[#EA8E0A] text-sm font-bold mb-1">
                      Total Orders {pagination.total}
                    </p>
                  </div>
                  <Link
                    to="/create-order"
                    className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-[#EA8E0A] to-[#F5A623] text-white rounded-lg hover:scale-[1.02] transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Create New Order
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Card */}
        <div className="mb-8 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Search */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search Orders
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  placeholder="Search invoice or school..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B234A]/50 focus:border-[#0B234A] bg-white"
                />
                <svg
                  className="absolute left-3 top-3.5 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Payment Status */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Payment Status
              </label>
              <select
                value={filters.paymentStatus}
                onChange={(e) =>
                  handleFilterChange("paymentStatus", e.target.value)
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B234A]/50 focus:border-[#0B234A] bg-white"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
              </select>
            </div>

            {/* Dispatch Status */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Dispatch Status
              </label>
              <select
                value={filters.dispatchStatus}
                onChange={(e) =>
                  handleFilterChange("dispatchStatus", e.target.value)
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B234A]/50 focus:border-[#0B234A] bg-white"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="dispatched">Dispatched</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div className="md:col-span-3 flex justify-end">
              <button
                onClick={() =>
                  setFilters({
                    search: "",
                    paymentStatus: "",
                    dispatchStatus: "",
                    page: 1,
                    limit: 10,
                  })
                }
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-300 font-medium"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-[#0B234A] border-t-[#EA8E0A] mb-6"></div>
              <p className="text-gray-700 text-lg font-medium">
                Loading orders...
              </p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No orders found
              </h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your filters or create a new order.
              </p>
              <div className="mt-6">
                <Link
                  to="/create-order"
                  className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-[#0B234A] to-[#1a3a6a] text-white rounded-lg hover:scale-[1.02] transition-all duration-300 font-medium"
                >
                  Create New Order
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Invoice
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        School
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr
                        key={order._id}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-base font-bold text-[#0B234A]">
                            {order.invoiceNumber || "Pending"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.academicYear}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-base font-semibold text-gray-900">
                            {order.schoolName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.toAddress?.city || ""}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-lg font-bold text-[#0B234A]">
                            {formatCurrency(order.totalAmount)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {order.orderItems?.length || 0} items
                          </div>
                          {order.paymentStatus === "partial" && (
                            <div className="text-xs text-[#EA8E0A] font-medium mt-1">
                              {Math.round(
                                ((order.paidAmount || 0) / order.totalAmount) *
                                  100
                              )}
                              % paid
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-2">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(
                                "payment",
                                order.paymentStatus
                              )}`}
                            >
                              {order.paymentStatus}
                            </span>
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(
                                "dispatch",
                                order.dispatchStatus
                              )}`}
                            >
                              {order.dispatchStatus}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatDate(order.createdAt)}
                          </div>
                          <div className="text-xs text-gray-500">
                            By {order.createdBy?.name || "System"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <Link
                              to={`/orders/${order._id}`}
                              className="p-2 bg-blue-50 text-[#0B234A] hover:bg-blue-100 rounded-lg transition-all duration-300"
                              title="View Details"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                            </Link>
                            <Link
                              to={`/orders/${order._id}/edit`}
                              className={`p-2 rounded-lg transition-all duration-300 ${
                                order.isEditable
                                  ? "bg-green-50 text-green-600 hover:bg-green-100"
                                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
                              }`}
                              title={
                                order.isEditable
                                  ? "Edit Order"
                                  : "Cannot edit dispatched/delivered orders"
                              }
                              onClick={(e) =>
                                !order.isEditable && e.preventDefault()
                              }
                            >
                              <svg
                                className="w-5 h-5"
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
                            </Link>
                            <button
                              onClick={() =>
                                handleGenerateInvoice(
                                  order._id,
                                  order.invoiceNumber
                                )
                              }
                              className="p-2 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-lg transition-all duration-300"
                              title="Download Invoice"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteOrder(order._id)}
                              className={`p-2 rounded-lg transition-all duration-300 ${
                                order.dispatchStatus === "pending"
                                  ? "bg-red-50 text-red-600 hover:bg-red-100"
                                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
                              }`}
                              title={
                                order.dispatchStatus === "pending"
                                  ? "Delete Order"
                                  : "Cannot delete processed orders"
                              }
                              disabled={order.dispatchStatus !== "pending"}
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing{" "}
                      <span className="font-medium">
                        {(filters.page - 1) * filters.limit + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-medium">
                        {Math.min(
                          filters.page * filters.limit,
                          pagination.total
                        )}
                      </span>{" "}
                      of <span className="font-medium">{pagination.total}</span>{" "}
                      orders
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePageChange(filters.page - 1)}
                        disabled={filters.page === 1}
                        className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all ${
                          filters.page === 1
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        Previous
                      </button>
                      {[...Array(Math.min(5, pagination.pages)).keys()].map(
                        (page) => (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page + 1)}
                            className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all ${
                              filters.page === page + 1
                                ? "bg-gradient-to-r from-[#0B234A] to-[#1a3a6a] text-white border-[#0B234A]"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {page + 1}
                          </button>
                        )
                      )}
                      {pagination.pages > 5 && (
                        <>
                          <span className="px-4 py-2 text-gray-500">...</span>
                          <button
                            onClick={() => handlePageChange(pagination.pages)}
                            className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all ${
                              filters.page === pagination.pages
                                ? "bg-gradient-to-r from-[#0B234A] to-[#1a3a6a] text-white border-[#0B234A]"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {pagination.pages}
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handlePageChange(filters.page + 1)}
                        disabled={filters.page === pagination.pages}
                        className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all ${
                          filters.page === pagination.pages
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderListPage;