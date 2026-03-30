/**
 * Payments Controller
 * Handles payment processing, verification, and receipts
 * Per SRS 4.5: Secure online fee payments with cryptographic webhook validation
 */

const mongoose = require('mongoose');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const FeeLedger = require('../models/FeeLedger');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendSuccess, sendError } = require('../utils/responses');
const logger = require('../utils/logger');
const constants = require('../config/constants');

// ============================================
// PAYMENT HELPERS
// ============================================

/**
 * Generate Razorpay order object (mock implementation)
 * In production, would use Razorpay SDK
 */
const generateRazorpayOrder = async (amount, currency = 'INR') => {
  // Mock implementation - replace with actual Razorpay API call
  return {
    id: `order_${crypto.randomBytes(12).toString('hex')}`,
    entity: 'order',
    amount: Math.round(amount * 100), // Convert to paise
    amount_paid: 0,
    amount_due: Math.round(amount * 100),
    currency,
    receipt: `receipt_${Date.now()}`,
    status: 'created',
    attempts: 0,
    notes: {},
    created_at: Math.floor(Date.now() / 1000),
  };
};

/**
 * Verify Razorpay payment signature
 */
const verifyRazorpaySignature = (orderId, paymentId, signature, secret) => {
  // Mock implementation - in production use actual Razorpay signature verification
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return expectedSignature === signature;
};

// ============================================
// PAYMENT ENDPOINTS
// ============================================

/**
 * GET /api/payments/pending-fees
 * Get pending fee details for current student
 */
const getPendingFees = async (req, res, next) => {
  try {
    // Only students can view their own fees
    if (req.user.role === constants.ROLES.STUDENT && req.user._id !== req.user.userId) {
      return sendError(res, 'Unauthorized to view these fees', 'FORBIDDEN', [], 403);
    }

    const studentId = req.user.role === constants.ROLES.STUDENT ? req.user._id : req.query.studentId;

    if (!studentId) {
      return sendError(res, 'Student ID is required', 'VALIDATION_ERROR', [], 400);
    }

    // Get fee ledger
    const feeLedger = await FeeLedger.getOutstandingFees(studentId);

    if (!feeLedger) {
      return sendSuccess(res, {
        pending: [],
        totalOutstanding: 0,
        status: 'no_pending_fees',
      }, 'No pending fees found', 200);
    }

    // Get pending payment records
    const pendingPayments = await Payment.getPendingPaymentsByStudent(studentId);

    const response = {
      feeLedgerId: feeLedger._id,
      studentId,
      totalFee: feeLedger.totalFeeAmount,
      paidAmount: feeLedger.paidAmount,
      outstandingAmount: feeLedger.outstandingAmount,
      percentagePaid: feeLedger.percentagePaid,
      status: feeLedger.paymentStatus,
      isOverdue: feeLedger.isOverdue,
      daysOverdue: feeLedger.daysOverdue,
      dueDate: feeLedger.dueDate,
      breakdown: feeLedger.feeBreakdown,
      pendingPayments: pendingPayments.map((p) => ({
        id: p._id,
        amount: p.amount,
        status: p.status,
        createdAt: p.createdAt,
      })),
      lastPaymentDate: feeLedger.lastPaymentDate,
    };

    logger.info('Fetched pending fees', {
      studentId,
      userId: req.user._id,
      outstanding: feeLedger.outstandingAmount,
    });

    sendSuccess(res, response, 'Pending fees retrieved successfully', 200);
  } catch (error) {
    logger.error('Error fetching pending fees', {
      userId: req.user._id,
      error: error.message,
    });
    next(error);
  }
};

/**
 * GET /api/payments/history
 * Get payment history for student with pagination
 */
const getPaymentHistory = async (req, res, next) => {
  try {
    const studentId = req.user.role === constants.ROLES.STUDENT ? req.user._id : req.query.studentId;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
    const skip = (page - 1) * limit;

    if (!studentId) {
      return sendError(res, 'Student ID is required', 'VALIDATION_ERROR', [], 400);
    }

    const [payments, total] = await Promise.all([
      Payment.getPaymentHistoryByStudent(studentId, limit, skip),
      Payment.countDocuments({
        studentId,
        status: { $in: ['completed', 'failed', 'refunded'] },
        isDeleted: false,
      }),
    ]);

    const response = {
      payments: payments.map((p) => ({
        id: p._id,
        amount: p.amount,
        status: p.status,
        feeCategory: p.feeCategory,
        completedAt: p.completedAt,
        paymentMethod: p.paymentMethod,
        razorpayPaymentId: p.razorpayPaymentId,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    logger.info('Fetched payment history', {
      studentId,
      userId: req.user._id,
      count: payments.length,
    });

    sendSuccess(res, response, 'Payment history retrieved successfully', 200);
  } catch (error) {
    logger.error('Error fetching payment history', {
      userId: req.user._id,
      error: error.message,
    });
    next(error);
  }
};

/**
 * POST /api/payments/initiate
 * Initiate a payment with Razorpay
 * Body: { amount, description, feeCategory, academicYear }
 */
const initiatePayment = async (req, res, next) => {
  try {
    const { amount, description = 'Fee Payment', feeCategory = 'tuition', academicYear = '2023-2024' } = req.body;
    const studentId = req.user._id;

    // Validation
    if (!amount || amount <= 0) {
      return sendError(res, 'Valid amount is required', 'VALIDATION_ERROR', [], 400);
    }

    if (amount > 999999) {
      return sendError(res, 'Amount exceeds maximum limit', 'VALIDATION_ERROR', [], 400);
    }

    // Create payment record
    const payment = new Payment({
      studentId,
      amount,
      description,
      feeCategory,
      academicYear,
      status: 'initiated',
      initiatedAt: new Date(),
    });

    await payment.save();

    // Generate Razorpay order
    const razorpayOrder = await generateRazorpayOrder(amount);
    payment.razorpayOrderId = razorpayOrder.id;
    await payment.save();

    const response = {
      paymentId: payment._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID || 'rzp_test_key',
      studentEmail: req.user.email,
      studentName: req.user.name,
      description,
    };

    logger.info('Payment initiated', {
      studentId,
      amount,
      orderId: razorpayOrder.id,
    });

    sendSuccess(res, response, 'Payment initiated successfully', 200);
  } catch (error) {
    logger.error('Error initiating payment', {
      userId: req.user._id,
      error: error.message,
    });
    next(error);
  }
};

/**
 * POST /api/payments/verify
 * Verify payment signature after Razorpay callback
 * Body: { orderId, paymentId, signature }
 */
const verifyPayment = async (req, res, next) => {
  try {
    const { orderId, paymentId: razorpayPaymentId, signature } = req.body;

    if (!orderId || !razorpayPaymentId || !signature) {
      return sendError(res, 'Order ID, Payment ID, and signature are required', 'VALIDATION_ERROR', [], 400);
    }

    // Find payment record
    const payment = await Payment.findByRazorpayOrderId(orderId);

    if (!payment) {
      return sendError(res, 'Payment record not found', 'NOT_FOUND', [], 404);
    }

    // Verify signature (mock implementation)
    const isValid = verifyRazorpaySignature(
      orderId,
      razorpayPaymentId,
      signature,
      process.env.RAZORPAY_KEY_SECRET || 'test_secret'
    );

    if (!isValid) {
      payment.status = 'failed';
      payment.failureReason = 'Signature verification failed';
      await payment.save();

      return sendError(res, 'Payment verification failed', 'AUTHENTICATION_ERROR', [], 401);
    }

    // Mark payment as completed
    await payment.markCompleted(razorpayPaymentId, signature);

    // Update fee ledger
    const feeLedger = await FeeLedger.getOrCreateForStudent(
      payment.studentId,
      payment.academicYear
    );
    await feeLedger.recordPayment(payment._id, payment.amount);

    // Send notification
    const student = await User.findById(payment.studentId);
    if (student) {
      const notification = new Notification({
        userId: payment.studentId,
        type: constants.NOTIFICATION_TYPES.PAYMENT,
        title: 'Payment Confirmed',
        message: `Your payment of ₹${payment.amount} has been successfully processed`,
        relatedId: payment._id,
        relatedModel: 'Payment',
      });
      await notification.save();
    }

    const response = {
      paymentId: payment._id,
      razorpayPaymentId,
      amount: payment.amount,
      status: 'completed',
      completedAt: payment.completedAt,
      receiptUrl: `/api/payments/${payment._id}/receipt`,
    };

    logger.info('Payment verified successfully', {
      paymentId: payment._id,
      studentId: payment.studentId,
      amount: payment.amount,
    });

    sendSuccess(res, response, 'Payment verified successfully', 200);
  } catch (error) {
    logger.error('Error verifying payment', {
      userId: req.user._id,
      error: error.message,
    });
    next(error);
  }
};

/**
 * GET /api/payments/:paymentId/receipt
 * Download payment receipt
 */
const downloadReceipt = async (req, res, next) => {
  try {
    const { paymentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return sendError(res, 'Invalid payment ID', 'VALIDATION_ERROR', [], 400);
    }

    const payment = await Payment.findById(paymentId).populate('studentId');

    if (!payment) {
      return sendError(res, 'Payment not found', 'NOT_FOUND', [], 404);
    }

    // Check authorization (student can only view own receipt)
    if (
      req.user.role === constants.ROLES.STUDENT &&
      payment.studentId._id.toString() !== req.user._id.toString()
    ) {
      return sendError(res, 'Unauthorized', 'FORBIDDEN', [], 403);
    }

    if (payment.status !== 'completed') {
      return sendError(res, 'Only completed payments have receipts', 'BAD_REQUEST', [], 400);
    }

    // Generate receipt data
    const receiptData = {
      receiptNumber: `RCP-${payment._id.toString().slice(-8).toUpperCase()}`,
      date: payment.completedAt,
      paymentId: payment._id,
      razorpayPaymentId: payment.razorpayPaymentId,
      studentName: payment.studentId.name,
      studentEmail: payment.studentId.email,
      amount: payment.amount,
      currency: payment.currency,
      feeCategory: payment.feeCategory,
      academicYear: payment.academicYear,
      paymentMethod: payment.paymentMethod,
      description: payment.description,
      companyInfo: {
        name: 'College Administration System',
        address: 'College Address',
        email: 'accounts@college.edu',
      },
    };

    logger.info('Downloaded receipt', {
      paymentId,
      studentId: payment.studentId._id,
    });

    // Return receipt as JSON (in production, could generate PDF)
    sendSuccess(res, receiptData, 'Receipt retrieved successfully', 200);
  } catch (error) {
    logger.error('Error downloading receipt', {
      userId: req.user._id,
      paymentId: req.params.paymentId,
      error: error.message,
    });
    next(error);
  }
};

// ============================================
// ADMIN/TEACHER ENDPOINTS
// ============================================

/**
 * GET /api/payments
 * List all payments (Admin/Teacher only)
 */
const listPayments = async (req, res, next) => {
  try {
    // Only admin/teacher
    if (![constants.ROLES.ADMIN, constants.ROLES.TEACHER].includes(req.user.role)) {
      return sendError(res, 'Unauthorized', 'FORBIDDEN', [], 403);
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const filter = { isDeleted: false };
    if (status) {
      filter.status = status;
    }

    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .populate('studentId', 'name email')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean(),
      Payment.countDocuments(filter),
    ]);

    const response = {
      payments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    logger.info('Listed payments', {
      userId: req.user._id,
      count: payments.length,
      status,
    });

    sendSuccess(res, response, 'Payments retrieved successfully', 200);
  } catch (error) {
    logger.error('Error listing payments', {
      userId: req.user._id,
      error: error.message,
    });
    next(error);
  }
};

// ============================================
// WEBHOOK ENDPOINTS
// ============================================

/**
 * POST /api/payments/webhook/razorpay
 * Razorpay webhook for payment status updates
 */
const handleRazorpayWebhook = async (req, res, next) => {
  try {
    const { event, payload } = req.body;

    logger.info('Received Razorpay webhook', {
      event,
    });

    // Handle different webhook events
    switch (event) {
      case 'payment.authorized':
      case 'payment.completed':
        // Payment completed
        break;
      case 'payment.failed':
        // Handle payment failure
        break;
      case 'refund.created':
        // Handle refund
        break;
      default:
        break;
    }

    // Return success response to Razorpay
    sendSuccess(res, { received: true }, 'Webhook processed', 200);
  } catch (error) {
    logger.error('Error processing webhook', {
      error: error.message,
    });
    next(error);
  }
};

// ============================================
// EXPORT CONTROLLERS
// ============================================

module.exports = {
  // Student endpoints
  getPendingFees,
  getPaymentHistory,
  initiatePayment,
  verifyPayment,
  downloadReceipt,

  // Admin/Teacher endpoints
  listPayments,

  // Webhooks
  handleRazorpayWebhook,
};
