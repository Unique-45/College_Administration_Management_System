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

// ============================================
// PHASE 5: ANALYTICS & ADVANCED FEATURES
// ============================================

/**
 * GET /api/events/analytics
 * Fetch event analytics data with optional filters
 * Query params: dateRange, eventType, period
 */
const getEventAnalytics = async (req, res, next) => {
  try {
    const { dateRange, eventType, period = 'month' } = req.query;

    // Build query filter
    const filter = { isDeleted: false };
    if (eventType) {
      filter.eventType = eventType;
    }

    if (dateRange) {
      const [startDate, endDate] = dateRange.split(',');
      if (startDate && endDate) {
        filter.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      }
    }

    // Get events
    const events = await Event.find(filter).lean();

    // Calculate analytics
    const analytics = {
      totalEvents: events.length,
      totalAttendees: 0,
      avgAttendanceRate: 0,
      eventsByType: {},
      topEventsByAttendance: [],
      eventsThisPeriod: [],
    };

    // Fetch RSVP data
    for (const event of events) {
      const rsvps = await EventRSVP.countDocuments({
        eventId: event._id,
        status: 'yes',
        isDeleted: false,
      });

      event.attendeeCount = rsvps;
      analytics.totalAttendees += rsvps;

      if (!analytics.eventsByType[event.eventType]) {
        analytics.eventsByType[event.eventType] = 0;
      }
      analytics.eventsByType[event.eventType] += 1;
    }

    // Get top events by attendance
    analytics.topEventsByAttendance = events
      .sort((a, b) => (b.attendeeCount || 0) - (a.attendeeCount || 0))
      .slice(0, 5)
      .map((e) => ({
        id: e._id,
        title: e.title,
        attendees: e.attendeeCount || 0,
        date: e.startAt,
      }));

    if (events.length > 0) {
      analytics.avgAttendanceRate = Math.round(analytics.totalAttendees / events.length);
    }

    logger.info('Fetched event analytics', {
      userId: req.user._id,
      count: events.length,
    });

    sendSuccess(res, analytics, 'Event analytics retrieved successfully');
  } catch (error) {
    logger.error('Error fetching event analytics', {
      userId: req.user._id,
      error: error.message,
    });
    next(error);
  }
};

/**
 * GET /api/events/:eventId/attendance-stats
 * Get attendance statistics for a specific event
 */
const getEventAttendanceStats = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findOne({ _id: eventId, isDeleted: false });
    if (!event) {
      return sendError(res, 'Event not found', constants.ERROR_CODES.NOT_FOUND, null, 404);
    }

    // Get RSVP statistics
    const rsvpStats = await EventRSVP.aggregate([
      {
        $match: {
          eventId: new mongoose.Types.ObjectId(eventId),
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

    const stats = {
      eventId,
      totalRsvps: 0,
      yesCount: 0,
      noCount: 0,
      maybeCount: 0,
      checkedInCount: 0,
    };

    rsvpStats.forEach((item) => {
      if (item._id === 'yes') stats.yesCount = item.count;
      else if (item._id === 'no') stats.noCount = item.count;
      else if (item._id === 'maybe') stats.maybeCount = item.count;
      stats.totalRsvps += item.count;
    });

    // Get checked in attendees (stored in event.checkedInCount if available)
    stats.checkedInCount = event.checkedInCount || 0;
    stats.attendanceRate = stats.totalRsvps > 0
      ? Math.round((stats.checkedInCount / stats.yesCount) * 100)
      : 0;

    logger.info('Fetched event attendance stats', {
      eventId,
      userId: req.user._id,
    });

    sendSuccess(res, stats, 'Attendance statistics retrieved successfully');
  } catch (error) {
    logger.error('Error fetching attendance stats', {
      eventId: req.params.eventId,
      userId: req.user._id,
      error: error.message,
    });
    next(error);
  }
};

/**
 * POST /api/events/:eventId/check-in
 * Check in an attendee for an event
 * Body: { userId }
 */
const checkInAttendee = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return sendError(res, 'User ID is required', 'VALIDATION_ERROR', [], 400);
    }

    const event = await Event.findOne({ _id: eventId, isDeleted: false });
    if (!event) {
      return sendError(res, 'Event not found', constants.ERROR_CODES.NOT_FOUND, null, 404);
    }

    // Verify attendee has RSVP'd
    const rsvp = await EventRSVP.findOne({
      eventId,
      userId,
      status: 'yes',
      isDeleted: false,
    });

    if (!rsvp) {
      return sendError(res, 'Attendee not found or has not RSVPd yes', 'NOT_FOUND', [], 404);
    }

    // Mark as checked in
    rsvp.checkedIn = true;
    rsvp.checkedInAt = new Date();
    await rsvp.save();

    // Update event checked in count
    event.checkedInCount = (event.checkedInCount || 0) + 1;
    await event.save();

    logger.info('Attendee checked in', {
      eventId,
      userId,
      checkedInBy: req.user._id,
    });

    sendSuccess(res, { eventId, userId, checkedInAt: rsvp.checkedInAt }, 'Attendee checked in successfully');
  } catch (error) {
    logger.error('Error checking in attendee', {
      eventId: req.params.eventId,
      userId: req.body.userId,
      error: error.message,
    });
    next(error);
  }
};

/**
 * PUT /api/events/:eventId/reschedule
 * Reschedule an event
 * Body: { date, time, reason }
 */
const rescheduleEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { date, time, reason = '' } = req.body;

    if (!date || !time) {
      return sendError(res, 'Date and time are required', 'VALIDATION_ERROR', [], 400);
    }

    const event = await Event.findOne({ _id: eventId, isDeleted: false });
    if (!event) {
      return sendError(res, 'Event not found', constants.ERROR_CODES.NOT_FOUND, null, 404);
    }

    // Only organizer or admin can reschedule
    if (
      event.organizerId.toString() !== req.user._id.toString() &&
      req.user.role !== constants.ROLES.ADMIN
    ) {
      return sendError(res, 'Unauthorized', 'FORBIDDEN', [], 403);
    }

    const oldStartAt = event.startAt;
    const newStartAt = new Date(`${date}T${time}`);

    // Update event
    event.startAt = newStartAt;
    event.rescheduleReason = reason;
    event.rescheduleHistory = event.rescheduleHistory || [];
    event.rescheduleHistory.push({
      oldDate: oldStartAt,
      newDate: newStartAt,
      reason,
      rescheduledBy: req.user._id,
      rescheduledAt: new Date(),
    });

    await event.save();

    // Create notification for all attendees
    const rsvps = await EventRSVP.find({
      eventId,
      status: 'yes',
      isDeleted: false,
    });

    for (const rsvp of rsvps) {
      const notification = new Notification({
        userId: rsvp.userId,
        type: constants.NOTIFICATION_TYPES.EVENT,
        title: 'Event Rescheduled',
        message: `Event "${event.title}" has been rescheduled to ${newStartAt.toDateString()} at ${time}`,
        relatedId: eventId,
        relatedModel: 'Event',
      });
      await notification.save();
    }

    logger.info('Event rescheduled', {
      eventId,
      oldDate: oldStartAt,
      newDate: newStartAt,
      rescheduleBy: req.user._id,
    });

    sendSuccess(res, {
      eventId,
      newDate: newStartAt,
      attendeesNotified: rsvps.length,
    }, 'Event rescheduled successfully');
  } catch (error) {
    logger.error('Error rescheduling event', {
      eventId: req.params.eventId,
      error: error.message,
    });
    next(error);
  }
};

/**
 * POST /api/events/:eventId/cancel
 * Cancel an event
 * Body: { reason }
 */
const cancelEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { reason = '' } = req.body;

    const event = await Event.findOne({ _id: eventId, isDeleted: false });
    if (!event) {
      return sendError(res, 'Event not found', constants.ERROR_CODES.NOT_FOUND, null, 404);
    }

    // Only organizer or admin can cancel
    if (
      event.organizerId.toString() !== req.user._id.toString() &&
      req.user.role !== constants.ROLES.ADMIN
    ) {
      return sendError(res, 'Unauthorized', 'FORBIDDEN', [], 403);
    }

    event.status = 'cancelled';
    event.cancellationReason = reason;
    event.cancelledAt = new Date();
    event.cancelledBy = req.user._id;
    await event.save();

    // Create notification for all attendees
    const rsvps = await EventRSVP.find({
      eventId,
      status: 'yes',
      isDeleted: false,
    });

    for (const rsvp of rsvps) {
      const notification = new Notification({
        userId: rsvp.userId,
        type: constants.NOTIFICATION_TYPES.EVENT,
        title: 'Event Cancelled',
        message: `Event "${event.title}" has been cancelled${reason ? `. Reason: ${reason}` : ''}`,
        relatedId: eventId,
        relatedModel: 'Event',
      });
      await notification.save();
    }

    logger.info('Event cancelled', {
      eventId,
      canceledBy: req.user._id,
      reason,
    });

    sendSuccess(res, {
      eventId,
      status: 'cancelled',
      attendeesNotified: rsvps.length,
    }, 'Event cancelled successfully');
  } catch (error) {
    logger.error('Error cancelling event', {
      eventId: req.params.eventId,
      error: error.message,
    });
    next(error);
  }
};

/**
 * POST /api/events/:eventId/invite
 * Send invitations to multiple users
 * Body: { userIds: [array of user IDs] }
 */
const sendEventInvitations = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { userIds = [] } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return sendError(res, 'Valid user IDs array is required', 'VALIDATION_ERROR', [], 400);
    }

    const event = await Event.findOne({ _id: eventId, isDeleted: false });
    if (!event) {
      return sendError(res, 'Event not found', constants.ERROR_CODES.NOT_FOUND, null, 404);
    }

    // Create notifications for invited users
    let notificationsCreated = 0;
    for (const userId of userIds) {
      const notification = new Notification({
        userId,
        type: constants.NOTIFICATION_TYPES.EVENT,
        title: 'You are invited to an event',
        message: `You are invited to attend "${event.title}" on ${event.startAt.toDateString()}`,
        relatedId: eventId,
        relatedModel: 'Event',
      });
      await notification.save();
      notificationsCreated++;
    }

    logger.info('Event invitations sent', {
      eventId,
      invitationCount: notificationsCreated,
      sentBy: req.user._id,
    });

    sendSuccess(res, {
      eventId,
      invitationsSent: notificationsCreated,
    }, 'Invitations sent successfully');
  } catch (error) {
    logger.error('Error sending invitations', {
      eventId: req.params.eventId,
      error: error.message,
    });
    next(error);
  }
};

/**
 * GET /api/events/calendar
 * Get calendar data for a specific month/year
 * Query params: month, year
 */
const getEventCalendarData = async (req, res, next) => {
  try {
    const month = parseInt(req.query.month, 10) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();

    if (month < 1 || month > 12) {
      return sendError(res, 'Invalid month. Must be 1-12', 'VALIDATION_ERROR', [], 400);
    }

    // Get first and last day of month
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);

    const events = await Event.find({
      startAt: {
        $gte: firstDay,
        $lte: lastDay,
      },
      isDeleted: false,
    })
      .select('_id title startAt endAt location eventType status attendeeCount')
      .lean();

    // Group events by day
    const calendarData = {};
    for (let day = 1; day <= lastDay.getDate(); day++) {
      calendarData[day] = [];
    }

    events.forEach((event) => {
      const day = event.startAt.getDate();
      if (calendarData[day]) {
        calendarData[day].push({
          id: event._id,
          title: event.title,
          time: event.startAt.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          type: event.eventType,
          status: event.status,
          attendees: event.attendeeCount || 0,
        });
      }
    });

    logger.info('Retrieved calendar data', {
      month,
      year,
      eventCount: events.length,
    });

    sendSuccess(res, {
      month,
      year,
      daysInMonth: lastDay.getDate(),
      events: calendarData,
      totalEvents: events.length,
    }, 'Calendar data retrieved successfully');
  } catch (error) {
    logger.error('Error fetching calendar data', {
      error: error.message,
    });
    next(error);
  }
};

/**
 * GET /api/events/popular
 * Get popular/top events by attendance
 * Query params: limit (default 5)
 */
const getPopularEvents = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 5, 20);

    // Get events with RSVP counts
    const popularEvents = await Event.aggregate([
      {
        $match: {
          isDeleted: false,
          startAt: { $gte: new Date() }, // Only upcoming events
        },
      },
      {
        $lookup: {
          from: 'event_rsvps',
          let: { eventId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$eventId', '$$eventId'] },
                status: 'yes',
                isDeleted: false,
              },
            },
            { $count: 'count' },
          ],
          as: 'rsvpData',
        },
      },
      {
        $addFields: {
          attendeeCount: {
            $cond: {
              if: { $gt: [{ $size: '$rsvpData' }, 0] },
              then: { $arrayElemAt: ['$rsvpData.count', 0] },
              else: 0,
            },
          },
        },
      },
      {
        $sort: { attendeeCount: -1 },
      },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          startAt: 1,
          location: 1,
          eventType: 1,
          attendeeCount: 1,
          imageUrl: 1,
        },
      },
    ]);

    logger.info('Retrieved popular events', {
      count: popularEvents.length,
    });

    sendSuccess(res, popularEvents, 'Popular events retrieved successfully');
  } catch (error) {
    logger.error('Error fetching popular events', {
      error: error.message,
    });
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
  // Phase 5: Analytics & Advanced Features
  getEventAnalytics,
  getEventAttendanceStats,
  checkInAttendee,
  rescheduleEvent,
  cancelEvent,
  sendEventInvitations,
  getEventCalendarData,
  getPopularEvents,
};
