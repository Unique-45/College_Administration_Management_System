const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { roleGuard } = require('../middleware/roleGuard');
const constants = require('../config/constants');
const {
  getPendingFees,
  getPaymentHistory,
  initiatePayment,
  verifyPayment,
  downloadReceipt,
  listPayments,
  handleRazorpayWebhook,
} = require('../controllers/paymentsController');

// ============================================
// STUDENT ENDPOINTS
// ============================================

/**
 * GET /api/payments/pending-fees
 * Get pending fee details for current student
 * Access: Student (own fees), Admin (any student via query)
 */
router.get('/pending-fees', authMiddleware, getPendingFees);

/**
 * GET /api/payments/history
 * Get payment history with pagination
 * Access: Student (own history), Admin (any student via query)
 */
router.get('/history', authMiddleware, getPaymentHistory);

/**
 * POST /api/payments/initiate
 * Initiate payment with Razorpay
 * Body: { amount, description, feeCategory, academicYear }
 * Access: Authenticated users
 */
router.post('/initiate', authMiddleware, initiatePayment);

/**
 * POST /api/payments/verify
 * Verify payment after Razorpay callback
 * Body: { orderId, paymentId, signature }
 * Access: Authenticated users
 */
router.post('/verify', authMiddleware, verifyPayment);

/**
 * GET /api/payments/:paymentId/receipt
 * Download/view payment receipt
 * Access: Student (own receipts), Admin (any receipt)
 */
router.get('/:paymentId/receipt', authMiddleware, downloadReceipt);

// ============================================
// ADMIN/TEACHER ENDPOINTS
// ============================================

/**
 * GET /api/payments
 * List all payments with filters
 * Query: page, limit, status
 * Access: Admin, Teacher
 */
router.get(
  '/',
  authMiddleware,
  roleGuard(constants.ROLES.ADMIN, constants.ROLES.TEACHER),
  listPayments
);

// ============================================
// WEBHOOKS (No authentication required)
// ============================================

/**
 * POST /api/payments/webhook/razorpay
 * Razorpay webhook for payment status updates
 * Access: Razorpay servers only (should verify with signature in production)
 */
router.post('/webhook/razorpay', handleRazorpayWebhook);

module.exports = router;
