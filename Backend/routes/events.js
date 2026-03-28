/**
 * Events Routes
 * Phase 6: Events & Notifications
 */

const express = require('express');
const eventsController = require('../controllers/eventsController');
const { authMiddleware } = require('../middleware/auth');
const { roleGuard } = require('../middleware/roleGuard');

const router = express.Router();

router.use(authMiddleware);

router.get('/', eventsController.listEvents);
router.get('/:id', eventsController.getEventById);
router.post('/', roleGuard('admin', 'teacher'), eventsController.createEvent);
router.put('/:id', roleGuard('admin', 'teacher'), eventsController.updateEvent);
router.delete('/:id', roleGuard('admin', 'teacher'), eventsController.deleteEvent);

router.post('/:id/rsvp', eventsController.rsvpEvent);
router.get('/:id/attendees', roleGuard('admin', 'teacher'), eventsController.listEventAttendees);

module.exports = router;
