/**
 * Event RSVP Model
 * Phase 6: Events & Notifications
 */

const mongoose = require('mongoose');
const constants = require('../config/constants');

const eventRsvpSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: [
        constants.EVENT_RSVP_STATUS.YES,
        constants.EVENT_RSVP_STATUS.NO,
        constants.EVENT_RSVP_STATUS.MAYBE,
      ],
      required: true,
      default: constants.EVENT_RSVP_STATUS.MAYBE,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 300,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
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
    collection: 'event_rsvps',
  }
);

// Unique event + user per RSVP
eventRsvpSchema.index({ eventId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('EventRSVP', eventRsvpSchema);
