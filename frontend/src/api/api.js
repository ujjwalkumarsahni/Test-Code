import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    return Promise.reject(message);
  }
);

// School APIs
export const schoolAPI = {
  // Get all schools
  getSchools: (params) => api.get('/schools', { params }),
  
  // Get single school
  getSchool: (id) => api.get(`/schools/${id}`),
  
  // Create school
  createSchool: (data) => api.post('/schools', data),
  
  // Update school
  updateSchool: (id, data) => api.put(`/schools/${id}`, data),
  
  // Delete school
  deleteSchool: (id) => api.delete(`/schools/${id}`),
  
  // Get school stats
  getSchoolStats: () => api.get('/schools/dashboard/stats'),
  
  // Get school trainers
  getSchoolTrainers: (id) => api.get(`/schools/${id}/trainers`),
};

// Order APIs
export const orderAPI = {
  // Get book catalog structure
  getBookStructure: () => api.get('/orders/books/structure'),
  
  // Get book catalog
  getBookCatalog: (params) => api.get('/orders/books/catalog', { params }),
  
  // Create book catalog entry
  createBookCatalog: (data) => api.post('/orders/books/catalog', data),
  
  // Update book catalog entry
  updateBookCatalog: (id, data) => api.put(`/orders/books/catalog/${id}`, data),
  
  // Delete book catalog entry
  deleteBookCatalog: (id) => api.delete(`/orders/books/catalog/${id}`),
  
  // Create order
  createOrder: (data) => api.post('/orders', data),
  
  // Get all orders
  getOrders: (params) => api.get('/orders', { params }),
  
  // Get single order
  getOrder: (id) => api.get(`/orders/${id}`),
  
  // Update order
  updateOrder: (id, data) => api.put(`/orders/${id}`, data),
  
  // Delete order
  deleteOrder: (id) => api.delete(`/orders/${id}`),
  
  // Update payment status
  updatePaymentStatus: (id, data) => api.patch(`/orders/${id}/payment`, data),
  
  // Dispatch order
  dispatchOrder: (id, data) => api.patch(`/orders/${id}/dispatch`, data),
  
  // Get order stats
  getOrderStats: (params) => api.get('/orders/dashboard/stats', { params }),
  
  // Generate invoice
  generateInvoice: (id) => api.get(`/orders/${id}/invoice`),
  
  // Download invoice PDF
  downloadInvoice: (id) => {
    return api.get(`/orders/${id}/invoice`, {
      responseType: 'blob',
    });
  },
};


// Export everything
export default {
  schoolAPI,
  orderAPI
};