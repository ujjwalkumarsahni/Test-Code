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

// Utility functions for order calculations
export const orderUtils = {
  // Calculate item total
  calculateItemTotal: (quantity, unitPrice) => {
    return quantity * unitPrice;
  },
  
  // Calculate order subtotal
  calculateSubtotal: (orderItems = [], kitItems = []) => {
    const orderTotal = orderItems.reduce((sum, item) => 
      sum + (item.quantity * item.unitPrice), 0);
    const kitTotal = kitItems.reduce((sum, item) => 
      sum + (item.quantity * item.unitPrice), 0);
    return orderTotal + kitTotal;
  },
  
  // Calculate final total with discount
  calculateFinalTotal: (subtotal, discount = 0) => {
    return Math.max(0, subtotal - discount);
  },
  
  // Format currency
  formatCurrency: (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  },
  
  // Generate default kit items
  getDefaultKitItems: () => [
    {
      kitType: 'Wonder Kit',
      kitName: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
    },
    {
      kitType: 'Nexus Kit',
      kitName: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
    },
  ],
  
  // Generate default order items by book type
  getDefaultOrderItems: (bookType) => {
    const defaults = {
      ELP: {
        bookType: 'ELP',
        grade: 'Pre-Nursery',
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0,
        isComboPack: false,
        isIndividualBook: false,
        bookName: '',
      },
      LTE: {
        bookType: 'LTE',
        grade: 'Grade 1',
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0,
      },
      CAC: {
        bookType: 'CAC',
        grade: 'Grade 1',
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0,
      },
      CTF: {
        bookType: 'CTF',
        grade: 'Grade 6',
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0,
      },
    };
    return { ...defaults[bookType] };
  },
  
  // Validate order data before submission
  validateOrderData: (orderData) => {
    const errors = {};
    
    if (!orderData.school) {
      errors.school = 'School is required';
    }
    
    if (!orderData.orderItems || orderData.orderItems.length === 0) {
      errors.orderItems = 'At least one book/item is required';
    } else {
      orderData.orderItems.forEach((item, index) => {
        if (!item.quantity || item.quantity < 1) {
          errors[`orderItems.${index}.quantity`] = 'Quantity must be at least 1';
        }
        if (!item.unitPrice || item.unitPrice < 0) {
          errors[`orderItems.${index}.unitPrice`] = 'Unit price must be positive';
        }
      });
    }
    
    if (orderData.kitItems) {
      orderData.kitItems.forEach((item, index) => {
        if (!item.quantity || item.quantity < 1) {
          errors[`kitItems.${index}.quantity`] = 'Quantity must be at least 1';
        }
        if (!item.unitPrice || item.unitPrice < 0) {
          errors[`kitItems.${index}.unitPrice`] = 'Unit price must be positive';
        }
        if (item.kitType === 'Individual Kit' && !item.kitName) {
          errors[`kitItems.${index}.kitName`] = 'Kit name is required for individual kits';
        }
      });
    }
    
    if (orderData.discount < 0) {
      errors.discount = 'Discount cannot be negative';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },
};

// Book catalog utility functions
export const bookCatalogUtils = {
  // ELP books structure
  ELP_BOOKS: {
    'Pre-Nursery': [
      { name: 'Math O Mania Part-1', code: 'ELP-PN-MOM1' },
      { name: 'Math O Mania Part-2', code: 'ELP-PN-MOM2' },
      { name: 'Alpha O Mania Part-1', code: 'ELP-PN-AOM1' },
      { name: 'Alpha O Mania Part-2', code: 'ELP-PN-AOM2' },
      { name: 'Pyare Axar Part-1', code: 'ELP-PN-PA1' },
      { name: 'Pyare Axar Part-2', code: 'ELP-PN-PA2' },
      { name: 'Pyare Axar Part-3', code: 'ELP-PN-PA3' },
      { name: 'Rhyme Book', code: 'ELP-PN-RB' },
      { name: 'Steamheartia', code: 'ELP-PN-ST' },
    ],
    'LKG': [
      { name: 'Axar Masti Part-1', code: 'ELP-LKG-AM1' },
      { name: 'Axar Masti Part-2', code: 'ELP-LKG-AM2' },
      { name: 'Letter Land Heroes', code: 'ELP-LKG-LLH' },
      { name: 'Number Nuts Part-1', code: 'ELP-LKG-NN1' },
      { name: 'Number Nuts Part-2', code: 'ELP-LKG-NN2' },
      { name: 'Rhyme Book', code: 'ELP-LKG-RB' },
      { name: 'SoundTopia', code: 'ELP-LKG-ST' },
      { name: 'Thinky Tots Lab', code: 'ELP-LKG-TTL' },
    ],
    'UKG': [
      { name: 'Kahani Kadam Part-1', code: 'ELP-UKG-KK1' },
      { name: 'Kahani Kadam Part-2', code: 'ELP-UKG-KK2' },
      { name: 'Number Bots Part-1', code: 'ELP-UKG-NB1' },
      { name: 'Number Bots Part-2', code: 'ELP-UKG-NB2' },
      { name: 'PenPals Paradise Part-1', code: 'ELP-UKG-PPP1' },
      { name: 'SoundSpark Part-1', code: 'ELP-UKG-SS1' },
      { name: 'Rhyme Bunny', code: 'ELP-UKG-RB' },
      { name: 'Tiny Tinker Lab', code: 'ELP-UKG-TTL' },
    ],
  },
  
  // LTE books
  LTE_BOOKS: [
    { grade: 'Grade 1', name: 'LTE Grade 1', code: 'LTE-G1' },
    { grade: 'Grade 2', name: 'LTE Grade 2', code: 'LTE-G2' },
    { grade: 'Grade 3', name: 'LTE Grade 3', code: 'LTE-G3' },
    { grade: 'Grade 4', name: 'LTE Grade 4', code: 'LTE-G4' },
    { grade: 'Grade 5', name: 'LTE Grade 5', code: 'LTE-G5' },
  ],
  
  // CAC books
  CAC_BOOKS: [
    { grade: 'Grade 1', name: 'CAC Grade 1', code: 'CAC-G1' },
    { grade: 'Grade 2', name: 'CAC Grade 2', code: 'CAC-G2' },
    { grade: 'Grade 3', name: 'CAC Grade 3', code: 'CAC-G3' },
    { grade: 'Grade 4', name: 'CAC Grade 4', code: 'CAC-G4' },
    { grade: 'Grade 5', name: 'CAC Grade 5', code: 'CAC-G5' },
    { grade: 'Grade 6', name: 'CAC Grade 6', code: 'CAC-G6' },
    { grade: 'Grade 7', name: 'CAC Grade 7', code: 'CAC-G7' },
    { grade: 'Grade 8', name: 'CAC Grade 8', code: 'CAC-G8' },
  ],
  
  // CTF books
  CTF_BOOKS: [
    { grade: 'Grade 6', name: 'CTF Grade 6', code: 'CTF-G6' },
    { grade: 'Grade 7', name: 'CTF Grade 7', code: 'CTF-G7' },
    { grade: 'Grade 8', name: 'CTF Grade 8', code: 'CTF-G8' },
    { grade: 'Grade 9-12', name: 'CTF Grade 9-12', code: 'CTF-G9-12' },
  ],
  
  // Get books by type and grade
  getBooksByTypeAndGrade: (bookType, grade) => {
    switch (bookType) {
      case 'ELP':
        return this.ELP_BOOKS[grade] || [];
      case 'LTE':
        return this.LTE_BOOKS.filter(book => book.grade === grade);
      case 'CAC':
        return this.CAC_BOOKS.filter(book => book.grade === grade);
      case 'CTF':
        return this.CTF_BOOKS.filter(book => book.grade === grade);
      default:
        return [];
    }
  },
  
  // Get all grades for book type
  getGradesByBookType: (bookType) => {
    switch (bookType) {
      case 'ELP':
        return ['Pre-Nursery', 'LKG', 'UKG'];
      case 'LTE':
        return ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'];
      case 'CAC':
        return ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8'];
      case 'CTF':
        return ['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9-12'];
      default:
        return [];
    }
  },
  
  // Get default price for book
  getDefaultPrice: (bookType, grade, bookName) => {
    const defaultPrices = {
      'ELP': {
        'Pre-Nursery': 150,
        'LKG': 160,
        'UKG': 170,
      },
      'LTE': {
        'Grade 1': 250,
        'Grade 2': 250,
        'Grade 3': 250,
        'Grade 4': 250,
        'Grade 5': 250,
      },
      'CAC': {
        'Grade 1': 300,
        'Grade 2': 300,
        'Grade 3': 300,
        'Grade 4': 300,
        'Grade 5': 300,
        'Grade 6': 300,
        'Grade 7': 300,
        'Grade 8': 300,
      },
      'CTF': {
        'Grade 6': 350,
        'Grade 7': 350,
        'Grade 8': 350,
        'Grade 9-12': 400,
      },
      'KITS': {
        'Wonder Kit': 500,
        'Nexus Kit': 600,
        'Individual Kit': 750,
      },
    };
    
    if (bookType === 'KITS') {
      return defaultPrices.KITS[bookName] || 0;
    }
    
    return defaultPrices[bookType]?.[grade] || 0;
  },
};

// Export everything
export default {
  schoolAPI,
  orderAPI,
  orderUtils,
  bookCatalogUtils,
};