// import React, { useState } from 'react';
// import { Link, useNavigate, useLocation } from 'react-router-dom';
// import { 
//   School, 
//   Package,
//   LogOut,
//   User,
//   ChevronDown,
//   Building,
//   Bell,
//   Settings
// } from 'lucide-react';
// import { toast } from 'react-hot-toast';

// const Header = () => {
//   const [userDropdown, setUserDropdown] = useState(false);
//   const navigate = useNavigate();
//   const location = useLocation();

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     toast.success('Logged out successfully');
//     navigate('/login');
//   };

//   const user = JSON.parse(localStorage.getItem('user') || '{}');

//   // Navigation items - only two as requested
//   const navItems = [
//     { 
//       path: '/schools', 
//       icon: <School className="w-4 h-4" />, 
//       label: 'Schools',
//       active: location.pathname.startsWith('/schools')
//     },
//     { 
//       path: '/create-order', 
//       icon: <Package className="w-4 h-4" />, 
//       label: 'Create Order',
//       active: location.pathname.startsWith('/create-order')
//     }
//   ];

//   return (
//     <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
//       <div className="px-6 py-4">
//         {/* Top Row - Logo and User Controls */}
//         <div className="flex items-center justify-between">
//           {/* Left: Logo */}
//           <Link to="/" className="flex items-center space-x-3">
//             <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg">
//               <Building className="w-6 h-6 text-white" />
//             </div>
//             <div>
//               <h1 className="text-xl font-bold text-gray-900">SchoolSync</h1>
//               <p className="text-xs text-gray-500">Management System</p>
//             </div>
//           </Link>

//           {/* Right: User Controls */}
//           <div className="flex items-center space-x-4">
//             {/* Notifications */}
//             <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors relative">
//               <Bell className="w-5 h-5" />
//               <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
//                 3
//               </span>
//             </button>

//             {/* User Dropdown */}
//             <div className="relative">
//               <button 
//                 onClick={() => setUserDropdown(!userDropdown)}
//                 className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
//               >
//                 <div className="text-right">
//                   <p className="text-sm font-semibold text-gray-900">{user.name || 'Admin User'}</p>
//                   <p className="text-xs text-gray-500 capitalize">{user.role || 'Admin'}</p>
//                 </div>
//                 <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow">
//                   <User className="w-5 h-5 text-white" />
//                 </div>
//                 <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${
//                   userDropdown ? 'rotate-180' : ''
//                 }`} />
//               </button>

//               {/* Dropdown Menu */}
//               {userDropdown && (
//                 <>
//                   <div 
//                     className="fixed inset-0 z-40"
//                     onClick={() => setUserDropdown(false)}
//                   />
//                   <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
//                     {/* User Info */}
//                     <div className="px-4 py-3 border-b border-gray-100">
//                       <div className="flex items-center space-x-3">
//                         <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
//                           <User className="w-5 h-5 text-white" />
//                         </div>
//                         <div>
//                           <p className="text-sm font-bold text-gray-900">{user.name || 'Admin User'}</p>
//                           <p className="text-xs text-gray-600 capitalize">{user.role || 'Admin'}</p>
//                           <p className="text-xs text-gray-400 mt-1 truncate max-w-[140px]">
//                             {user.email || 'admin@schoolsync.com'}
//                           </p>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Dropdown Items */}
//                     <div className="py-1">
//                       <button
//                         onClick={() => {
//                           setUserDropdown(false);
//                           navigate('/profile');
//                         }}
//                         className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
//                       >
//                         <User className="w-4 h-4 mr-3 text-gray-400" />
//                         My Profile
//                       </button>
//                       <div className="border-t border-gray-100 mt-1 pt-1">
//                         <button
//                           onClick={handleLogout}
//                           className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
//                         >
//                           <LogOut className="w-4 h-4 mr-3" />
//                           Logout
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Bottom Row - Navigation Tabs (Only two items) */}
//         <div className="mt-4">
//           <div className="flex items-center space-x-1 border-b border-gray-200">
//             {navItems.map((item) => (
//               <Link
//                 key={item.path}
//                 to={item.path}
//                 className={`flex items-center px-6 py-3 text-sm font-medium transition-all duration-200 border-b-2 ${
//                   item.active
//                     ? 'border-blue-600 text-blue-700 bg-blue-50 font-semibold'
//                     : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
//                 }`}
//               >
//                 {item.icon}
//                 <span className="ml-2">{item.label}</span>
//                 {item.active && (
//                   <div className="ml-2 w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
//                 )}
//               </Link>
//             ))}
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Header;


// frontend/src/components/Header.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  School, 
  Package,
  LogOut,
  User,
  ChevronDown,
  Building,
  Bell,
  Home,
  BookOpen,
  BarChart,
  Menu,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Header = () => {
  const [userDropdown, setUserDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Main navigation items (visible on desktop)
  const mainNavItems = [
    { 
      path: '/schools', 
      icon: <School className="w-4 h-4" />, 
      label: 'Schools',
      active: location.pathname.startsWith('/schools')
    },
    { 
      path: '/orders', 
      icon: <Package className="w-4 h-4" />, 
      label: 'Orders',
      active: location.pathname.startsWith('/orders') && 
              !location.pathname.startsWith('/orders/create')
    },
    { 
      path: '/orders/create', 
      icon: <Package className="w-4 h-4" />, 
      label: 'Create Order',
      active: location.pathname === '/orders/create'
    }
  ];

  // All navigation items for mobile menu
  const allNavItems = [
    { 
      path: '/', 
      icon: <Home className="w-5 h-5" />, 
      label: 'Dashboard',
      active: location.pathname === '/'
    },
    ...mainNavItems,
    { 
      path: '/catalog', 
      icon: <BookOpen className="w-5 h-5" />, 
      label: 'Book Catalog',
      active: location.pathname === '/catalog'
    },
    { 
      path: '/dashboard', 
      icon: <BarChart className="w-5 h-5" />, 
      label: 'Analytics',
      active: location.pathname === '/dashboard'
    }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Logo and Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">SchoolSync</h1>
                <p className="text-xs text-gray-500">Management System</p>
              </div>
            </Link>
          </div>

          {/* Center: Main Navigation (Desktop) */}
          <div className="hidden lg:flex items-center space-x-1">
            {mainNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg ${
                  item.active
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {item.icon}
                <span className="ml-2">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Right: User Controls */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <button className="hidden sm:flex p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </button>

            {/* User Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setUserDropdown(!userDropdown)}
                className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-semibold text-gray-900">{user.name || 'Admin User'}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role || 'Admin'}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow">
                  <User className="w-5 h-5 text-white" />
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${
                  userDropdown ? 'rotate-180' : ''
                }`} />
              </button>

              {/* Dropdown Menu */}
              {userDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setUserDropdown(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{user.name || 'Admin User'}</p>
                          <p className="text-xs text-gray-600 capitalize">{user.role || 'Admin'}</p>
                          <p className="text-xs text-gray-400 mt-1 truncate max-w-[140px]">
                            {user.email || 'admin@schoolsync.com'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Dropdown Items */}
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setUserDropdown(false);
                          navigate('/profile');
                        }}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <User className="w-4 h-4 mr-3 text-gray-400" />
                        My Profile
                      </button>
                      <button
                        onClick={() => {
                          setUserDropdown(false);
                          navigate('/settings');
                        }}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Settings className="w-4 h-4 mr-3 text-gray-400" />
                        Settings
                      </button>
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
            <div className="grid grid-cols-2 gap-2">
              {allNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex flex-col items-center justify-center p-3 text-sm font-medium transition-all duration-200 rounded-lg ${
                    item.active
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <div className="mb-1">{item.icon}</div>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Secondary Navigation (Sub-menu for orders) */}
        {location.pathname.startsWith('/orders') && location.pathname !== '/orders/create' && (
          <div className="mt-4 hidden lg:block">
            <div className="flex items-center space-x-1 border-b border-gray-200">
              <Link
                to="/orders"
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  location.pathname === '/orders'
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                All Orders
              </Link>
              <Link
                to="/catalog"
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  location.pathname === '/catalog'
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Book Catalog
              </Link>
              <Link
                to="/dashboard"
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  location.pathname === '/dashboard'
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Analytics
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;