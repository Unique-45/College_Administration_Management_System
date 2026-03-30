/**
 * Payment Model
 * MongoDB schema for payment management and transaction tracking
 * Supports Razorpay integration with webhook verification
 * Per SRS 4.5: Secure online fee payments with cryptographic webhook validation
 */

const mongoose = require('mongoose');
const constants = require('../config/constants');

// ============================================
// PAYMENT SCHEMA DEFINITION
// ============================================

const paymentSchema = new mongoose.Schema(
  {
    // Student Reference
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Payment Amount & Details
    amount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    currency: {
      type: String,
      enum: ['INR', 'USD'],
      default: 'INR',
    },

    description: {
      type: String,
      trim: true,
      default: 'Fee Payment',
    },

    // Razorpay Integration
    razorpayOrderId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    razorpayPaymentId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    razorpaySignature: {
      type: String,
      select: false,
    },

    // Payment Status
    status: {
      type: String,
      enum: ['pending', 'initiated', 'completed', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },

    paymentMethod: {
      type: String,
      enum: ['razorpay', 'upi', 'card', 'net_banking', 'wallet'],
      default: null,
    },

    // Fee Category
    feeCategory: {
      type: String,
      enum: ['tuition', 'hostel', 'misc', 'registration'],
      default: 'tuition',
    },

    academicYear: {
      type: String,
      default: '2023-2024',
      index: true,
    },

    // Reference to Fee Ledger
    feeLedgerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FeeLedger',
      sparse: true,
    },

    // Timestamp Fields
    initiatedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    receiptUrl: {
      type: String,
      default: null,
    },

    // Error Tracking
    failureReason: {
      type: String,
      default: null,
    },

    // Refund Information
    refundId: {
      type: String,
      unique: true,
      sparse: true,
    },

    refundReason: {
      type: String,
      default: null,
    },

    refundedAt: {
      type: Date,
      default: null,
    },

    // System Fields
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    notes: {
      type: String,
      default: null,
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'payments',
  }
);

// ============================================
// INDEXES
// ============================================

// Payment status by student
paymentSchema.index({ studentId: 1, status: 1 });

// Payment creation time
paymentSchema.index({ createdAt: -1 });

// Academic year lookup
paymentSchema.index({ academicYear: 1, studentId: 1 });

// ============================================
// VIRTUAL FIELDS
// ============================================

// Calculate days since initiation
paymentSchema.virtual('daysSinceInitiation').get(function () {
  if (!this.initiatedAt) return null;
  const now = new Date();
  return Math.floor((now - this.initiatedAt) / (1000 * 60 * 60 * 24));
});

// ============================================
// INSTANCE METHODS
// ============================================

/**
 * Mark payment as completed
 */
paymentSchema.methods.markCompleted = function (razorpayPaymentId, signature) {
  this.status = 'completed';
  this.razorpayPaymentId = razorpayPaymentId;
  this.razorpaySignature = signature;
  this.completedAt = new Date();
  return this.save();
};

/**
 * Mark payment as failed
 */
paymentSchema.methods.markFailed = function (reason = 'Payment failed') {
  this.status = 'failed';
  this.failureReason = reason;
  return this.save();
};

/**
 * Process refund
 */
paymentSchema.methods.processRefund = function (refundId, reason = '') {
  this.status = 'refunded';
  this.refundId = refundId;
  this.refundReason = reason;
  this.refundedAt = new Date();
  return this.save();
};

/**
 * Get payment details for receipt
 */
paymentSchema.methods.getReceiptDetails = function () {
  return {
    paymentId: this._id,
    razorpayPaymentId: this.razorpayPaymentId,
    studentId: this.studentId,
    amount: this.amount,
    currency: this.currency,
    status: this.status,
    completedAt: this.completedAt,
    feeCategory: this.feeCategory,
    description: this.description,
  };
};

// ============================================
// STATIC METHODS
// ============================================

/**
 * Get pending payments for a student
 */
paymentSchema.statics.getPendingPaymentsByStudent = function (studentId) {
  return this.find({
    studentId,
    status: { $in: ['pending', 'initiated'] },
    isDeleted: false,
  }).sort({ createdAt: -1 });
};

/**
 * Get payment history for a student
 */
paymentSchema.statics.getPaymentHistoryByStudent = function (studentId, limit = 10, skip = 0) {
  return this.find({
    studentId,
    status: { $in: ['completed', 'failed', 'refunded'] },
    isDeleted: false,
  })
    .sort({ completedAt: -1 })
    .limit(limit)
    .skip(skip);
};

/**
 * Find by Razorpay Order ID
 */
paymentSchema.statics.findByRazorpayOrderId = function (orderId) {
  return this.findOne({ razorpayOrderId: orderId, isDeleted: false });
};

// ============================================
// MIDDLEWARE
// ============================================

// Soft delete middleware
paymentSchema.pre(/^find/, function () {
  this.where({ isDeleted: { $ne: true } });
});

// ============================================
// MODEL EXPORT
// ============================================

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
