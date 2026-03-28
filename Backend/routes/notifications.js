/**
 * Notifications Routes
 * Phase 6: Events & Notifications
 */

const express = require('express');
const notificationsController = require('../controllers/notificationsController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/', notificationsController.listNotifications);
router.get('/unread', notificationsController.getUnreadCount);
router.post('/:id/read', notificationsController.markAsRead);
router.post('/read-all', notificationsController.markAllRead);
router.delete('/:id', notificationsController.deleteNotification);

module.exports = router;
