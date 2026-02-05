// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Login from './pages/auth/Login.jsx';
// import  Layout  from './components/Layout.jsx';
// import Schools from './pages/School/Schools.jsx';
// import CreateOrderPage from './pages/OrderManagemet/CreateOrderPage.jsx';

// function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/login" element={<Login />} />
//         <Route path="/" element={<Layout />}>
//           <Route index element={<Schools />} /> {/* Default to Schools */}
//           <Route path="schools" element={<Schools />} />
//           <Route path="create-order" element={<CreateOrderPage />} />
//         </Route>
//       </Routes>
//     </Router>
//   );
// }

// export default App;


// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/auth/Login';
// import Login from './pages/auth/Login.jsx';
import Layout from './components/Layout.jsx';
import Schools from './pages/School/Schools.jsx';
import OrdersPage from './pages/OrderManagemet/OrdersPage.jsx';
import CreateOrderPage from './pages/OrderManagemet/CreateOrderPage.jsx';
import OrderDetailPage from './pages/OrderManagemet/OrderDetailPage.jsx';
import InvoicePage from './pages/OrderManagemet/InvoicePage.jsx';
import BookCatalogPage from './pages/OrderManagemet/BookCatalogPage.jsx';
import OrderDashboardPage from './pages/OrderManagemet/OrderDashboardPage.jsx';
// import Schools from './pages/School/Schools.jsx';
// import CreateOrderPage from './pages/OrderManagement/CreateOrderPage.jsx';
// import OrdersPage from './pages/OrderManagement/OrdersPage.jsx';
// import OrderDetailPage from './pages/OrderManagement/OrderDetailPage.jsx';
// import BookCatalogPage from './pages/OrderManagement/BookCatalogPage.jsx';
// import OrderDashboardPage from './pages/OrderManagement/OrderDashboardPage.jsx';
// import InvoicePage from './pages/OrderManagement/InvoicePage.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Schools />} /> {/* Default to Schools */}
          <Route path="schools" element={<Schools />} />
          <Route path="orders">
            <Route index element={<OrdersPage />} />
            <Route path="create" element={<CreateOrderPage />} />
            <Route path=":id" element={<OrderDetailPage />} />
            <Route path=":id/edit" element={<OrderDetailPage />} />
            <Route path=":id/invoice" element={<InvoicePage />} />
          </Route>
          <Route path="catalog" element={<BookCatalogPage />} />
          <Route path="dashboard" element={<OrderDashboardPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;