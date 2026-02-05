// frontend/src/pages/OrderDashboardPage.jsx
import React, { useState, useEffect } from "react";
import { orderAPI } from "../../api/api.js";
import {
  TrendingUp,
  Package,
  CheckCircle,
  Clock,
  Truck,
  DollarSign,
  BookOpen,
  Users,
  Calendar,
  Download,
  RefreshCw,
} from "lucide-react";

const OrderDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [academicYear, setAcademicYear] = useState(
    `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`
  );
  const [timeRange, setTimeRange] = useState("current");

  // Fetch statistics
  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getOrderStats({ academicYear });
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
      alert("Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [academicYear]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      notation: "compact",
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(amount);
  };

  // Format number
  const formatNumber = (num) => {
    return new Intl.NumberFormat("en-IN").format(num);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto px-4">
        {/* Header */}
        <div className="mb-8 bg-gradient-to-r from-[#0B234A] to-[#1a3a6a] rounded-xl shadow-lg p-6 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div>
              <h1 className="text-3xl font-bold">Order Dashboard</h1>
              <p className="mt-2 text-blue-200">
                Overview of orders and sales performance
              </p>
            </div>
            <div className="flex space-x-3">
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="bg-blue-900/50 border border-blue-700 rounded-lg px-4 py-2 text-white"
              >
                <option value="2023-2024">2023-2024</option>
                <option value="2024-2025">2024-2025</option>
                <option value="2025-2026">2025-2026</option>
                <option value="2026-2027">2026-2027</option>
              </select>
              <button
                onClick={fetchStats}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Orders */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {formatNumber(stats.totalOrders)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              Academic Year: {stats.academicYear}
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {formatCurrency(stats.revenue)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              All payment statuses included
            </div>
          </div>

          {/* Paid Orders */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Paid Orders</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {formatNumber(stats.paymentStats.paid)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  Pending: {stats.paymentStats.pending}
                </span>
                <span className="text-gray-600">
                  Partial: {stats.paymentStats.partial}
                </span>
              </div>
            </div>
          </div>

          {/* Delivered Orders */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Delivered</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {formatNumber(stats.dispatchStats.delivered)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Truck className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  Pending: {stats.dispatchStats.pending}
                </span>
                <span className="text-gray-600">
                  Dispatched: {stats.dispatchStats.dispatched}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Status Breakdown */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-blue-600" />
              Payment Status Breakdown
            </h2>
            <div className="space-y-4">
              {Object.entries(stats.paymentStats).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className={`w-3 h-3 rounded-full mr-3 ${
                        status === "paid"
                          ? "bg-green-500"
                          : status === "partial"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                    ></div>
                    <span className="font-medium text-gray-700 capitalize">
                      {status}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-semibold text-gray-900 mr-3">
                      {count}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({Math.round((count / stats.totalOrders) * 100)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Total Orders: {stats.totalOrders}</span>
                <span>Year: {stats.academicYear}</span>
              </div>
            </div>
          </div>

          {/* Dispatch Status Breakdown */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <Truck className="w-5 h-5 mr-2 text-green-600" />
              Dispatch Status Breakdown
            </h2>
            <div className="space-y-4">
              {Object.entries(stats.dispatchStats).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className={`w-3 h-3 rounded-full mr-3 ${
                        status === "delivered"
                          ? "bg-green-500"
                          : status === "dispatched"
                          ? "bg-blue-500"
                          : status === "processing"
                          ? "bg-purple-500"
                          : "bg-gray-500"
                      }`}
                    ></div>
                    <span className="font-medium text-gray-700 capitalize">
                      {status}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-semibold text-gray-900 mr-3">
                      {count}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({Math.round((count / stats.totalOrders) * 100)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Processed: {stats.dispatchStats.dispatched + stats.dispatchStats.delivered}</span>
                <span>Pending: {stats.dispatchStats.pending}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Books by Type */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-purple-600" />
            Books Distribution by Type
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(stats.booksByType || {}).map(([type, count]) => (
              <div
                key={type}
                className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{type}</h3>
                  <span className="text-sm font-semibold text-blue-600">
                    {formatNumber(count)}
                  </span>
                </div>
                <div className="text-xs text-gray-500">Books ordered</div>
                <div className="mt-3">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{
                        width: `${(count / Math.max(...Object.values(stats.booksByType || {}))) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {Object.keys(stats.booksByType || {}).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No book data available for this period
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Average Order Value</h3>
                <p className="text-3xl font-bold mt-2">
                  {formatCurrency(stats.revenue / (stats.totalOrders || 1))}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 opacity-50" />
            </div>
            <p className="mt-4 text-blue-100 text-sm">
              Total revenue divided by total orders
            </p>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Payment Collection Rate</h3>
                <p className="text-3xl font-bold mt-2">
                  {Math.round((stats.paymentStats.paid / (stats.totalOrders || 1)) * 100)}%
                </p>
              </div>
              <CheckCircle className="w-12 h-12 opacity-50" />
            </div>
            <p className="mt-4 text-green-100 text-sm">
              Percentage of fully paid orders
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDashboardPage;