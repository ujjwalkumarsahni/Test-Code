// frontend/src/pages/OrdersPage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { orderAPI, schoolAPI } from "../../api/api.js";
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Truck,
  Clock,
  AlertCircle,
} from "lucide-react";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    school: "",
    academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
    paymentStatus: "",
    dispatchStatus: "",
    startDate: "",
    endDate: "",
  });
  const [schools, setSchools] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      };

      // Remove empty filters
      Object.keys(params).forEach((key) => {
        if (params[key] === "" || params[key] === null) {
          delete params[key];
        }
      });

      const response = await orderAPI.getOrders(params);
      setOrders(response.data);
      setPagination({
        page: response.currentPage,
        limit: pagination.limit,
        total: response.total,
        pages: response.pages,
      });
    } catch (error) {
      console.error("Error fetching orders:", error);
      alert("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  // Fetch schools for filter
  const fetchSchools = async () => {
    try {
      const response = await schoolAPI.getSchools();
      setSchools(response.data);
    } catch (error) {
      console.error("Error fetching schools:", error);
    }
  };

  useEffect(() => {
    fetchSchools();
    fetchOrders();
  }, [pagination.page, filters.academicYear]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Apply filters
  const applyFilters = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchOrders();
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      search: "",
      school: "",
      academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
      paymentStatus: "",
      dispatchStatus: "",
      startDate: "",
      endDate: "",
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Delete order
  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    try {
      await orderAPI.deleteOrder(orderId);
      alert("Order deleted successfully");
      fetchOrders();
    } catch (error) {
      console.error("Error deleting order:", error);
      alert("Failed to delete order");
    }
  };

  // Update payment status
  const updatePaymentStatus = async (orderId, status) => {
    try {
      await orderAPI.updatePaymentStatus(orderId, { paymentStatus: status });
      alert("Payment status updated");
      fetchOrders();
    } catch (error) {
      console.error("Error updating payment status:", error);
      alert("Failed to update payment status");
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

  // Get status badge color
  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "partial":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-red-100 text-red-800";
    }
  };

  const getDispatchStatusBadge = (status) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "dispatched":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto px-4">
        {/* Header */}
        <div className="mb-8 bg-gradient-to-r from-[#0B234A] to-[#1a3a6a] rounded-xl shadow-lg p-6 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div>
              <h1 className="text-3xl font-bold">Orders Management</h1>
              <p className="mt-2 text-blue-200">
                View and manage all school orders
              </p>
            </div>
            <div className="flex space-x-4">
              <Link
                to="/orders/create"
                className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors"
              >
                + Create New Order
              </Link>
              <Link
                to="/orders/catalog"
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
              >
                Book Catalog
              </Link>
            </div>
          </div>
        </div>

        {/* Filters Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Filters</h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <Filter className="w-4 h-4 mr-2" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>
          </div>

          {/* Basic Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by invoice number or school name..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && applyFilters()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  School
                </label>
                <select
                  value={filters.school}
                  onChange={(e) => handleFilterChange("school", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">All Schools</option>
                  {schools.map((school) => (
                    <option key={school._id} value={school._id}>
                      {school.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Academic Year
                </label>
                <select
                  value={filters.academicYear}
                  onChange={(e) => handleFilterChange("academicYear", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="2023-2024">2023-2024</option>
                  <option value="2024-2025">2024-2025</option>
                  <option value="2025-2026">2025-2026</option>
                  <option value="2026-2027">2026-2027</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Status
                </label>
                <select
                  value={filters.paymentStatus}
                  onChange={(e) => handleFilterChange("paymentStatus", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="partial">Partial</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dispatch Status
                </label>
                <select
                  value={filters.dispatchStatus}
                  onChange={(e) => handleFilterChange("dispatchStatus", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="dispatched">Dispatched</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange("startDate", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange("endDate", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          )}

          {/* Filter Actions */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing {orders.length} of {pagination.total} orders
            </div>
            <div className="flex space-x-3">
              <button
                onClick={resetFilters}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Reset
              </button>
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No orders found
              </h3>
              <p className="text-gray-600">
                {Object.values(filters).some((v) => v)
                  ? "Try adjusting your filters"
                  : "Create your first order"}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invoice
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        School
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Items
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dispatch
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-blue-600">
                            {order.invoiceNumber}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.academicYear}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">
                            {order.schoolName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.school?.city}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="text-gray-900">
                              Books: {order.orderItems.reduce((sum, item) => sum + item.quantity, 0)}
                            </div>
                            <div className="text-gray-500">
                              Kits: {order.kitItems.reduce((sum, item) => sum + item.quantity, 0)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-semibold">
                            {formatCurrency(order.totalAmount)}
                          </div>
                          {order.discount > 0 && (
                            <div className="text-sm text-red-600">
                              -{formatCurrency(order.discount)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusBadge(
                              order.paymentStatus
                            )}`}
                          >
                            {order.paymentStatus === "paid" && (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            )}
                            {order.paymentStatus}
                          </span>
                          {order.paymentStatus !== "paid" && (
                            <div className="mt-1 space-x-1">
                              <button
                                onClick={() => updatePaymentStatus(order._id, "paid")}
                                className="text-xs text-green-600 hover:text-green-800"
                              >
                                Mark Paid
                              </button>
                              <button
                                onClick={() => updatePaymentStatus(order._id, "partial")}
                                className="text-xs text-yellow-600 hover:text-yellow-800"
                              >
                                Partial
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDispatchStatusBadge(
                              order.dispatchStatus
                            )}`}
                          >
                            {order.dispatchStatus === "dispatched" && (
                              <Truck className="w-3 h-3 mr-1" />
                            )}
                            {order.dispatchStatus === "processing" && (
                              <Clock className="w-3 h-3 mr-1" />
                            )}
                            {order.dispatchStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            By: {order.createdBy?.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-3">
                            <Link
                              to={`/orders/${order._id}`}
                              className="text-blue-600 hover:text-blue-900"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            {order.isEditable && (
                              <Link
                                to={`/orders/${order._id}/edit`}
                                className="text-green-600 hover:text-green-900"
                                title="Edit Order"
                              >
                                <Edit className="w-4 h-4" />
                              </Link>
                            )}
                            <button
                              onClick={() => window.open(`/orders/${order._id}/invoice`, "_blank")}
                              className="text-purple-600 hover:text-purple-900"
                              title="Generate Invoice"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            {order.dispatchStatus === "pending" && (
                              <button
                                onClick={() => handleDeleteOrder(order._id)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete Order"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
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
                      Page {pagination.page} of {pagination.pages}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() =>
                          setPagination((prev) => ({
                            ...prev,
                            page: Math.max(1, prev.page - 1),
                          }))
                        }
                        disabled={pagination.page === 1}
                        className={`px-3 py-1 rounded-md ${
                          pagination.page === 1
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Previous
                      </button>
                      {[...Array(pagination.pages)].map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() =>
                            setPagination((prev) => ({ ...prev, page: idx + 1 }))
                          }
                          className={`px-3 py-1 rounded-md ${
                            pagination.page === idx + 1
                              ? "bg-blue-600 text-white"
                              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {idx + 1}
                        </button>
                      ))}
                      <button
                        onClick={() =>
                          setPagination((prev) => ({
                            ...prev,
                            page: Math.min(pagination.pages, prev.page + 1),
                          }))
                        }
                        disabled={pagination.page === pagination.pages}
                        className={`px-3 py-1 rounded-md ${
                          pagination.page === pagination.pages
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
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

export default OrdersPage;