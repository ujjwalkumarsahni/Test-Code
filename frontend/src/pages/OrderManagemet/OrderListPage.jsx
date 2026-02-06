// frontend/src/pages/OrderListPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../../api/api.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';

const OrderListPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    academicYear: '',
    paymentStatus: '',
    dispatchStatus: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    currentPage: 1
  });

  // Status badges styling
  const statusBadges = {
    payment: {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      paid: 'bg-green-100 text-green-800 border-green-300',
      partial: 'bg-blue-100 text-blue-800 border-blue-300'
    },
    dispatch: {
      pending: 'bg-gray-100 text-gray-800 border-gray-300',
      processing: 'bg-purple-100 text-purple-800 border-purple-300',
      dispatched: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      delivered: 'bg-teal-100 text-teal-800 border-teal-300'
    }
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
        currentPage: response.currentPage
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      alert('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page on filter change
    }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleExport = () => {
    // Implement export functionality
    alert('Export functionality to be implemented');
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await orderAPI.deleteOrder(orderId);
        alert('Order deleted successfully');
        fetchOrders();
      } catch (error) {
        alert('Failed to delete order');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 bg-gradient-to-r from-[#0B234A] to-[#1a3a6a] rounded-2xl shadow-xl p-8 text-white">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-6 lg:space-y-0">
            <div>
              <h1 className="text-4xl font-bold">Order Management</h1>
              <p className="mt-3 text-blue-200 text-lg">
                View and manage all school orders in one place
              </p>
              <div className="mt-4 flex items-center space-x-4">
                <div className="bg-blue-800/50 px-4 py-2 rounded-lg">
                  <span className="text-blue-200">Total Orders:</span>
                  <span className="ml-2 text-xl font-bold">{pagination.total}</span>
                </div>
                <Link
                  to="/create-order"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create New Order
                </Link>
              </div>
            </div>
            <button
              onClick={handleExport}
              className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Orders
            </button>
          </div>
        </div>

        {/* Filters Card */}
        <div className="mb-8 bg-white rounded-2xl shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Orders
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search invoice or school..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Academic Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Academic Year
              </label>
              <select
                value={filters.academicYear}
                onChange={(e) => handleFilterChange('academicYear', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Years</option>
                <option value="2024-2025">2024-2025</option>
                <option value="2025-2026">2025-2026</option>
                <option value="2026-2027">2026-2027</option>
              </select>
            </div>

            {/* Payment Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Status
              </label>
              <select
                value={filters.paymentStatus}
                onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
              </select>
            </div>

            {/* Dispatch Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dispatch Status
              </label>
              <select
                value={filters.dispatchStatus}
                onChange={(e) => handleFilterChange('dispatchStatus', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="dispatched">Dispatched</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>

            {/* Date Range */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={() => setFilters({
                  search: '',
                  academicYear: '',
                  paymentStatus: '',
                  dispatchStatus: '',
                  startDate: '',
                  endDate: '',
                  page: 1,
                  limit: 10
                })}
                className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-600">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No orders found</h3>
              <p className="mt-2 text-gray-500">Try adjusting your filters or create a new order.</p>
              <div className="mt-6">
                <Link
                  to="/orders/create"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create New Order
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invoice
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        School
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {order.invoiceNumber || 'Pending'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.academicYear}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {order.schoolName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.school?.city || ''}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatCurrency(order.totalAmount)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {order.orderItems?.length || 0} items
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusBadges.payment[order.paymentStatus] || 'bg-gray-100'}`}>
                              {order.paymentStatus}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusBadges.dispatch[order.dispatchStatus] || 'bg-gray-100'}`}>
                              {order.dispatchStatus}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-3">
                            <Link
                              to={`/orders/${order._id}`}
                              className="text-blue-600 hover:text-blue-900 transition-colors"
                              title="View Details"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </Link>
                            <Link
                              to={`/orders/${order._id}/edit`}
                              className={`text-green-600 hover:text-green-900 transition-colors ${!order.isEditable ? 'opacity-50 cursor-not-allowed' : ''}`}
                              title={order.isEditable ? "Edit Order" : "Cannot edit dispatched/delivered orders"}
                              onClick={(e) => !order.isEditable && e.preventDefault()}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </Link>
                            <Link
                              to={`/orders/${order._id}/invoice`}
                              className="text-purple-600 hover:text-purple-900 transition-colors"
                              title="Download Invoice"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </Link>
                            <button
                              onClick={() => handleDeleteOrder(order._id)}
                              className={`text-red-600 hover:text-red-900 transition-colors ${order.dispatchStatus !== 'pending' ? 'opacity-50 cursor-not-allowed' : ''}`}
                              title={order.dispatchStatus === 'pending' ? "Delete Order" : "Cannot delete processed orders"}
                              disabled={order.dispatchStatus !== 'pending'}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
                      Showing <span className="font-medium">{(filters.page - 1) * filters.limit + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(filters.page * filters.limit, pagination.total)}
                      </span>{' '}
                      of <span className="font-medium">{pagination.total}</span> orders
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePageChange(filters.page - 1)}
                        disabled={filters.page === 1}
                        className={`px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium ${
                          filters.page === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Previous
                      </button>
                      {[...Array(Math.min(5, pagination.pages)).keys()].map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page + 1)}
                          className={`px-4 py-2 border rounded-lg text-sm font-medium ${
                            filters.page === page + 1
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page + 1}
                        </button>
                      ))}
                      {pagination.pages > 5 && (
                        <>
                          <span className="px-4 py-2 text-gray-500">...</span>
                          <button
                            onClick={() => handlePageChange(pagination.pages)}
                            className={`px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium ${
                              filters.page === pagination.pages
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {pagination.pages}
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handlePageChange(filters.page + 1)}
                        disabled={filters.page === pagination.pages}
                        className={`px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium ${
                          filters.page === pagination.pages
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
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