/**
 * Events Controller
 * Phase 6: Events & Notifications
 */

const mongoose = require('mongoose');
const Event = require('../models/Event');
const EventRSVP = require('../models/EventRSVP');
const Notification = require('../models/Notification');
const User = require('../models/User');
const logger = require('../utils/logger');
const { sendSuccess, sendError, sendPaginatedSuccess } = require('../utils/responses');
const {
  validateEvent,
  validateEventUpdate,
  validateEventRSVP,
  extractValidationErrors,
} = require('../utils/validators');
const constants = require('../config/constants');

// --------------------------------------------
// Event CRUD operations
// --------------------------------------------

const listEvents = async (req, res, next) => {
  try {
    logger.info('Listing events', { userId: req.user.userId, query: req.query });

    const page = parseInt(req.query.page, 10) || constants.PAGINATION_DEFAULTS.PAGE;
    const limit = Math.min(
      parseInt(req.query.limit, 10) || constants.PAGINATION_DEFAULTS.LIMIT,
      constants.PAGINATION_DEFAULTS.MAX_LIMIT
    );
    const type = req.query.type;
    const status = req.query.status;
    const search = req.query.search;
    const startAt = req.query.startAt;
    const endAt = req.query.endAt;

    const filter = { isDeleted: false };

    if (type) {
      filter.eventType = type;
    }

    if (status === 'upcoming') {
      filter.startAt = { $gte: new Date() };
    } else if (status === 'past') {
      filter.endAt = { $lt: new Date() };
    }

    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { location: new RegExp(search, 'i') },
      ];
    }

    if (startAt || endAt) {
      filter.startAt = filter.startAt || {};
      if (startAt) filter.startAt.$gte = new Date(startAt);
      if (endAt) filter.startAt.$lte = new Date(endAt);
    }

    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      Event.find(filter)
        .sort({ startAt: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Event.countDocuments(filter),
    ]);

    return sendPaginatedSuccess(res, events, page, limit, total, 'Events fetched successfully');
  } catch (error) {
    logger.error('Error listing events', { error: error.message });
    next(error);
  }
};

const getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;
    logger.info('Fetching event', { userId: req.user.userId, eventId: id });

    const event = await Event.findOne({ _id: id, isDeleted: false });

    if (!event) {
      return sendError(res, 'Event not found', constants.ERROR_CODES.NOT_FOUND, null, constants.HTTP_STATUS.NOT_FOUND);
    }

    const attendeeCounts = await EventRSVP.aggregate([
      {
        $match: {
          eventId: event._id,
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const counts = {
      yes: 0,
      no: 0,
      maybe: 0,
    };

    attendeeCounts.forEach((item) => {
      if (item._id && counts[item._id] !== undefined) {
        counts[item._id] = item.count;
      }
    });

    const userRsvp = await EventRSVP.findOne({
      eventId: event._id,
      userId: req.user.userId,
      isDeleted: false,
    });

    const responseData = {
      ...event.toObject(),
      attendeeCounts: counts,
      currentUserRsvpStatus: userRsvp ? userRsvp.status : null,
    };

    return sendSuccess(res, responseData, 'Event details retrieved successfully');
  } catch (error) {
    logger.error('Error fetching event', { error: error.message, params: req.params });
    next(error);
  }
};

const createEvent = async (req, res, next) => {
  try {
    const { error, value } = validateEvent(req.body);
    if (error) {
      const details = extractValidationErrors(error);
      return sendError(res, 'Validation failed', constants.ERROR_CODES.VALIDATION_ERROR, details, constants.HTTP_STATUS.BAD_REQUEST);
    }

    const organizer = await User.findById(req.user.userId).lean();
    if (!organizer) {
      logger.warn('Event creation failed: organizer not found', { userId: req.user.userId });
      return sendError(res, 'Organizer not found', constants.ERROR_CODES.NOT_FOUND, null, constants.HTTP_STATUS.NOT_FOUND);
    }

    const event = await Event.create({
      title: value.title,
      description: value.description,
      eventType: value.eventType || 'general',
      location: value.location,
      startAt: new Date(value.startAt),
      endAt: new Date(value.endAt),
      organizer: organizer._id,
      organizerName: organizer.name,
      coverImageUrl: value.coverImageUrl || null,
    });

    // Notify all active users about the new event
    const recipients = await User.find({ isActive: true, deletedAt: null }).select('_id');
    if (recipients.length > 0) {
      const notifications = recipients.map((user) => ({
        userId: user._id,
        title: `New event: ${event.title}`,
        message: `A new event has been created: ${event.title}. Check the events page for details.`,
        type: constants.NOTIFICATION_TYPES.EVENT,
        link: {
          entityType: 'event',
          entityId: event._id,
          route: `/events/${event._id}`,
        },
      }));

      await Notification.insertMany(notifications);
    }

    return sendSuccess(res, event, 'Event created successfully', constants.HTTP_STATUS.CREATED);
  } catch (error) {
    logger.error('Error creating event', { error: error.message, body: req.body });
    next(error);
  }
};

const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error, value } = validateEventUpdate(req.body);
    if (error) {
      const details = extractValidationErrors(error);
      return sendError(res, 'Validation failed', constants.ERROR_CODES.VALIDATION_ERROR, details, constants.HTTP_STATUS.BAD_REQUEST);
    }

    const event = await Event.findOne({ _id: id, isDeleted: false });
    if (!event) {
      return sendError(res, 'Event not found', constants.ERROR_CODES.NOT_FOUND, null, constants.HTTP_STATUS.NOT_FOUND);
    }

    if (req.user.role !== constants.ROLES.ADMIN && event.organizer.toString() !== req.user.userId) {
      return sendError(res, 'Insufficient permissions to update event', constants.ERROR_CODES.FORBIDDEN, null, constants.HTTP_STATUS.FORBIDDEN);
    }

    Object.assign(event, {
      title: value.title !== undefined ? value.title : event.title,
      description: value.description !== undefined ? value.description : event.description,
      eventType: value.eventType !== undefined ? value.eventType : event.eventType,
      location: value.location !== undefined ? value.location : event.location,
      startAt: value.startAt !== undefined ? new Date(value.startAt) : event.startAt,
      endAt: value.endAt !== undefined ? new Date(value.endAt) : event.endAt,
      coverImageUrl: value.coverImageUrl !== undefined ? value.coverImageUrl : event.coverImageUrl,
    });

    await event.save();

    return sendSuccess(res, event, 'Event updated successfully');
  } catch (error) {
    logger.error('Error updating event', { error: error.message, params: req.params, body: req.body });
    next(error);
  }
};

const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const event = await Event.findOne({ _id: id, isDeleted: false });
    if (!event) {
      return sendError(res, 'Event not found', constants.ERROR_CODES.NOT_FOUND, null, constants.HTTP_STATUS.NOT_FOUND);
    }

    if (req.user.role !== constants.ROLES.ADMIN && event.organizer.toString() !== req.user.userId) {
      return sendError(res, 'Insufficient permissions to delete event', constants.ERROR_CODES.FORBIDDEN, null, constants.HTTP_STATUS.FORBIDDEN);
    }

    event.isDeleted = true;
    event.deletedAt = new Date();
    event.deletedBy = req.user.userId;
    await event.save();

    return sendSuccess(res, 'Event deleted successfully');
  } catch (error) {
    logger.error('Error deleting event', { error: error.message, params: req.params });
    next(error);
  }
};

// --------------------------------------------
// Event RSVP operations
// --------------------------------------------

const rsvpEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error, value } = validateEventRSVP(req.body);
    if (error) {
      const details = extractValidationErrors(error);
      return sendError(res, 'Validation failed', constants.ERROR_CODES.VALIDATION_ERROR, details, constants.HTTP_STATUS.BAD_REQUEST);
    }

    const event = await Event.findOne({ _id: id, isDeleted: false });
    if (!event) {
      return sendError(res, 'Event not found', constants.ERROR_CODES.NOT_FOUND, null, constants.HTTP_STATUS.NOT_FOUND);
    }

    let rsvp = await EventRSVP.findOne({ eventId: id, userId: req.user.userId, isDeleted: false });
    if (rsvp) {
      rsvp.status = value.status;
      rsvp.notes = value.notes || rsvp.notes;
      await rsvp.save();
    } else {
      rsvp = await EventRSVP.create({
        eventId: id,
        userId: req.user.userId,
        status: value.status,
        notes: value.notes || null,
      });
    }

    // Notify event organizer about RSVP update
    const rsvpUser = await User.findById(req.user.userId).lean();
    const rsvpUserLabel = rsvpUser ? `${rsvpUser.name || rsvpUser.email}` : 'A participant';

    await Notification.create({
      userId: event.organizer,
      title: `RSVP updated for ${event.title}`,
      message: `${rsvpUserLabel} responded '${value.status}' to event '${event.title}'.`,
      type: constants.NOTIFICATION_TYPES.EVENT,
      link: {
        entityType: 'event',
        entityId: event._id,
        route: `/events/${event._id}`,
      },
    });

    return sendSuccess(res, { eventId: id, userId: req.user.userId, status: value.status }, 'RSVP saved successfully');
  } catch (error) {
    logger.error('Error processing event RSVP', { error: error.message, params: req.params, body: req.body });
    next(error);
  }
};

const listEventAttendees = async (req, res, next) => {
  try {
    const { id } = req.params;

    const event = await Event.findOne({ _id: id, isDeleted: false });
    if (!event) {
      return sendError(res, 'Event not found', constants.ERROR_CODES.NOT_FOUND, null, constants.HTTP_STATUS.NOT_FOUND);
    }

    const rsvps = await EventRSVP.find({ eventId: id, isDeleted: false })
      .populate('userId', 'name email role')
      .lean();

    const counts = {
      yes: 0,
      no: 0,
      maybe: 0,
    };

    const attendeeList = rsvps.map((item) => {
      const status = item.status || constants.EVENT_RSVP_STATUS.MAYBE;
      if (counts[status] !== undefined) counts[status] += 1;

      return {
        userId: item.userId?._id || null,
        name: item.userId?.name || null,
        email: item.userId?.email || null,
        role: item.userId?.role || null,
        status,
        notes: item.notes,
        updatedAt: item.updatedAt,
      };
    });

    return sendSuccess(res, { eventId: id, counts, attendees: attendeeList }, 'Attendees list retrieved successfully');
  } catch (error) {
    logger.error('Error listing event attendees', { error: error.message, params: req.params });
    next(error);
  }
};

module.exports = {
  listEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  rsvpEvent,
  listEventAttendees,
};
