/**
 * Event Model
 * Phase 6: Events & Notifications
 */

const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1200,
    },
    eventType: {
      type: String,
      trim: true,
      maxlength: 50,
      default: 'general',
      index: true,
    },
    location: {
      type: String,
      trim: true,
      maxlength: 200,
      required: true,
    },
    startAt: {
      type: Date,
      required: true,
      index: true,
    },
    endAt: {
      type: Date,
      required: true,
      index: true,
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    organizerName: {
      type: String,
      required: true,
      trim: true,
    },
    coverImageUrl: {
      type: String,
      trim: true,
      default: null,
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
    collection: 'events',
  }
);

// indexes for faster querying on dates and types
eventSchema.index({ startAt: 1 });
eventSchema.index({ eventType: 1 });

module.exports = mongoose.model('Event', eventSchema);
