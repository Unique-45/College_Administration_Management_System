/**
 * Fee Ledger Model
 * Tracks student fee obligations and balance
 * Per SRS Section 2.2: Student fee payment management
 */

const mongoose = require('mongoose');
const constants = require('../config/constants');

// ============================================
// FEE LEDGER SCHEMA DEFINITION
// ============================================

const feeLedgerSchema = new mongoose.Schema(
  {
    // Student Reference
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },

    // Fee Details
    totalFeeAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    paidAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    outstandingAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    // Fee Category Breakdown
    feeBreakdown: {
      tuition: {
        amount: { type: Number, default: 0 },
        paid: { type: Number, default: 0 },
      },
      hostel: {
        amount: { type: Number, default: 0 },
        paid: { type: Number, default: 0 },
      },
      misc: {
        amount: { type: Number, default: 0 },
        paid: { type: Number, default: 0 },
      },
      registration: {
        amount: { type: Number, default: 0 },
        paid: { type: Number, default: 0 },
      },
    },

    // Academic Year
    academicYear: {
      type: String,
      default: '2023-2024',
      index: true,
    },

    // Installment Information
    installments: [
      {
        dueDate: Date,
        amount: Number,
        paidAmount: { type: Number, default: 0 },
        paid: { type: Boolean, default: false },
        paymentDate: Date,
        paymentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Payment',
        },
      },
    ],

    // Due Date
    dueDate: {
      type: Date,
      default: null,
    },

    // Overdue Status
    isOverdue: {
      type: Boolean,
      default: false,
      index: true,
    },

    daysOverdue: {
      type: Number,
      default: 0,
    },

    // Payment Status
    paymentStatus: {
      type: String,
      enum: ['pending', 'partially_paid', 'fully_paid'],
      default: 'pending',
      index: true,
    },

    // Last Payment Info
    lastPaymentDate: {
      type: Date,
      default: null,
    },

    lastPaymentAmount: {
      type: Number,
      default: 0,
    },

    // Notes
    remarks: {
      type: String,
      default: null,
    },

    // Concession/Scholarship
    concessionAmount: {
      type: Number,
      default: 0,
    },

    concessionReason: {
      type: String,
      default: null,
    },

    // System Fields
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'fee_ledgers',
  }
);

// ============================================
// INDEXES
// ============================================

// Lookup by academic year and student
feeLedgerSchema.index({ academicYear: 1, studentId: 1 });

// Overdue tracking
feeLedgerSchema.index({ isOverdue: 1, daysOverdue: 1 });

// Payment status lookup
feeLedgerSchema.index({ paymentStatus: 1, studentId: 1 });

// ============================================
// VIRTUAL FIELDS
// ============================================

// Calculate percentage paid
feeLedgerSchema.virtual('percentagePaid').get(function () {
  if (this.totalFeeAmount === 0) return 0;
  return Math.round((this.paidAmount / this.totalFeeAmount) * 100);
});

// ============================================
// INSTANCE METHODS
// ============================================

/**
 * Record a payment
 */
feeLedgerSchema.methods.recordPayment = function (paymentId, amount) {
  this.paidAmount += amount;
  this.outstandingAmount = this.totalFeeAmount - this.paidAmount;
  this.lastPaymentDate = new Date();
  this.lastPaymentAmount = amount;

  // Update payment status
  if (this.outstandingAmount <= 0) {
    this.paymentStatus = 'fully_paid';
    this.isOverdue = false;
  } else if (this.paidAmount > 0) {
    this.paymentStatus = 'partially_paid';
  }

  // Add to installment if found
  const installment = this.installments.find(
    (inst) => !inst.paid && new Date(inst.dueDate) >= new Date()
  );
  if (installment) {
    installment.paidAmount += amount;
    if (installment.paidAmount >= installment.amount) {
      installment.paid = true;
      installment.paymentDate = new Date();
      installment.paymentId = paymentId;
    }
  }

  return this.save();
};

/**
 * Update overdue status
 */
feeLedgerSchema.methods.updateOverdueStatus = function () {
  if (this.paymentStatus === 'fully_paid') {
    this.isOverdue = false;
    this.daysOverdue = 0;
  } else if (this.dueDate && new Date() > new Date(this.dueDate)) {
    this.isOverdue = true;
    const now = new Date();
    const due = new Date(this.dueDate);
    this.daysOverdue = Math.floor((now - due) / (1000 * 60 * 60 * 24));
  }
  return this.save();
};

/**
 * Apply concession
 */
feeLedgerSchema.methods.applyConcession = function (amount, reason = '') {
  this.concessionAmount = amount;
  this.concessionReason = reason;
  this.totalFeeAmount -= amount;
  this.outstandingAmount = Math.max(0, this.totalFeeAmount - this.paidAmount);
  return this.save();
};

/**
 * Get detailed breakdown
 */
feeLedgerSchema.methods.getDetailedBreakdown = function () {
  return {
    studentId: this.studentId,
    academicYear: this.academicYear,
    totalFee: this.totalFeeAmount,
    paid: this.paidAmount,
    outstanding: this.outstandingAmount,
    percentagePaid: this.percentagePaid,
    status: this.paymentStatus,
    isOverdue: this.isOverdue,
    daysOverdue: this.daysOverdue,
    dueDate: this.dueDate,
    breakdown: this.feeBreakdown,
    installments: this.installments,
  };
};

// ============================================
// STATIC METHODS
// ============================================

/**
 * Get or create fee ledger for student
 */
feeLedgerSchema.statics.getOrCreateForStudent = async function (studentId, academicYear = '2023-2024') {
  let ledger = await this.findOne({
    studentId,
    academicYear,
    isDeleted: false,
  });

  if (!ledger) {
    ledger = new this({
      studentId,
      academicYear,
      totalFeeAmount: 0,
      paidAmount: 0,
      outstandingAmount: 0,
    });
    await ledger.save();
  }

  return ledger;
};

/**
 * Get all outstanding fees
 */
feeLedgerSchema.statics.getOutstandingFees = function (studentId) {
  return this.findOne({
    studentId,
    paymentStatus: { $in: ['pending', 'partially_paid'] },
    isDeleted: false,
  });
};

// ============================================
// MIDDLEWARE
// ============================================

// Soft delete middleware
feeLedgerSchema.pre(/^find/, function () {
  this.where({ isDeleted: { $ne: true } });
});

// ============================================
// MODEL EXPORT
// ============================================

const FeeLedger = mongoose.model('FeeLedger', feeLedgerSchema);

module.exports = FeeLedger;
