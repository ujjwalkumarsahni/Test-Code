// frontend/src/pages/OrderDashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../../api/api.js';
import { formatCurrency } from '../../utils/formatters.js';

const OrderDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(`${new Date().getFullYear()}-${new Date().getFullYear() + 1}`);

  useEffect(() => {
    fetchStats();
  }, [selectedYear]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getOrderStats({ academicYear: selectedYear });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      alert('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Generate academic years
  const currentYear = new Date().getFullYear();
  const academicYears = [
    `${currentYear-2}-${currentYear-1}`,
    `${currentYear-1}-${currentYear}`,
    `${currentYear}-${currentYear+1}`,
    `${currentYear+1}-${currentYear+2}`
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 bg-gradient-to-r from-[#0B234A] to-[#1a3a6a] rounded-2xl shadow-xl p-8 text-white">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-6 lg:space-y-0">
            <div>
              <h1 className="text-4xl font-bold">Order Dashboard</h1>
              <p className="mt-3 text-blue-200 text-lg">
                Overview of all order statistics and performance metrics
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-white/30 focus:border-white/30"
              >
                {academicYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <Link
                to="/orders/create"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Order
              </Link>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-blue-200 text-sm">Academic Year</p>
              <p className="text-2xl font-bold">{stats?.academicYear}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-blue-200 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold">{formatCurrency(stats?.revenue || 0)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-blue-200 text-sm">Total Orders</p>
              <p className="text-2xl font-bold">{stats?.totalOrders}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-blue-200 text-sm">Avg Order Value</p>
              <p className="text-2xl font-bold">
                {formatCurrency(stats?.totalOrders > 0 ? stats.revenue / stats.totalOrders : 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {/* Payment Status */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Payment Status</h2>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-gray-600">Paid</span>
                </div>
                <span className="font-semibold">{stats?.paymentStats?.paid || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                  <span className="text-gray-600">Pending</span>
                </div>
                <span className="font-semibold">{stats?.paymentStats?.pending || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-gray-600">Partial</span>
                </div>
                <span className="font-semibold">{stats?.paymentStats?.partial || 0}</span>
              </div>
            </div>
          </div>

          {/* Dispatch Status */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Dispatch Status</h2>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-500 rounded-full mr-3"></div>
                  <span className="text-gray-600">Pending</span>
                </div>
                <span className="font-semibold">{stats?.dispatchStats?.pending || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full mr-3"></div>
                  <span className="text-gray-600">Dispatched</span>
                </div>
                <span className="font-semibold">{stats?.dispatchStats?.dispatched || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-teal-500 rounded-full mr-3"></div>
                  <span className="text-gray-600">Delivered</span>
                </div>
                <span className="font-semibold">{stats?.dispatchStats?.delivered || 0}</span>
              </div>
            </div>
          </div>

          {/* Books by Type */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Books by Type</h2>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
            <div className="space-y-4">
              {Object.entries(stats?.booksByType || {}).map(([type, count]) => (
                <div key={type} className="flex justify-between items-center">
                  <span className="text-gray-600">{type}</span>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            to="/orders"
            className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl shadow-lg p-6 text-white hover:from-blue-600 hover:to-cyan-600 transition-all transform hover:-translate-y-1"
          >
            <div className="flex items-center">
              <svg className="w-8 h-8 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <div>
                <h3 className="text-xl font-bold">View All Orders</h3>
                <p className="text-blue-100 text-sm mt-1">Browse and manage all orders</p>
              </div>
            </div>
          </Link>

          <Link
            to="/orders/create"
            className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl shadow-lg p-6 text-white hover:from-green-600 hover:to-emerald-600 transition-all transform hover:-translate-y-1"
          >
            <div className="flex items-center">
              <svg className="w-8 h-8 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <div>
                <h3 className="text-xl font-bold">Create Order</h3>
                <p className="text-green-100 text-sm mt-1">Create new school order</p>
              </div>
            </div>
          </Link>

          <Link
            to="/books/catalog"
            className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg p-6 text-white hover:from-purple-600 hover:to-pink-600 transition-all transform hover:-translate-y-1"
          >
            <div className="flex items-center">
              <svg className="w-8 h-8 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <div>
                <h3 className="text-xl font-bold">Book Catalog</h3>
                <p className="text-purple-100 text-sm mt-1">Manage book inventory</p>
              </div>
            </div>
          </Link>

          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center">
              <svg className="w-8 h-8 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <div>
                <h3 className="text-xl font-bold">Reports</h3>
                <p className="text-yellow-100 text-sm mt-1">Generate detailed reports</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDashboardPage;