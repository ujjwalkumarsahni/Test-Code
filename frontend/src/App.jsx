import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/auth/Login';
import  Layout  from './components/Layout';
import Schools from './pages/School/Schools';
import CreateOrderPage from './pages/OrderManagemet/Orders';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Schools />} /> {/* Default to Schools */}
          <Route path="schools" element={<Schools />} />
          <Route path="orders" element={<CreateOrderPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;