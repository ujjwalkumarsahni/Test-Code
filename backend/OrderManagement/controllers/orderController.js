import asyncHandler from "express-async-handler";
import Order from "../models/Order.js";
import School from "../models/School.js";
import PDFDocument from "pdfkit";

export const createOrder = asyncHandler(async (req, res) => {
  const {
    school,
    academicYear,
    orderItems,
    kitItems,
    discountPercentage,
    discountAmount,
    toAddress,
  } = req.body;

  // Validate school
  const schoolData = await School.findById(school);
  if (!schoolData) {
    res.status(404);
    throw new Error("School not found");
  }

  // Check for existing active order
  const existingOrder = await Order.findOne({
    school,
    $or: [
      { paymentStatus: { $ne: "paid" } },
      { dispatchStatus: { $ne: "delivered" } },
    ],
  });

  if (existingOrder) {
    res.status(400);
    throw new Error("School already has an active order");
  }

  // Validate items
  const hasValidOrderItems = Array.isArray(orderItems) && orderItems.length > 0;
  const hasValidKitItems = Array.isArray(kitItems) && kitItems.length > 0;

  if (!hasValidOrderItems && !hasValidKitItems) {
    res.status(400);
    throw new Error("At least one book or kit is required");
  }

  // Calculate totals
  const calculateItemTotal = (items) => {
    return items.reduce((sum, item) => {
      const total = item.quantity * item.unitPrice;
      return sum + total;
    }, 0);
  };

  const orderItemsWithTotals = orderItems.map((item) => ({
    ...item,
    totalPrice: item.quantity * item.unitPrice,
  }));

  const kitItemsWithTotals = kitItems
    ? kitItems.map((item) => ({
        ...item,
        totalPrice: item.quantity * item.unitPrice,
      }))
    : [];

  const orderItemsTotal = calculateItemTotal(orderItems);
  const kitItemsTotal = calculateItemTotal(kitItems || []);
  const subtotal = orderItemsTotal + kitItemsTotal;

  // Calculate discount amount from percentage if not provided
  let finalDiscountAmount = discountAmount || 0;
  if (discountPercentage) {
    finalDiscountAmount = (discountPercentage / 100) * subtotal;
  }

  const totalAmount = subtotal - finalDiscountAmount;

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
    discountPercentage: discountPercentage || 0,
    discount: finalDiscountAmount,
    subtotal,
    totalAmount,
    toAddress: {
      ...toAddress,
      name: toAddress.name || schoolData.contactPersonName,
      mobile: toAddress.mobile || schoolData.mobile,
      email: toAddress.email || schoolData.email,
      address: toAddress.address || schoolData.address,
      city: toAddress.city || schoolData.city,
    },
    createdBy: req.user._id,
    updatedBy: req.user._id,
  });

  const populatedOrder = await Order.findById(order._id)
    .populate("school", "name city address contactPersonName mobile email")
    .populate("createdBy", "name email")
    .populate("updatedBy", "name email");

  res.status(201).json({
    success: true,
    data: populatedOrder,
  });
});

// Get all orders
export const getOrders = asyncHandler(async (req, res) => {
  const {
    school,
    academicYear,
    paymentStatus,
    dispatchStatus,
    startDate,
    endDate,
    search,
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
      { invoiceNumber: new RegExp(search, "i") },
      { schoolName: new RegExp(search, "i") },
    ];
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const orders = await Order.find(query)
    .populate("school", "name city")
    .populate("createdBy", "name email")
    .sort("-createdAt")
    .skip(skip)
    .limit(limit);

  const total = await Order.countDocuments(query);

  // Add virtuals to response
  const ordersWithVirtuals = orders.map((order) => ({
    ...order.toObject(),
    isEditable:
      order.dispatchStatus === "pending" ||
      order.dispatchStatus === "processing",
  }));

  res.json({
    success: true,
    count: orders.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
    data: ordersWithVirtuals,
  });
});

// Get single order
export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("school", "name city address contactPersonName mobile email")
    .populate("createdBy", "name email")
    .populate("updatedBy", "name email")
    .populate("dispatchedBy", "name email");

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const orderData = {
    ...order.toObject(),
    // UPDATED: Editable only when dispatch status is "pending"
    isEditable: order.dispatchStatus === "pending",
  };

  res.json({
    success: true,
    data: orderData,
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
  if (
    !(
      order.dispatchStatus === "pending" ||
      order.dispatchStatus === "processing"
    )
  ) {
    res.status(400);
    throw new Error("Cannot edit dispatched/delivered order");
  }

  const { orderItems, kitItems, discount, toAddress } = req.body;

  // Calculate new totals
  const calculateItemTotal = (items) => {
    return items.reduce((sum, item) => {
      const total = item.quantity * item.unitPrice;
      return sum + total;
    }, 0);
  };

  const orderItemsWithTotals = orderItems.map((item) => ({
    ...item,
    totalPrice: item.quantity * item.unitPrice,
  }));

  const kitItemsWithTotals = kitItems
    ? kitItems.map((item) => ({
        ...item,
        totalPrice: item.quantity * item.unitPrice,
      }))
    : [];

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
      ...toAddress,
    };
  }

  order.updatedBy = req.user._id;

  await order.save();

  const updatedOrder = await Order.findById(order._id)
    .populate("school", "name city address contactPersonName mobile email")
    .populate("createdBy", "name email")
    .populate("updatedBy", "name email");

  res.json({
    success: true,
    data: updatedOrder,
  });
});

// Update payment status
export const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { paidAmount, paymentMethod, notes, paymentStatus } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) throw new Error("Order not found");

  // Validate state transitions
  if (paymentStatus === "pending") {
    // Cannot go back to pending if already paid/partial
    if (order.paymentStatus !== "pending") {
      throw new Error("Cannot revert to pending once payment has been made");
    }

    order.paidAmount = 0;
    order.remainingAmount = order.totalAmount;
    order.paymentStatus = "pending";
    order.paymentDate = null;
    order.paymentMethod = null;
    order.updatedBy = req.user._id;

    await order.save();
    return res.json({ success: true, data: order });
  }

  // For "paid" status - validation
  if (paymentStatus === "paid") {
    // Cannot mark as paid if already paid
    if (order.paymentStatus === "paid") {
      throw new Error("Order is already paid");
    }

    const amount = Number(paidAmount);
    if (!amount || amount <= 0) {
      throw new Error("Valid paid amount required");
    }

    // For marking as paid, amount should be remaining balance
    if (amount < order.remainingAmount) {
      throw new Error(
        `To mark as paid, amount must be at least ${order.remainingAmount}`,
      );
    }

    // Cap amount at remaining balance
    const actualAmount = Math.min(amount, order.remainingAmount);

    // Add to history
    order.paymentHistory.push({
      amount: actualAmount,
      method: paymentMethod || "cash",
      notes,
      receivedBy: req.user._id,
      date: new Date(),
    });

    // Update amounts
    order.paidAmount += actualAmount;
    order.remainingAmount = order.totalAmount - order.paidAmount;
    order.paymentStatus = "paid";
    order.paymentMethod = paymentMethod;
    order.paymentDate = new Date();
    order.updatedBy = req.user._id;

    await order.save();
    return res.json({ success: true, data: order });
  }

  // For "partial" status - validation
  if (paymentStatus === "partial") {
    // Cannot go to partial if already paid
    if (order.paymentStatus === "paid") {
      throw new Error("Cannot change to partial once order is fully paid");
    }

    const amount = Number(paidAmount);
    if (!amount || amount <= 0) {
      throw new Error("Valid paid amount required");
    }

    // Prevent overpayment
    if (amount > order.remainingAmount) {
      throw new Error(
        `Amount cannot exceed remaining balance of ${order.remainingAmount}`,
      );
    }

    // Add to history
    order.paymentHistory.push({
      amount,
      method: paymentMethod || "cash",
      notes,
      receivedBy: req.user._id,
      date: new Date(),
    });

    // Update amounts
    order.paidAmount += amount;
    order.remainingAmount = order.totalAmount - order.paidAmount;

    // Auto-check if becomes paid
    if (order.remainingAmount <= 0) {
      order.paymentStatus = "paid";
      order.paidAmount = order.totalAmount; // Ensure exact match
      order.remainingAmount = 0;
    } else {
      order.paymentStatus = "partial";
    }

    order.paymentMethod = paymentMethod;
    order.paymentDate = new Date();
    order.updatedBy = req.user._id;

    await order.save();
    return res.json({ success: true, data: order });
  }

  // If no status specified, use default logic
  const amount = Number(paidAmount);
  if (!amount || amount <= 0) {
    throw new Error("Valid paid amount required");
  }

  if (amount > order.remainingAmount) {
    throw new Error("Amount exceeds remaining balance");
  }

  order.paymentHistory.push({
    amount,
    method: paymentMethod || "cash",
    notes,
    receivedBy: req.user._id,
    date: new Date(),
  });

  order.paidAmount += amount;
  order.remainingAmount = order.totalAmount - order.paidAmount;

  if (order.remainingAmount <= 0) {
    order.paymentStatus = "paid";
  } else {
    order.paymentStatus = "partial";
  }

  order.paymentMethod = paymentMethod;
  order.paymentDate = new Date();
  order.updatedBy = req.user._id;

  await order.save();
  res.json({ success: true, data: order });
});

// @desc    Dispatch order
// @route   PATCH /api/orders/:id/dispatch
// @access  Private/Admin/HR
export const dispatchOrder = asyncHandler(async (req, res) => {
  const { dispatchStatus, notes, fromAddress } = req.body;

  // Only allow 3 statuses: pending, dispatched, delivered
  if (!["pending", "dispatched", "delivered"].includes(dispatchStatus)) {
    res.status(400);
    throw new Error(
      "Invalid dispatch status. Allowed: pending, dispatched, delivered",
    );
  }

  const updateData = {
    dispatchStatus,
    notes,
    updatedBy: req.user._id,
  };

  if (dispatchStatus === "dispatched") {
    updateData.dispatchedAt = new Date();
    updateData.dispatchedBy = req.user._id;
  }

  if (fromAddress) {
    updateData.fromAddress = fromAddress;
  }

  const order = await Order.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  })
    .populate("school", "name city address contactPersonName mobile email")
    .populate("dispatchedBy", "name email")
    .populate("updatedBy", "name email");

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  res.json({
    success: true,
    data: order,
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
  if (order.dispatchStatus !== "pending") {
    res.status(400);
    throw new Error("Cannot delete order that has been processed");
  }

  await order.deleteOne();

  res.json({
    success: true,
    message: "Order deleted successfully",
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
    ordersByBookType,
  ] = await Promise.all([
    Order.countDocuments({ academicYear: yearToUse }),
    Order.countDocuments({ academicYear: yearToUse, paymentStatus: "pending" }),
    Order.countDocuments({ academicYear: yearToUse, paymentStatus: "paid" }),
    Order.countDocuments({
      academicYear: yearToUse,
      dispatchStatus: "pending",
    }),
    Order.countDocuments({
      academicYear: yearToUse,
      dispatchStatus: "dispatched",
    }),
    Order.aggregate([
      { $match: { academicYear: yearToUse } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]),
    Order.aggregate([
      { $match: { academicYear: yearToUse } },
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: "$orderItems.bookType",
          count: { $sum: "$orderItems.quantity" },
        },
      },
    ]),
  ]);

  res.json({
    success: true,
    data: {
      academicYear: yearToUse,
      totalOrders,
      paymentStats: {
        pending: pendingPayment,
        paid: paidOrders,
        partial: totalOrders - pendingPayment - paidOrders,
      },
      dispatchStats: {
        pending: pendingDispatch,
        dispatched: dispatchedOrders,
        delivered: totalOrders - pendingDispatch - dispatchedOrders,
      },
      revenue: totalRevenue[0]?.total || 0,
      booksByType: ordersByBookType.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
    },
  });
});

export const generateInvoice = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("school", "name city address contactPersonName mobile email")
    .populate("createdBy", "name email")
    .populate("paymentHistory.receivedBy", "name");

  if (!order) throw new Error("Order not found");

  const doc = new PDFDocument({ margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=invoice-${order.invoiceNumber}.pdf`,
  );

  doc.pipe(res);

  /* ---------------- HEADER ---------------- */
  doc.fontSize(20).text("INVOICE", { align: "center" }).moveDown();

  doc.fontSize(10);
  doc.text(`Invoice No: ${order.invoiceNumber}`);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`);
  doc.text(`Academic Year: ${order.academicYear}`);

  doc.moveDown();

  /* ---------------- FROM / TO ---------------- */
  doc.fontSize(12).text("FROM:", { underline: true });
  doc.fontSize(10);
  doc.text(order.fromAddress.name);
  doc.text(order.fromAddress.address);
  doc.text(`${order.fromAddress.city}, ${order.fromAddress.state}`);
  doc.text(`Mobile: ${order.fromAddress.mobile}`);
  doc.text(`Email: ${order.fromAddress.email}`);

  doc.moveDown();

  doc.fontSize(12).text("TO:", { underline: true });
  doc.fontSize(10);
  doc.text(order.toAddress.name);
  doc.text(order.toAddress.address);
  doc.text(order.toAddress.city);
  doc.text(`Mobile: ${order.toAddress.mobile}`);
  doc.text(`Email: ${order.toAddress.email}`);

  doc.moveDown();

  /* ---------------- ITEMS TABLE ---------------- */
  doc.fontSize(12).text("Books:", { underline: true });

  order.orderItems.forEach((item) => {
    doc
      .fontSize(10)
      .text(
        `${item.bookType} - ${item.grade || ""} | Qty: ${
          item.quantity
        } | ₹${item.unitPrice} = ₹${item.totalPrice}`,
      );
  });

  doc.moveDown();

  if (order.kitItems.length) {
    doc.fontSize(12).text("Kits:", { underline: true });

    order.kitItems.forEach((item) => {
      doc
        .fontSize(10)
        .text(
          `${item.kitType} | Qty: ${item.quantity} | ₹${item.unitPrice} = ₹${item.totalPrice}`,
        );
    });
  }

  doc.moveDown();

  /* ---------------- TOTALS ---------------- */
  doc.fontSize(12).text("Summary", { underline: true });
  doc.fontSize(10);

  doc.text(`Subtotal: ₹${order.subtotal}`);
  doc.text(`Discount: ₹${order.discount}`);
  doc.text(`Total: ₹${order.totalAmount}`);

  doc.moveDown();

  /* ---------------- PAYMENT ---------------- */
  doc.fontSize(12).text("Payment Details", { underline: true });
  doc.fontSize(10);

  doc.text(`Paid: ₹${order.paidAmount}`);
  doc.text(`Remaining: ₹${order.remainingAmount}`);
  doc.text(`Status: ${order.paymentStatus}`);

  doc.moveDown();

  /* ---------------- PAYMENT HISTORY ---------------- */
  if (order.paymentHistory.length) {
    doc.fontSize(12).text("Payment History", { underline: true });

    order.paymentHistory.forEach((p) => {
      doc
        .fontSize(10)
        .text(
          `${new Date(p.date).toLocaleDateString()} | ₹${p.amount} | ${
            p.method
          }`,
        );
    });
  }

  doc.moveDown();

  /* ---------------- DISPATCH ---------------- */
  doc.fontSize(12).text("Dispatch", { underline: true });
  doc.fontSize(10);

  doc.text(`Status: ${order.dispatchStatus}`);
  if (order.dispatchedAt) {
    doc.text(
      `Dispatched On: ${new Date(order.dispatchedAt).toLocaleDateString()}`,
    );
  }

  doc.end();
});
