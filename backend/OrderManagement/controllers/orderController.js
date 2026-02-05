import asyncHandler from "express-async-handler";
import Order from "../models/Order.js";
import School from "../models/School.js";

// @desc    Create new order
// @route   POST /api/orders
// @access  Private/Admin/HR
export const createOrder = asyncHandler(async (req, res) => {
  const {
    school,
    academicYear,
    orderItems,
    kitItems,
    discount,
    toAddress
  } = req.body;

  // Validate school
  const schoolData = await School.findById(school);
  if (!schoolData) {
    res.status(404);
    throw new Error("School not found");
  }

  // Validate order items
  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error("At least one book/item is required");
  }

  // Calculate totals
  const calculateItemTotal = (items) => {
    return items.reduce((sum, item) => {
      const total = item.quantity * item.unitPrice;
      return sum + total;
    }, 0);
  };

  const orderItemsWithTotals = orderItems.map(item => ({
    ...item,
    totalPrice: item.quantity * item.unitPrice
  }));

  const kitItemsWithTotals = kitItems ? kitItems.map(item => ({
    ...item,
    totalPrice: item.quantity * item.unitPrice
  })) : [];

  const orderItemsTotal = calculateItemTotal(orderItems);
  const kitItemsTotal = calculateItemTotal(kitItems || []);
  const subtotal = orderItemsTotal + kitItemsTotal;
  const totalAmount = subtotal - (discount || 0);

  if (totalAmount < 0) {
    res.status(400);
    throw new Error("Discount cannot be greater than total amount");
  }

  // Create order
  const order = await Order.create({
    school,
    schoolName: schoolData.name,
    academicYear,
    orderItems: orderItemsWithTotals,
    kitItems: kitItemsWithTotals,
    discount: discount || 0,
    subtotal,
    totalAmount,
    toAddress: {
      ...toAddress,
      name: toAddress.name || schoolData.contactPersonName,
      mobile: toAddress.mobile || schoolData.mobile,
      email: toAddress.email || schoolData.email,
      address: toAddress.address || schoolData.address,
      city: toAddress.city || schoolData.city
    },
    createdBy: req.user._id,
    updatedBy: req.user._id
  });

  const populatedOrder = await Order.findById(order._id)
    .populate('school', 'name city address contactPersonName mobile email')
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');

  res.status(201).json({
    success: true,
    data: populatedOrder
  });
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin/HR
export const getOrders = asyncHandler(async (req, res) => {
  const {
    school,
    academicYear,
    paymentStatus,
    dispatchStatus,
    startDate,
    endDate,
    search
  } = req.query;

  let query = {};

  if (school) query.school = school;
  if (academicYear) query.academicYear = academicYear;
  if (paymentStatus) query.paymentStatus = paymentStatus;
  if (dispatchStatus) query.dispatchStatus = dispatchStatus;

  // Date range filter
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  // Search by invoice number or school name
  if (search) {
    query.$or = [
      { invoiceNumber: new RegExp(search, 'i') },
      { schoolName: new RegExp(search, 'i') }
    ];
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const orders = await Order.find(query)
    .populate('school', 'name city')
    .populate('createdBy', 'name email')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  const total = await Order.countDocuments(query);

  // Add virtuals to response
  const ordersWithVirtuals = orders.map(order => ({
    ...order.toObject(),
    isEditable: order.dispatchStatus === 'pending' || order.dispatchStatus === 'processing'
  }));

  res.json({
    success: true,
    count: orders.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
    data: ordersWithVirtuals
  });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('school', 'name city address contactPersonName mobile email')
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email')
    .populate('dispatchedBy', 'name email');

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const orderData = {
    ...order.toObject(),
    isEditable: order.dispatchStatus === 'pending' || order.dispatchStatus === 'processing'
  };

  res.json({
    success: true,
    data: orderData
  });
});

// @desc    Update order
// @route   PUT /api/orders/:id
// @access  Private/Admin/HR
export const updateOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // Check if order is editable
  if (!(order.dispatchStatus === 'pending' || order.dispatchStatus === 'processing')) {
    res.status(400);
    throw new Error("Cannot edit dispatched/delivered order");
  }

  const {
    orderItems,
    kitItems,
    discount,
    toAddress
  } = req.body;

  // Calculate new totals
  const calculateItemTotal = (items) => {
    return items.reduce((sum, item) => {
      const total = item.quantity * item.unitPrice;
      return sum + total;
    }, 0);
  };

  const orderItemsWithTotals = orderItems.map(item => ({
    ...item,
    totalPrice: item.quantity * item.unitPrice
  }));

  const kitItemsWithTotals = kitItems ? kitItems.map(item => ({
    ...item,
    totalPrice: item.quantity * item.unitPrice
  })) : [];

  const orderItemsTotal = calculateItemTotal(orderItems);
  const kitItemsTotal = calculateItemTotal(kitItems || []);
  const subtotal = orderItemsTotal + kitItemsTotal;
  const totalAmount = subtotal - (discount || 0);

  if (totalAmount < 0) {
    res.status(400);
    throw new Error("Discount cannot be greater than total amount");
  }

  // Update order
  order.orderItems = orderItemsWithTotals;
  order.kitItems = kitItemsWithTotals;
  order.discount = discount || 0;
  order.subtotal = subtotal;
  order.totalAmount = totalAmount;
  
  if (toAddress) {
    order.toAddress = {
      ...order.toAddress,
      ...toAddress
    };
  }
  
  order.updatedBy = req.user._id;
  
  await order.save();

  const updatedOrder = await Order.findById(order._id)
    .populate('school', 'name city address contactPersonName mobile email')
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');

  res.json({
    success: true,
    data: updatedOrder
  });
});

// @desc    Update payment status
// @route   PATCH /api/orders/:id/payment
// @access  Private/Admin/HR
export const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { paymentStatus } = req.body;

  if (!['pending', 'paid', 'partial'].includes(paymentStatus)) {
    res.status(400);
    throw new Error("Invalid payment status");
  }

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      paymentStatus,
      updatedBy: req.user._id
    },
    { new: true, runValidators: true }
  )
    .populate('school', 'name city')
    .populate('updatedBy', 'name email');

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  res.json({
    success: true,
    data: order
  });
});

// @desc    Dispatch order
// @route   PATCH /api/orders/:id/dispatch
// @access  Private/Admin/HR
export const dispatchOrder = asyncHandler(async (req, res) => {
  const { dispatchStatus, notes, fromAddress } = req.body;

  if (!['processing', 'dispatched', 'delivered'].includes(dispatchStatus)) {
    res.status(400);
    throw new Error("Invalid dispatch status");
  }

  const updateData = {
    dispatchStatus,
    notes,
    updatedBy: req.user._id
  };

  if (dispatchStatus === 'dispatched') {
    updateData.dispatchedAt = new Date();
    updateData.dispatchedBy = req.user._id;
  }

  if (fromAddress) {
    updateData.fromAddress = fromAddress;
  }

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  )
    .populate('school', 'name city address contactPersonName mobile email')
    .populate('dispatchedBy', 'name email')
    .populate('updatedBy', 'name email');

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  res.json({
    success: true,
    data: order
  });
});

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private/Admin/HR
export const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // Check if order can be deleted
  if (order.dispatchStatus !== 'pending') {
    res.status(400);
    throw new Error("Cannot delete order that has been processed");
  }

  await order.deleteOne();

  res.json({
    success: true,
    message: "Order deleted successfully"
  });
});

// @desc    Get order statistics
// @route   GET /api/orders/dashboard/stats
// @access  Private/Admin/HR
export const getOrderStats = asyncHandler(async (req, res) => {
  const { academicYear } = req.query;
  
  let query = {};
  if (academicYear) query.academicYear = academicYear;

  const currentYear = new Date().getFullYear();
  const defaultAcademicYear = `${currentYear}-${currentYear + 1}`;

  const yearToUse = academicYear || defaultAcademicYear;

  const [
    totalOrders,
    pendingPayment,
    paidOrders,
    pendingDispatch,
    dispatchedOrders,
    totalRevenue,
    ordersByBookType
  ] = await Promise.all([
    Order.countDocuments({ academicYear: yearToUse }),
    Order.countDocuments({ academicYear: yearToUse, paymentStatus: 'pending' }),
    Order.countDocuments({ academicYear: yearToUse, paymentStatus: 'paid' }),
    Order.countDocuments({ academicYear: yearToUse, dispatchStatus: 'pending' }),
    Order.countDocuments({ academicYear: yearToUse, dispatchStatus: 'dispatched' }),
    Order.aggregate([
      { $match: { academicYear: yearToUse } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]),
    Order.aggregate([
      { $match: { academicYear: yearToUse } },
      { $unwind: "$orderItems" },
      { $group: { _id: "$orderItems.bookType", count: { $sum: "$orderItems.quantity" } } }
    ])
  ]);

  res.json({
    success: true,
    data: {
      academicYear: yearToUse,
      totalOrders,
      paymentStats: {
        pending: pendingPayment,
        paid: paidOrders,
        partial: totalOrders - pendingPayment - paidOrders
      },
      dispatchStats: {
        pending: pendingDispatch,
        dispatched: dispatchedOrders,
        delivered: totalOrders - pendingDispatch - dispatchedOrders
      },
      revenue: totalRevenue[0]?.total || 0,
      booksByType: ordersByBookType.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {})
    }
  });
});

// @desc    Generate invoice PDF (stub for PDF generation)
// @route   GET /api/orders/:id/invoice
// @access  Private
export const generateInvoice = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('school', 'name city address contactPersonName mobile email')
    .populate('createdBy', 'name email');

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // Here you would typically generate a PDF
  // For now, return order data for frontend to generate PDF
  res.json({
    success: true,
    data: order,
    message: "Invoice data ready for PDF generation"
  });
});