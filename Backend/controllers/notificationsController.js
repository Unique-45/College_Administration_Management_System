/**
 * Notifications Controller
 * Phase 6: Events & Notifications
 */

const Notification = require('../models/Notification');
const constants = require('../config/constants');
const logger = require('../utils/logger');
const { sendSuccess, sendError, sendPaginatedSuccess } = require('../utils/responses');

const listNotifications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || constants.PAGINATION_DEFAULTS.PAGE;
    const limit = Math.min(
      parseInt(req.query.limit, 10) || constants.PAGINATION_DEFAULTS.LIMIT,
      constants.PAGINATION_DEFAULTS.MAX_LIMIT
    );

    const filter = {
      userId: req.user.userId,
      isDeleted: false,
    };

    if (req.query.type) {
      filter.type = req.query.type;
    }

    if (req.query.read === 'true') {
      filter.read = true;
    } else if (req.query.read === 'false') {
      filter.read = false;
    }

    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(filter),
    ]);

    return sendPaginatedSuccess(res, notifications, page, limit, total, 'Notifications fetched successfully');
  } catch (error) {
    logger.error('Error listing notifications', { error: error.message, userId: req.user.userId });
    next(error);
  }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.user.userId,
      read: false,
      isDeleted: false,
    });

    return sendSuccess(res, { count }, 'Unread notifications count fetched successfully');
  } catch (error) {
    logger.error('Error counting unread notifications', { error: error.message, userId: req.user.userId });
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOne({
      _id: id,
      userId: req.user.userId,
      isDeleted: false,
    });

    if (!notification) {
      return sendError(res, 'Notification not found', constants.ERROR_CODES.NOT_FOUND, null, constants.HTTP_STATUS.NOT_FOUND);
    }

    notification.read = true;
    await notification.save();

    return sendSuccess(res, 'Notification marked as read');
  } catch (error) {
    logger.error('Error marking notification as read', { error: error.message, params: req.params, userId: req.user.userId });
    next(error);
  }
};

const markAllRead = async (req, res, next) => {
  try {
    const result = await Notification.updateMany(
      { userId: req.user.userId, read: false, isDeleted: false },
      { $set: { read: true } }
    );

    return sendSuccess(res, { modifiedCount: result.modifiedCount }, 'All notifications marked as read');
  } catch (error) {
    logger.error('Error marking all notifications as read', { error: error.message, userId: req.user.userId });
    next(error);
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOne({
      _id: id,
      userId: req.user.userId,
      isDeleted: false,
    });

    if (!notification) {
      return sendError(res, 'Notification not found', constants.ERROR_CODES.NOT_FOUND, null, constants.HTTP_STATUS.NOT_FOUND);
    }

    notification.isDeleted = true;
    notification.deletedAt = new Date();
    notification.deletedBy = req.user.userId;
    await notification.save();

    return sendSuccess(res, 'Notification deleted successfully');
  } catch (error) {
    logger.error('Error deleting notification', { error: error.message, params: req.params, userId: req.user.userId });
    next(error);
  }
};

module.exports = {
  listNotifications,
  getUnreadCount,
  markAsRead,
  markAllRead,
  deleteNotification,
};
