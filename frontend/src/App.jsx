// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/auth/Login.jsx';
import Layout from './components/Layout.jsx';
import Schools from './pages/School/Schools.jsx';
import CreateOrderPage from './pages/OrderManagemet/CreateOrderPage.jsx';
import OrderListPage from './pages/OrderManagemet/OrderListPage.jsx';
import OrderDetailPage from './pages/OrderManagemet/OrderDetailPage.jsx';
import EditOrderPage from './pages/OrderManagemet/EditOrderPage.jsx';
import OrderDashboardPage from './pages/OrderManagemet/OrderDashboardPage.jsx';
import BookCatalogPage from './pages/OrderManagemet/BookCatalogPage.jsx';
import InvoicePage from './pages/OrderManagemet/InvoicePage.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Schools />} /> {/* Default to Schools */}
          <Route path="schools" element={<Schools />} />
          <Route path="create-order" element={<CreateOrderPage />} />
          <Route path="orders" element={<OrderListPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
          <Route path="orders/:id/edit" element={<EditOrderPage />} />
          <Route path="orders-dashboard" element={<OrderDashboardPage />} />
          <Route path="books-catalog" element={<BookCatalogPage />} />
          <Route path=":id/invoice" element={<InvoicePage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;