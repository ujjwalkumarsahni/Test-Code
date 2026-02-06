import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import { Toaster } from 'react-hot-toast';

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Main Content Area */}
      <main className="p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>

       <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#FFFFFF',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#FFFFFF',
            },
          },
          loading: {
            duration: Infinity,
          },
        }}
      />
    </div>
  );
};

export default Layout;


// // frontend/src/components/Layout.jsx
// import React from 'react';
// import { Outlet } from 'react-router-dom';
// import Header from './Header.jsx';
// import Sidebar from './Sidebar.jsx';

// const Layout = () => {
//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Header />
//       <div className="flex">
//         <Sidebar />
//         <main className="flex-1 overflow-auto">
//           <Outlet />
//         </main>
//       </div>
//     </div>
//   );
// };

// export default Layout;