import express from 'express';
import {
  createOrder,
  getOrders,
  getOrder,
  updateOrder,
  deleteOrder,
  updatePaymentStatus,
  dispatchOrder,
  getOrderStats,
  generateInvoice
} from '../controllers/orderController.js';

import {
  getBookCatalog,
  getBookStructure,
  createBookCatalog,
  updateBookCatalog,
  deleteBookCatalog
} from '../controllers/bookCatalogController.js';

import { authenticate } from '../middleware/auth.js';
import { requireAdminOrHR } from '../middleware/profileCompletion.js';

const router = express.Router();

// Book catalog routes
router.route('/books/catalog')
  .get(authenticate, getBookCatalog)
  .post(authenticate, requireAdminOrHR, createBookCatalog);

router.route('/books/structure')
  .get(authenticate, getBookStructure);

router.route('/books/catalog/:id')
  .put(authenticate, requireAdminOrHR, updateBookCatalog)
  .delete(authenticate, requireAdminOrHR, deleteBookCatalog);

// Order routes
router.route('/')
  .get(authenticate, requireAdminOrHR, getOrders)
  .post(authenticate, requireAdminOrHR, createOrder);

router.route('/dashboard/stats')
  .get(authenticate, requireAdminOrHR, getOrderStats);

router.route('/:id')
  .get(authenticate, getOrder)
  .put(authenticate, requireAdminOrHR, updateOrder)
  .delete(authenticate, requireAdminOrHR, deleteOrder);

router.route('/:id/payment')
  .patch(authenticate, requireAdminOrHR, updatePaymentStatus);

router.route('/:id/dispatch')
  .patch(authenticate, requireAdminOrHR, dispatchOrder);

router.route('/:id/invoice')
  .get(authenticate, generateInvoice);

export default router;