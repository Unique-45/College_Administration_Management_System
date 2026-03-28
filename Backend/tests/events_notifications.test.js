/**
 * Events + Notifications Tests
 * Phase 6 implementation validation
 */

const request = require('supertest');
const User = require('../models/User');
const Event = require('../models/Event');
const EventRSVP = require('../models/EventRSVP');
const Notification = require('../models/Notification');
const AuthService = require('../services/authService');
const { app } = require('./setup');

describe('Phase 6 Events and Notifications', () => {
  let adminUser;
  let teacherUser;
  let studentUser;
  let adminToken;
  let teacherToken;
  let studentToken;

  beforeEach(async () => {
    await User.deleteMany({});
    await Event.deleteMany({});
    await EventRSVP.deleteMany({});
    await Notification.deleteMany({});

    adminUser = await User.create({
      name: 'Admin',
      email: 'admin@example.com',
      password: await AuthService.hashPassword('AdminPass123!'),
      role: 'admin',
    });

    teacherUser = await User.create({
      name: 'Teacher',
      email: 'teacher@example.com',
      password: await AuthService.hashPassword('TeacherPass123!'),
      role: 'teacher',
    });

    studentUser = await User.create({
      name: 'Student',
      email: 'student@example.com',
      password: await AuthService.hashPassword('StudentPass123!'),
      role: 'student',
    });

    adminToken = (await AuthService.generateTokens(adminUser)).accessToken;
    teacherToken = (await AuthService.generateTokens(teacherUser)).accessToken;
    studentToken = (await AuthService.generateTokens(studentUser)).accessToken;
  });

  test('teacher can create, update, get event and list events', async () => {
    const now = new Date(Date.now() + 60 * 1000); // starts 1 minute in the future
    const later = new Date(now.getTime() + 60 * 60 * 1000); // +1 hour

    const createResponse = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        title: 'Parent Teacher Meet',
        description: 'Quarterly review and planning session',
        location: 'Main Auditorium',
        startAt: now.toISOString(),
        endAt: later.toISOString(),
      });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.success).toBe(true);
    expect(createResponse.body.data.title).toBe('Parent Teacher Meet');

    const eventId = createResponse.body.data._id;

    const getResponse = await request(app)
      .get(`/api/events/${eventId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(getResponse.status).toBe(200);
    expect(getResponse.body.success).toBe(true);
    expect(getResponse.body.data._id).toBe(eventId);
    expect(getResponse.body.data.attendeeCounts).toBeDefined();
    expect(getResponse.body.data.currentUserRsvpStatus).toBeNull();

    const listResponse = await request(app)
      .get('/api/events')
      .set('Authorization', `Bearer ${studentToken}`)
      .query({ status: 'upcoming', page: 1, limit: 10 });

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.success).toBe(true);
    expect(listResponse.body.data.items.length).toBeGreaterThan(0);

    const updateResponse = await request(app)
      .put(`/api/events/${eventId}`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        title: 'Updated Parent Teacher Meet',
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.success).toBe(true);
    expect(updateResponse.body.data.title).toBe('Updated Parent Teacher Meet');
  });

  test('student can RSVP and organizer receives notification', async () => {
    const now = new Date();
    const later = new Date(now.getTime() + 3600 * 1000 * 24);

    const event = await Event.create({
      title: 'Science Fair',
      description: 'Annual science exhibition',
      location: 'Hall B',
      startAt: now,
      endAt: later,
      organizer: teacherUser._id,
      organizerName: teacherUser.name,
    });

    const rsvpResponse = await request(app)
      .post(`/api/events/${event._id}/rsvp`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ status: 'yes' });

    expect(rsvpResponse.status).toBe(200);
    expect(rsvpResponse.body.success).toBe(true);
    expect(rsvpResponse.body.data.status).toBe('yes');

    const attendeesResponse = await request(app)
      .get(`/api/events/${event._id}/attendees`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(attendeesResponse.status).toBe(200);
    expect(attendeesResponse.body.success).toBe(true);
    expect(attendeesResponse.body.data.counts.yes).toBe(1);

    const adminNotifications = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(adminNotifications.status).toBe(200);
    expect(adminNotifications.body.success).toBe(true);

    const teacherNotifications = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${teacherToken}`);

    expect(teacherNotifications.status).toBe(200);
    expect(teacherNotifications.body.data.items.some((n) => n.title.includes('RSVP updated for'))).toBe(true);

    const unreadCount = await request(app)
      .get('/api/notifications/unread')
      .set('Authorization', `Bearer ${teacherToken}`);

    expect(unreadCount.status).toBe(200);
    expect(unreadCount.body.data.count).toBeGreaterThan(0);

    const notificationId = teacherNotifications.body.data.items[0]._id;
    const markRead = await request(app)
      .post(`/api/notifications/${notificationId}/read`)
      .set('Authorization', `Bearer ${teacherToken}`);

    expect(markRead.status).toBe(200);
    expect(markRead.body.success).toBe(true);

    const markAllRead = await request(app)
      .post('/api/notifications/read-all')
      .set('Authorization', `Bearer ${teacherToken}`);

    expect(markAllRead.status).toBe(200);
    expect(markAllRead.body.data.modifiedCount).toBeGreaterThanOrEqual(0);

    const deleteResponse = await request(app)
      .delete(`/api/notifications/${notificationId}`)
      .set('Authorization', `Bearer ${teacherToken}`);

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.success).toBe(true);
  });
});
