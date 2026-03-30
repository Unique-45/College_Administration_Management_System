/**
 * Events Routes
 * Phase 6: Events & Notifications
 * Phase 5: Analytics & Advanced Features (additional endpoints)
 */

const express = require('express');
const eventsController = require('../controllers/eventsController');
const { authMiddleware, authenticate } = require('../middleware/auth');
const { roleGuard } = require('../middleware/roleGuard');

const router = express.Router();

router.use(authMiddleware);

// ============================================
// SPECIAL ROUTES (must come before :id routes)
// ============================================

// Event analytics
router.get('/analytics', eventsController.getEventAnalytics);

// Calendar data
router.get('/calendar', eventsController.getEventCalendarData);

// Popular events
router.get('/popular', eventsController.getPopularEvents);

// ============================================
// BASIC CRUD ENDPOINTS
// ============================================

router.get('/', eventsController.listEvents);
router.post('/', roleGuard('admin', 'teacher'), eventsController.createEvent);

// ============================================
// SPECIFIC EVENT ENDPOINTS (requires :id/:eventId)
// ============================================

router.get('/:id', eventsController.getEventById);
router.put('/:id', roleGuard('admin', 'teacher'), eventsController.updateEvent);
router.delete('/:id', roleGuard('admin', 'teacher'), eventsController.deleteEvent);

router.post('/:id/rsvp', eventsController.rsvpEvent);
router.get('/:id/attendees', roleGuard('admin', 'teacher'), eventsController.listEventAttendees);

// Attendance statistics
router.get('/:eventId/attendance-stats', eventsController.getEventAttendanceStats);

// Check-in attendee
router.post('/:eventId/check-in', roleGuard('admin', 'teacher'), eventsController.checkInAttendee);

// Reschedule event
router.put('/:eventId/reschedule', roleGuard('admin', 'teacher'), eventsController.rescheduleEvent);

// Cancel event
router.post('/:eventId/cancel', roleGuard('admin', 'teacher'), eventsController.cancelEvent);

// Send invitations
router.post('/:eventId/invite', roleGuard('admin', 'teacher'), eventsController.sendEventInvitations);

module.exports = router;
