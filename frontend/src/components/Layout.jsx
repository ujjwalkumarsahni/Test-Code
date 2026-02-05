// import React from 'react';
// import { Outlet } from 'react-router-dom';
// import Header from './Header';

// const Layout = () => {
//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Header />
      
//       {/* Main Content Area */}
//       <main className="p-4 sm:p-6 lg:p-8">
//         <Outlet />
//       </main>
//     </div>
//   );
// };

// export default Layout;


// frontend/src/components/Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header.jsx';
import Sidebar from './Sidebar.jsx';

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;