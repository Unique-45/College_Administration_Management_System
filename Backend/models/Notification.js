/**
 * Notification Model
 * Phase 6: Events & Notifications
 */

const mongoose = require('mongoose');
const constants = require('../config/constants');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    type: {
      type: String,
      enum: [
        constants.NOTIFICATION_TYPES.PAYMENT,
        constants.NOTIFICATION_TYPES.ATTENDANCE,
        constants.NOTIFICATION_TYPES.EVENT,
        constants.NOTIFICATION_TYPES.SYSTEM,
        constants.NOTIFICATION_TYPES.VIDEO,
      ],
      default: constants.NOTIFICATION_TYPES.SYSTEM,
      index: true,
    },
    link: {
      entityType: {
        type: String,
        trim: true,
        default: null,
      },
      entityId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
      },
      route: {
        type: String,
        trim: true,
        default: null,
      },
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'notifications',
  }
);

notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ type: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
