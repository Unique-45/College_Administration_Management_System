/**
 * Attendance Routes
 * All routes related to attendance management (CRUD operations)
 * Phase 4: Attendance Management
 */

const express = require('express');
const attendanceController = require('../controllers/attendanceController');
const { authMiddleware } = require('../middleware/auth');
const { roleGuard } = require('../middleware/roleGuard');
const logger = require('../utils/logger');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// ============================================
// ATTENDANCE MARKING (Teachers and Admins only)
// ============================================

/**
 * POST /api/attendance/mark
 * Mark attendance for a class session
 * @body {string} classId - Class ID (required)
 * @body {string} date - Attendance date (YYYY-MM-DD) (required)
 * @body {Array} attendanceRecords - Array of attendance records (required)
 *   - studentId: Student ID
 *   - status: Attendance status (Present/Absent/Late)
 *   - notes: Optional notes
 * @returns {Object} - {success, data: {attendance records}}
 * @access Teacher (class teacher), Admin
 */
router.post('/mark', roleGuard(['teacher', 'admin']), attendanceController.markAttendance);

// ============================================
// ATTENDANCE RETRIEVAL
// ============================================

/**
 * GET /api/attendance/class/:classId
 * Get attendance records for a specific class
 * Query parameters:
 *   - date: Specific date (YYYY-MM-DD)
 *   - startDate: Start date for range (YYYY-MM-DD)
 *   - endDate: End date for range (YYYY-MM-DD)
 *   - studentId: Filter by specific student
 *   - page: Page number (default: 1)
 *   - limit: Items per page (default: 10, max: 100)
 * Role-based access:
 *   - Admin: Can see all classes
 *   - Teacher: Sees only their classes
 *   - Student: Sees only their own attendance in enrolled classes
 * @param {string} classId - Class ID (required)
 * @returns {Object} - {success, data: {attendance records, pagination}}
 * @access Admin, Class teacher, Enrolled students
 */
router.get('/class/:classId', attendanceController.getClassAttendance);

/**
 * GET /api/attendance/student/:studentId
 * Get attendance records for a specific student
 * Query parameters:
 *   - classId: Filter by specific class
 *   - startDate: Start date for range (YYYY-MM-DD)
 *   - endDate: End date for range (YYYY-MM-DD)
 *   - page: Page number (default: 1)
 *   - limit: Items per page (default: 10, max: 100)
 * Role-based access:
 *   - Admin: Can see all students
 *   - Teacher: Sees attendance of students in their classes
 *   - Student: Sees only their own attendance
 * @param {string} studentId - Student ID (required)
 * @returns {Object} - {success, data: {attendance records, pagination}}
 * @access Admin, Class teacher (for their students), Student (own records)
 */
router.get('/student/:studentId', attendanceController.getStudentAttendance);

/**
 * GET /api/attendance/:id
 * Get specific attendance record by ID
 * @param {string} id - Attendance record ID (required)
 * @returns {Object} - {success, data: {attendance record}}
 * @access Admin, Class teacher, Student (own record)
 */
router.get('/:id', attendanceController.getAttendance);

// ============================================
// ATTENDANCE UPDATE (Teachers and Admins only)
// ============================================

/**
 * PUT /api/attendance/:id
 * Update attendance record
 * @param {string} id - Attendance record ID (required)
 * @body {string} status - New attendance status (Present/Absent/Late) (optional)
 * @body {string} notes - Updated notes (optional)
 * @returns {Object} - {success, data: {updated attendance record}}
 * @access Class teacher, Admin only
 */
router.put('/:id', roleGuard(['teacher', 'admin']), attendanceController.updateAttendance);

// ============================================
// ATTENDANCE DELETION (Admins only)
// ============================================

/**
 * DELETE /api/attendance/:id
 * Delete attendance record (hard delete for erroneous entries)
 * @param {string} id - Attendance record ID (required)
 * @returns {Object} - {success, data: {deleted attendance ID}}
 * @access Admin only
 */
router.delete('/:id', roleGuard(['admin']), attendanceController.deleteAttendance);

// ============================================
// ATTENDANCE REPORTS AND ANALYTICS
// ============================================

/**
 * GET /api/attendance/reports/class/:classId
 * Get attendance report for a class
 * Query parameters:
 *   - startDate: Start date (YYYY-MM-DD) (required)
 *   - endDate: End date (YYYY-MM-DD) (required)
 *   - includeDetails: Include individual records (default: false)
 * Role-based access:
 *   - Admin: Can see all classes
 *   - Teacher: Sees only their classes
 * @param {string} classId - Class ID (required)
 * @returns {Object} - {success, data: {report with statistics}}
 * @access Admin, Class teacher
 */
router.get('/reports/class/:classId', roleGuard(['teacher', 'admin']), attendanceController.getClassAttendanceReport);

/**
 * GET /api/attendance/reports/student/:studentId
 * Get attendance report for a student
 * Query parameters:
 *   - startDate: Start date (YYYY-MM-DD) (required)
 *   - endDate: End date (YYYY-MM-DD) (required)
 *   - classId: Filter by specific class (optional)
 * Role-based access:
 *   - Admin: Can see all students
 *   - Teacher: Sees students in their classes
 *   - Student: Sees only their own report
 * @param {string} studentId - Student ID (required)
 * @returns {Object} - {success, data: {report with statistics}}
 * @access Admin, Class teacher, Student (own report)
 */
router.get('/reports/student/:studentId', attendanceController.getStudentAttendanceReport);

/**
 * GET /api/attendance/dashboard/summary
 * Get attendance summary for dashboard
 * Query parameters:
 *   - classId: Filter by specific class (optional)
 *   - date: Specific date (YYYY-MM-DD) (optional, defaults to today)
 * Role-based filtering:
 *   - Admin: Summary for all classes
 *   - Teacher: Summary for their classes
 *   - Student: Summary for their enrolled classes
 * @returns {Object} - {success, data: {summary statistics}}
 * @access All authenticated users
 */
router.get('/dashboard/summary', attendanceController.getAttendanceSummary);

module.exports = router;