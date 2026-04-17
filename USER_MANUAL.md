# College Administration Management System - User Manual

Version: 1.0 (Implementation-aligned)
Last Updated: 2026-04-17
Applies To: Frontend (React) + Backend APIs currently implemented in this repository

## 1. Purpose and Scope
This manual explains how to use the College Administration Management System (CAMS) as it exists in the current implementation, while staying aligned with the SRS goals:
- Secure role-based access (Admin, Teacher, Student)
- Attendance management
- Video content upload and streaming
- Events and notifications
- Student fee payments
- Analytics and reporting

This document is intentionally implementation-first. If any older planning docs differ from actual behavior, treat this manual as the current source for end-user usage.

## 2. User Roles and Access
CAMS uses role-based access control (RBAC):
- Admin: system management, users/classes, platform analytics, events, video management
- Teacher: class/attendance operations, event operations, video upload and library, analytics
- Student: personal dashboard, attendance visibility, event participation, video learning, payments

If a user tries to open another role's route, the app redirects to an Unauthorized (403) page.

## 3. Authentication and Account Access
### 3.1 Sign In
Route: `/login`

Steps:
1. Enter email and password.
2. (Optional) enable Remember Me.
3. Click Sign in.
4. You are redirected to your role dashboard:
- Admin -> `/admin/dashboard`
- Teacher -> `/teacher/dashboard`
- Student -> `/student/dashboard`

### 3.2 Registration
Route: `/register`

Steps:
1. Enter name, email, password, confirm password.
2. Choose role: student or teacher.
3. Click Create account.
4. After success, you are redirected to login.

Teacher registration rule in UI:
- Teacher email must end with `@fot.college.edu`.

### 3.3 Forgot/Reset Password
Routes:
- Forgot password: `/forgot-password`
- Reset password: `/reset-password/:token`

Steps:
1. Submit your email on Forgot Password.
2. Open reset link received by email.
3. Set and confirm new password.
4. Return to login.

### 3.4 Session Behavior
- JWT access and refresh tokens are used.
- Session restoration and periodic refresh are implemented.
- Current frontend implementation stores auth tokens in localStorage and attaches Bearer token headers.

## 4. Main Navigation by Role
## 4.1 Admin Navigation
- Dashboard: `/admin/dashboard`
- Users: `/admin/users`
- Classes: `/admin/classes`
- Analytics: `/admin/analytics`
- Events:
- Event List: `/admin/events/list`
- Calendar: `/admin/events/calendar`
- Event Analytics: `/admin/events/analytics`
- Videos:
- Library: `/admin/videos/library`
- Upload: `/admin/videos/upload`
- Settings: `/admin/settings`

## 4.2 Teacher Navigation
- Dashboard: `/teacher/dashboard`
- Classes: `/teacher/classes`
- Attendance: `/teacher/attendance`
- Videos:
- Upload: `/teacher/videos/upload`
- Library: `/teacher/videos/library`
- Analytics: `/teacher/analytics`
- Events Hub: `/teacher/events`
- Settings: `/teacher/settings`

## 4.3 Student Navigation
- Dashboard: `/student/dashboard`
- Classes: `/student/classes`
- Attendance: `/student/attendance`
- Lessons/Videos: `/student/videos`
- Events Calendar/List: `/student/events`
- Payments: `/student/payments`
- Settings: `/student/settings`

## 5. Feature Usage Guide
## 5.1 Dashboards
### Admin Dashboard
Purpose:
- Global operational overview
- User and class management widgets
- Reporting and system health views

How to use:
1. Open Dashboard.
2. Review KPI cards and health indicators.
3. Use Users and Classes sections for quick administration actions.

### Teacher Dashboard
Purpose:
- Class and attendance snapshot
- Quick action shortcuts
- Student engagement and content widgets

How to use:
1. Open Dashboard.
2. Use quick actions to jump to attendance/video workflows.
3. Monitor class and student activity summaries.

### Student Dashboard
Purpose:
- Academic and personal overview
- Schedule, attendance, fee status, and content shortcuts

How to use:
1. Open Dashboard.
2. Review profile and pending fee section.
3. Navigate to timetable, videos, and attendance details.

## 5.2 Users Management (Admin)
Route: `/admin/users`

Capabilities:
- Search users
- Create user (student/teacher)
- Edit user details
- Delete user

Create user steps:
1. Click Add User.
2. Fill name, email, role, phone, password.
3. Click Create.

Edit user steps:
1. Click Edit icon on user row.
2. Update fields.
3. Click Update.

Delete user:
1. Click Delete icon.
2. Confirm action.

## 5.3 Classes Management (Admin, Teacher)
Routes:
- Admin: `/admin/classes`
- Teacher: `/teacher/classes`
- Student: `/student/classes` (view-oriented)

Capabilities for Admin/Teacher:
- Search classes
- Add class
- Edit class
- Delete class

Create class steps:
1. Click Add Class.
2. Fill class name, subject, capacity, semester, academic year, description.
3. Click Create Class.

## 5.4 Attendance Management
Routes:
- Teacher: `/teacher/attendance`
- Student: `/student/attendance`

Management flow (Teacher in current UI):
1. Open Attendance page.
2. Select class and date.
3. Use Query Records to fetch past attendance.
4. Click Take Attendance.
5. Mark each student as Present, Absent, or Late.
6. Click Confirm and Finalize.

Note:
- Backend permissions allow admin attendance operations, but dedicated admin attendance navigation is not exposed in current frontend routes.

Student flow:
1. Open Attendance page.
2. Review personal attendance records and statuses.

## 5.5 Video Content Management and Streaming
### Admin/Teacher Video Library
Routes:
- Admin: `/admin/videos/library`
- Teacher: `/teacher/videos/library`

Capabilities:
- Browse videos in grid/table mode
- Search and filter by subject/class
- Delete videos

### Video Upload (Admin/Teacher)
Routes:
- Admin: `/admin/videos/upload`
- Teacher: `/teacher/videos/upload`

Upload steps:
1. Open Upload page.
2. Enter title, description, subject, target class.
3. Select video file (supported: mp4, webm, mov, avi, mkv; size up to 500 MB in UI validation).
4. Optional: add thumbnail (jpg/jpeg/png/webp).
5. Click Publish Video.

### Student Video Library
Route: `/student/videos`

Student actions:
- Browse featured and listed videos
- Filter by subject/class
- Open player to stream content
- Watch progress is tracked

## 5.6 Events and Participation
Routes:
- Admin list/calendar/analytics: `/admin/events/list`, `/admin/events/calendar`, `/admin/events/analytics`
- Teacher events: `/teacher/events`
- Student events: `/student/events`

Student actions:
- View event cards/details
- RSVP yes/maybe/no

Admin/Teacher actions:
- Create event (name, description, type, date/time, location, optional image, optional max participants, status)
- View attendee list
- Check in attendees
- Reschedule event
- Cancel event
- Delete event

## 5.7 Payments (Student)
Route: `/student/payments`

Capabilities:
- View pending fees summary
- Initiate payment
- Verify payment
- View payment history
- Download receipts for successful transactions

Payment steps:
1. Open Payments.
2. Enter amount (must be > 0 and <= pending amount).
3. Choose method:
- Razorpay checkout
- UPI path
4. Confirm payment.
5. On success, history updates and receipt download becomes available.

Notes:
- If API fetch fails, fallback sample financial data may be shown in UI.

## 5.8 Analytics
Routes:
- Admin: `/admin/analytics`
- Teacher: `/teacher/analytics`

Available analytics views include:
- Video analytics
- Engagement metrics
- Viewership trends
- Peak watch times
- Attendance analytics
- Report types and report generation
- Revenue analytics (admin only)

## 5.9 Settings and Profile Preferences
Routes:
- Admin: `/admin/settings`
- Teacher: `/teacher/settings`
- Student: `/student/settings`

Current settings UI provides:
- Profile and identity panel
- Security section
- Notification preference toggles
- Regional/system preference controls

Important:
- Some settings sections are currently UI-first and may not persist all fields to backend yet.

## 6. Notifications
- Notification count appears in header (bell icon with unread badge).
- Notification APIs and a NotificationCenter component exist.
- Main role dashboards currently act as notification entry points.

## 7. Security and Data Handling (User-Facing)
Implemented security behavior:
- Auth required for protected routes
- Role-specific route protection
- JWT-based authentication with token refresh support
- Secure payment verification flow and webhook support on backend

User best practices:
- Use strong passwords.
- Sign out when using shared devices.
- Do not share reset links or OTP/payment details.

## 8. Known UX/Navigation Notes (Current Build)
1. Sidebar parent item `/admin/events` is a grouping entry; use sub-items (Event List/Calendar/Analytics) for direct pages.
2. Header menu has a View Profile action pointing to `/profile`; this route is not defined in current App routes.
3. Analytics and settings pages include a mix of production and UI-prototype sections.

## 9. Troubleshooting
## 9.1 Login fails
- Verify credentials.
- If password was reset recently, sign in using the new password.
- If session expired, re-login.

## 9.2 Unauthorized access (403)
- You are signed in with a role that does not have permission for that route.
- Navigate to your role dashboard.

## 9.3 Payment issues
- Check internet connectivity and gateway popup blockers.
- Retry with valid amount not exceeding pending fee.
- If receipt download is disabled, confirm payment status is success.

## 9.4 Empty lists (events/videos/classes)
- Clear filters/search terms.
- Ensure your role has access to the relevant dataset.

## 10. SRS Coverage Summary (Current Implementation)
Covered in current system:
- JWT auth and RBAC
- Role-based dashboards
- Attendance workflows
- Video upload and student streaming
- Events and RSVP management
- Notifications (API + UI integration points)
- Payment initiation/verification/history/receipt
- Analytics endpoints and dashboard usage

Partially implemented/UI-driven areas:
- Some advanced profile/settings persistence
- Certain UI controls tied to future backend persistence workflows

---
If you want, this manual can be extended into role-specific quick reference sheets (Admin Quick Card, Teacher Daily Workflow, Student First Week Guide) in separate files.