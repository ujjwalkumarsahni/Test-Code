// frontend/src/components/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  School,
  Package,
  BookOpen,
  BarChart,
  Settings,
  Users,
  Calendar,
  FileText,
  DollarSign,
  Truck,
  Bell,
  HelpCircle,
  Download
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  
  const navigationItems = [
    {
      title: 'Dashboard',
      items: [
        { path: '/', icon: <Home className="w-5 h-5" />, label: 'Overview' },
        { path: '/dashboard', icon: <BarChart className="w-5 h-5" />, label: 'Analytics' },
      ]
    },
    {
      title: 'Management',
      items: [
        { path: '/schools', icon: <School className="w-5 h-5" />, label: 'Schools' },
        { path: '/orders', icon: <Package className="w-5 h-5" />, label: 'Orders' },
        { path: '/orders/create', icon: <FileText className="w-5 h-5" />, label: 'Create Order' },
        { path: '/catalog', icon: <BookOpen className="w-5 h-5" />, label: 'Book Catalog' },
      ]
    },
    {
      title: 'Operations',
      items: [
        { path: '/dispatch', icon: <Truck className="w-5 h-5" />, label: 'Dispatch' },
        { path: '/payments', icon: <DollarSign className="w-5 h-5" />, label: 'Payments' },
        { path: '/inventory', icon: <Package className="w-5 h-5" />, label: 'Inventory' },
      ]
    },
    {
      title: 'Reports',
      items: [
        { path: '/reports/orders', icon: <FileText className="w-5 h-5" />, label: 'Order Reports' },
        { path: '/reports/sales', icon: <DollarSign className="w-5 h-5" />, label: 'Sales Reports' },
        { path: '/reports/schools', icon: <School className="w-5 h-5" />, label: 'School Reports' },
      ]
    },
    {
      title: 'Settings',
      items: [
        { path: '/settings', icon: <Settings className="w-5 h-5" />, label: 'System Settings' },
        { path: '/users', icon: <Users className="w-5 h-5" />, label: 'User Management' },
      ]
    }
  ];

  return (
    <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-80px)] overflow-y-auto">
      <div className="p-6">
        {/* User Quick Stats */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-900">Today's Summary</h3>
            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
              +12%
            </span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">New Orders</span>
              <span className="font-semibold text-blue-600">8</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pending Dispatch</span>
              <span className="font-semibold text-yellow-600">15</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Revenue</span>
              <span className="font-semibold text-green-600">₹42,500</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-8">
          {navigationItems.map((section) => (
            <div key={section.title}>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {section.title}
              </h4>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.path || 
                    (item.path !== '/' && location.pathname.startsWith(item.path));
                  
                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                          isActive
                            ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        <span className={`mr-3 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                          {item.icon}
                        </span>
                        {item.label}
                        {isActive && (
                          <span className="ml-auto w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Quick Actions */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Quick Actions
          </h4>
          <div className="space-y-2">
            <button className="w-full flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Export Reports
            </button>
            <button className="w-full flex items-center justify-center px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
              <Bell className="w-4 h-4 mr-2" />
              Set Reminder
            </button>
          </div>
        </div>

        {/* Help & Support */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button className="flex items-center text-sm text-gray-600 hover:text-gray-900">
            <HelpCircle className="w-4 h-4 mr-2" />
            Help & Support
          </button>
          <p className="mt-3 text-xs text-gray-500">
            Need help? Contact support@schoolsync.com
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;