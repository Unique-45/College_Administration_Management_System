/**
 * Attendance Controller
 * Handles attendance marking, retrieval, and reporting
 * Phase 4: Attendance Management
 */

const Attendance = require('../models/Attendance');
const Class = require('../models/Class');
const User = require('../models/User');
const logger = require('../utils/logger');
const { sendSuccess, sendError } = require('../utils/responses');
const { validateAttendanceMark, validateAttendanceUpdate, extractValidationErrors } = require('../utils/validators');
const constants = require('../config/constants');

// ============================================
// MARK ATTENDANCE
// ============================================

/**
 * Mark attendance for a class
 * POST /api/attendance/mark
 * Only Teacher and Admin can mark attendance
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const markAttendance = async (req, res, next) => {
  try {
    logger.info('Marking attendance', {
      markedBy: req.user._id,
      body: req.body,
    });

    // Validate input
    const { error, value } = validateAttendanceMark(req.body);
    if (error) {
      const details = extractValidationErrors(error);
      return sendError(
        res,
        'Validation failed',
        constants.ERROR_CODES.VALIDATION_ERROR,
        details,
        constants.HTTP_STATUS.BAD_REQUEST
      );
    }

    const { classId, date, attendance } = value;

    // Verify class exists and user has permission
    const classDoc = await Class.findById(classId);
    if (!classDoc) {
      return sendError(
        res,
        'Class not found',
        constants.ERROR_CODES.CLASS_NOT_FOUND,
        null,
        constants.HTTP_STATUS.NOT_FOUND
      );
    }

    // Check if teacher is authorized (own class or admin)
    if (req.user.role !== constants.ROLES.ADMIN && classDoc.teacher.toString() !== req.user._id.toString()) {
      return sendError(
        res,
        'Unauthorized to mark attendance for this class',
        constants.ERROR_CODES.UNAUTHORIZED,
        null,
        constants.HTTP_STATUS.FORBIDDEN
      );
    }

    // Check if attendance already exists for this date
    const existingAttendance = await Attendance.findByClassAndDate(classId, date);
    if (existingAttendance) {
      return sendError(
        res,
        'Attendance already marked for this class and date',
        constants.ERROR_CODES.ATTENDANCE_ALREADY_EXISTS,
        null,
        constants.HTTP_STATUS.CONFLICT
      );
    }

    // Validate all students exist and are enrolled in the class
    const studentIds = attendance.map(a => a.studentId);
    const students = await User.find({
      _id: { $in: studentIds },
      role: constants.ROLES.STUDENT,
      isActive: true,
    });

    if (students.length !== studentIds.length) {
      return sendError(
        res,
        'Some students not found or inactive',
        constants.ERROR_CODES.STUDENT_NOT_FOUND,
        null,
        constants.HTTP_STATUS.BAD_REQUEST
      );
    }

    // Create attendance record with enriched student data
    const attendanceRecords = attendance.map(record => {
      const student = students.find(s => s._id.toString() === record.studentId);
      return {
        studentId: record.studentId,
        studentName: student.name,
        status: record.status,
        notes: record.notes,
      };
    });

    const attendanceDoc = new Attendance({
      classId,
      className: classDoc.name,
      teacherId: req.user._id,
      teacherName: req.user.name,
      date: new Date(date),
      attendance: attendanceRecords,
      totalStudents: attendanceRecords.length,
    });

    await attendanceDoc.save();

    logger.info('Attendance marked successfully', {
      attendanceId: attendanceDoc._id,
      classId,
      date,
      markedBy: req.user._id,
    });

    return sendSuccess(
      res,
      {
        attendanceId: attendanceDoc._id,
        classId,
        date,
        totalStudents: attendanceDoc.totalStudents,
        presentCount: attendanceDoc.presentCount,
        absentCount: attendanceDoc.absentCount,
        lateCount: attendanceDoc.lateCount,
      },
      'Attendance marked successfully',
      constants.HTTP_STATUS.CREATED
    );
  } catch (error) {
    logger.error('Error marking attendance', { error: error.message, stack: error.stack });
    return next(error);
  }
};

// ============================================
// UPDATE ATTENDANCE
// ============================================

/**
 * Update attendance record
 * PUT /api/attendance/:id
 * Only Teacher and Admin can update attendance
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const updateAttendance = async (req, res, next) => {
  try {
    logger.info('Updating attendance', {
      attendanceId: req.params.id,
      updatedBy: req.user._id,
      body: req.body,
    });

    // Validate input
    const { error, value } = validateAttendanceUpdate(req.body);
    if (error) {
      const details = extractValidationErrors(error);
      return sendError(
        res,
        'Validation failed',
        constants.ERROR_CODES.VALIDATION_ERROR,
        details,
        constants.HTTP_STATUS.BAD_REQUEST
      );
    }

    const { attendance } = value;

    // Find attendance record
    const attendanceDoc = await Attendance.findById(req.params.id);
    if (!attendanceDoc || attendanceDoc.isDeleted) {
      return sendError(
        res,
        'Attendance record not found',
        constants.ERROR_CODES.ATTENDANCE_NOT_FOUND,
        null,
        constants.HTTP_STATUS.NOT_FOUND
      );
    }

    // Check permissions
    if (req.user.role !== constants.ROLES.ADMIN && attendanceDoc.teacherId.toString() !== req.user._id.toString()) {
      return sendError(
        res,
        'Unauthorized to update this attendance record',
        constants.ERROR_CODES.UNAUTHORIZED,
        null,
        constants.HTTP_STATUS.FORBIDDEN
      );
    }

    // Update attendance records
    attendance.forEach(update => {
      const record = attendanceDoc.attendance.find(a => a.studentId.toString() === update.studentId);
      if (record) {
        record.status = update.status;
        record.notes = update.notes;
        record.markedAt = new Date();
      }
    });

    await attendanceDoc.save();

    logger.info('Attendance updated successfully', {
      attendanceId: attendanceDoc._id,
      updatedBy: req.user._id,
    });

    return sendSuccess(
      res,
      {
        attendanceId: attendanceDoc._id,
        presentCount: attendanceDoc.presentCount,
        absentCount: attendanceDoc.absentCount,
        lateCount: attendanceDoc.lateCount,
      },
      'Attendance updated successfully'
    );
  } catch (error) {
    logger.error('Error updating attendance', { error: error.message, stack: error.stack });
    return next(error);
  }
};

// ============================================
// DELETE ATTENDANCE
// ============================================

/**
 * Delete attendance record (soft delete)
 * DELETE /api/attendance/:id
 * Only Teacher and Admin can delete attendance
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const deleteAttendance = async (req, res, next) => {
  try {
    logger.info('Deleting attendance', {
      attendanceId: req.params.id,
      deletedBy: req.user._id,
    });

    // Find attendance record
    const attendanceDoc = await Attendance.findById(req.params.id);
    if (!attendanceDoc || attendanceDoc.isDeleted) {
      return sendError(
        res,
        'Attendance record not found',
        constants.ERROR_CODES.ATTENDANCE_NOT_FOUND,
        null,
        constants.HTTP_STATUS.NOT_FOUND
      );
    }

    // Check permissions
    if (req.user.role !== constants.ROLES.ADMIN && attendanceDoc.teacherId.toString() !== req.user._id.toString()) {
      return sendError(
        res,
        'Unauthorized to delete this attendance record',
        constants.ERROR_CODES.UNAUTHORIZED,
        null,
        constants.HTTP_STATUS.FORBIDDEN
      );
    }

    // Soft delete
    await attendanceDoc.softDelete(req.user._id);

    logger.info('Attendance deleted successfully', {
      attendanceId: attendanceDoc._id,
      deletedBy: req.user._id,
    });

    return sendSuccess(
      res,
      { attendanceId: attendanceDoc._id },
      'Attendance record deleted successfully'
    );
  } catch (error) {
    logger.error('Error deleting attendance', { error: error.message, stack: error.stack });
    return next(error);
  }
};

// ============================================
// GET ATTENDANCE RECORDS
// ============================================

/**
 * Get attendance records with filters
 * GET /api/attendance
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const getAttendance = async (req, res, next) => {
  try {
    const {
      classId,
      studentId,
      teacherId,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = req.query;

    logger.info('Fetching attendance records', { query: req.query, user: req.user._id });

    // Build query
    const query = { isDeleted: false };

    if (classId) query.classId = classId;
    if (studentId) query['attendance.studentId'] = studentId;
    if (teacherId) query.teacherId = teacherId;

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Permission check
    if (req.user.role === constants.ROLES.STUDENT) {
      // Students can only see their own attendance
      query['attendance.studentId'] = req.user._id;
    } else if (req.user.role === constants.ROLES.TEACHER) {
      // Teachers can see attendance for their classes
      const teacherClasses = await Class.find({ teacher: req.user._id }).select('_id');
      const classIds = teacherClasses.map(c => c._id);
      query.classId = { $in: classIds };
    }
    // Admin can see all

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const attendanceRecords = await Attendance.find(query)
      .populate('classId', 'name subject')
      .populate('teacherId', 'name')
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Attendance.countDocuments(query);

    return sendSuccess(
      res,
      {
        attendance: attendanceRecords,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
      'Attendance records retrieved successfully'
    );
  } catch (error) {
    logger.error('Error fetching attendance', { error: error.message, stack: error.stack });
    return next(error);
  }
};

// ============================================
// GET STUDENT ATTENDANCE
// ============================================

/**
 * Get student's full attendance record
 * GET /api/attendance/student/:studentId
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const getStudentAttendance = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { startDate, endDate } = req.query;

    logger.info('Fetching student attendance', {
      studentId,
      startDate,
      endDate,
      requestedBy: req.user._id,
    });

    // Permission check
    if (req.user.role === constants.ROLES.STUDENT && req.user._id.toString() !== studentId) {
      return sendError(
        res,
        'Unauthorized to view other students\' attendance',
        constants.ERROR_CODES.UNAUTHORIZED,
        null,
        constants.HTTP_STATUS.FORBIDDEN
      );
    }

    // Verify student exists
    const student = await User.findById(studentId);
    if (!student || student.role !== constants.ROLES.STUDENT) {
      return sendError(
        res,
        'Student not found',
        constants.ERROR_CODES.STUDENT_NOT_FOUND,
        null,
        constants.HTTP_STATUS.NOT_FOUND
      );
    }

    // Get attendance records
    const attendanceRecords = await Attendance.getStudentAttendance(
      studentId,
      startDate || '2026-01-01',
      endDate || new Date().toISOString().split('T')[0]
    );

    // Calculate statistics
    const totalSessions = attendanceRecords.length;
    const presentCount = attendanceRecords.filter(a => a.status === 'present').length;
    const absentCount = attendanceRecords.filter(a => a.status === 'absent').length;
    const lateCount = attendanceRecords.filter(a => a.status === 'late').length;

    const attendancePercentage = totalSessions > 0
      ? ((presentCount + lateCount * 0.5) / totalSessions * 100).toFixed(2)
      : 0;

    return sendSuccess(
      res,
      {
        student: {
          id: student._id,
          name: student.name,
          email: student.email,
        },
        attendance: attendanceRecords,
        statistics: {
          totalSessions,
          presentCount,
          absentCount,
          lateCount,
          attendancePercentage: parseFloat(attendancePercentage),
        },
      },
      'Student attendance retrieved successfully'
    );
  } catch (error) {
    logger.error('Error fetching student attendance', { error: error.message, stack: error.stack });
    return next(error);
  }
};

// ============================================
// GET CLASS ATTENDANCE OVERVIEW
// ============================================

/**
 * Get class attendance overview
 * GET /api/attendance/class/:classId
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const getClassAttendance = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const { startDate, endDate } = req.query;

    logger.info('Fetching class attendance overview', {
      classId,
      startDate,
      endDate,
      requestedBy: req.user._id,
    });

    // Verify class exists
    const classDoc = await Class.findById(classId);
    if (!classDoc) {
      return sendError(
        res,
        'Class not found',
        constants.ERROR_CODES.CLASS_NOT_FOUND,
        null,
        constants.HTTP_STATUS.NOT_FOUND
      );
    }

    // Permission check
    if (req.user.role === constants.ROLES.TEACHER && classDoc.teacher.toString() !== req.user._id.toString()) {
      return sendError(
        res,
        'Unauthorized to view attendance for this class',
        constants.ERROR_CODES.UNAUTHORIZED,
        null,
        constants.HTTP_STATUS.FORBIDDEN
      );
    }

    // Get attendance summary
    const summary = await Attendance.getClassAttendanceSummary(
      classId,
      startDate || '2026-01-01',
      endDate || new Date().toISOString().split('T')[0]
    );

    // Get recent attendance records
    const recentAttendance = await Attendance.find({
      classId,
      isDeleted: false,
      date: {
        $gte: new Date(startDate || '2026-01-01'),
        $lte: new Date(endDate || new Date()),
      },
    })
      .sort({ date: -1 })
      .limit(10)
      .populate('teacherId', 'name');

    return sendSuccess(
      res,
      {
        class: {
          id: classDoc._id,
          name: classDoc.name,
          subject: classDoc.subject,
          teacher: classDoc.teacherName,
        },
        summary: summary[0] || {
          totalSessions: 0,
          totalPresent: 0,
          totalAbsent: 0,
          totalLate: 0,
          totalStudents: 0,
        },
        recentAttendance,
      },
      'Class attendance overview retrieved successfully'
    );
  } catch (error) {
    logger.error('Error fetching class attendance', { error: error.message, stack: error.stack });
    return next(error);
  }
};

// ============================================
// GENERATE ATTENDANCE REPORT
// ============================================

/**
 * Generate attendance report
 * GET /api/attendance/report
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const generateAttendanceReport = async (req, res, next) => {
  try {
    const { classId, startDate, endDate, format = 'json' } = req.query;

    logger.info('Generating attendance report', {
      classId,
      startDate,
      endDate,
      format,
      requestedBy: req.user._id,
    });

    // Build base query
    const query = { isDeleted: false };

    if (classId) query.classId = classId;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Permission check
    if (req.user.role === constants.ROLES.TEACHER) {
      const teacherClasses = await Class.find({ teacher: req.user._id }).select('_id');
      const classIds = teacherClasses.map(c => c._id);
      query.classId = { $in: classIds };
    }

    // Get all attendance records
    const attendanceRecords = await Attendance.find(query)
      .populate('classId', 'name subject')
      .populate('teacherId', 'name')
      .sort({ date: 1, classId: 1 });

    // Process data for reporting
    const report = {
      generatedAt: new Date(),
      generatedBy: req.user.name,
      period: {
        startDate: startDate || 'All time',
        endDate: endDate || 'All time',
      },
      summary: {
        totalRecords: attendanceRecords.length,
        totalClasses: new Set(attendanceRecords.map(a => a.classId._id.toString())).size,
        totalSessions: attendanceRecords.length,
      },
      records: attendanceRecords.map(record => ({
        date: record.date,
        className: record.className,
        teacherName: record.teacherName,
        totalStudents: record.totalStudents,
        presentCount: record.presentCount,
        absentCount: record.absentCount,
        lateCount: record.lateCount,
        attendancePercentage: record.totalStudents > 0
          ? ((record.presentCount + record.lateCount * 0.5) / record.totalStudents * 100).toFixed(2)
          : 0,
      })),
    };

    // Calculate overall statistics
    if (attendanceRecords.length > 0) {
      const totalPresent = attendanceRecords.reduce((sum, r) => sum + r.presentCount, 0);
      const totalAbsent = attendanceRecords.reduce((sum, r) => sum + r.absentCount, 0);
      const totalLate = attendanceRecords.reduce((sum, r) => sum + r.lateCount, 0);
      const totalStudents = attendanceRecords.reduce((sum, r) => sum + r.totalStudents, 0);

      report.summary.overallAttendance = {
        totalPresent,
        totalAbsent,
        totalLate,
        totalStudents,
        attendancePercentage: totalStudents > 0
          ? ((totalPresent + totalLate * 0.5) / totalStudents * 100).toFixed(2)
          : 0,
      };
    }

    return sendSuccess(
      res,
      report,
      'Attendance report generated successfully'
    );
  } catch (error) {
    logger.error('Error generating attendance report', { error: error.message, stack: error.stack });
    return next(error);
  }
};

// ============================================
// GET CLASS ATTENDANCE REPORT
// ============================================

/**
 * Get attendance report for a class
 * GET /api/attendance/reports/class/:classId
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const getClassAttendanceReport = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const { startDate, endDate, includeDetails = false } = req.query;

    logger.info('Generating class attendance report', {
      classId,
      startDate,
      endDate,
      includeDetails,
      requestedBy: req.user._id,
    });

    // Validate dates
    if (!startDate || !endDate) {
      return sendError(
        res,
        'Start date and end date are required',
        constants.ERROR_CODES.VALIDATION_ERROR,
        null,
        constants.HTTP_STATUS.BAD_REQUEST
      );
    }

    // Verify class exists and user has permission
    const classDoc = await Class.findById(classId);
    if (!classDoc) {
      return sendError(
        res,
        'Class not found',
        constants.ERROR_CODES.NOT_FOUND,
        null,
        constants.HTTP_STATUS.NOT_FOUND
      );
    }

    // Check permissions
    if (req.user.role === constants.ROLES.STUDENT) {
      return sendError(
        res,
        'Students cannot access class reports',
        constants.ERROR_CODES.FORBIDDEN,
        null,
        constants.HTTP_STATUS.FORBIDDEN
      );
    }

    if (req.user.role === constants.ROLES.TEACHER && classDoc.teacher.toString() !== req.user._id.toString()) {
      return sendError(
        res,
        'Teachers can only access reports for their own classes',
        constants.ERROR_CODES.FORBIDDEN,
        null,
        constants.HTTP_STATUS.FORBIDDEN
      );
    }

    // Generate report using model method
    const report = await Attendance.generateClassReport(classId, startDate, endDate, includeDetails);

    return sendSuccess(
      res,
      report,
      'Class attendance report generated successfully'
    );
  } catch (error) {
    logger.error('Error generating class attendance report', { error: error.message, stack: error.stack });
    return next(error);
  }
};

// ============================================
// GET STUDENT ATTENDANCE REPORT
// ============================================

/**
 * Get attendance report for a student
 * GET /api/attendance/reports/student/:studentId
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const getStudentAttendanceReport = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { startDate, endDate, classId } = req.query;

    logger.info('Generating student attendance report', {
      studentId,
      startDate,
      endDate,
      classId,
      requestedBy: req.user._id,
    });

    // Validate dates
    if (!startDate || !endDate) {
      return sendError(
        res,
        'Start date and end date are required',
        constants.ERROR_CODES.VALIDATION_ERROR,
        null,
        constants.HTTP_STATUS.BAD_REQUEST
      );
    }

    // Verify student exists
    const student = await User.findById(studentId);
    if (!student || student.role !== constants.ROLES.STUDENT) {
      return sendError(
        res,
        'Student not found',
        constants.ERROR_CODES.NOT_FOUND,
        null,
        constants.HTTP_STATUS.NOT_FOUND
      );
    }

    // Check permissions
    if (req.user.role === constants.ROLES.STUDENT && req.user._id.toString() !== studentId) {
      return sendError(
        res,
        'Students can only access their own reports',
        constants.ERROR_CODES.FORBIDDEN,
        null,
        constants.HTTP_STATUS.FORBIDDEN
      );
    }

    // If teacher, check if student is in their class
    if (req.user.role === constants.ROLES.TEACHER && classId) {
      const classDoc = await Class.findById(classId);
      if (!classDoc || classDoc.teacher.toString() !== req.user._id.toString()) {
        return sendError(
          res,
          'Teachers can only access reports for students in their classes',
          constants.ERROR_CODES.FORBIDDEN,
          null,
          constants.HTTP_STATUS.FORBIDDEN
        );
      }
    }

    // Generate report using model method
    const report = await Attendance.generateStudentReport(studentId, startDate, endDate, classId);

    return sendSuccess(
      res,
      report,
      'Student attendance report generated successfully'
    );
  } catch (error) {
    logger.error('Error generating student attendance report', { error: error.message, stack: error.stack });
    return next(error);
  }
};

// ============================================
// GET ATTENDANCE SUMMARY FOR DASHBOARD
// ============================================

/**
 * Get attendance summary for dashboard
 * GET /api/attendance/dashboard/summary
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const getAttendanceSummary = async (req, res, next) => {
  try {
    const { classId, date } = req.query;
    const summaryDate = date || new Date().toISOString().split('T')[0]; // Default to today

    logger.info('Getting attendance summary', {
      classId,
      date: summaryDate,
      requestedBy: req.user._id,
    });

    let summary;

    if (classId) {
      // Get summary for specific class
      const classDoc = await Class.findById(classId);
      if (!classDoc) {
        return sendError(
          res,
          'Class not found',
          constants.ERROR_CODES.NOT_FOUND,
          null,
          constants.HTTP_STATUS.NOT_FOUND
        );
      }

      // Check permissions
      if (req.user.role === constants.ROLES.STUDENT && !classDoc.students.includes(req.user._id)) {
        return sendError(
          res,
          'Student is not enrolled in this class',
          constants.ERROR_CODES.FORBIDDEN,
          null,
          constants.HTTP_STATUS.FORBIDDEN
        );
      }

      if (req.user.role === constants.ROLES.TEACHER && classDoc.teacher.toString() !== req.user._id.toString()) {
        return sendError(
          res,
          'Teachers can only access summaries for their own classes',
          constants.ERROR_CODES.FORBIDDEN,
          null,
          constants.HTTP_STATUS.FORBIDDEN
        );
      }

      summary = await Attendance.getClassSummary(classId, summaryDate);
    } else {
      // Get summary for all user's classes
      if (req.user.role === constants.ROLES.ADMIN) {
        summary = await Attendance.getAdminSummary(summaryDate);
      } else if (req.user.role === constants.ROLES.TEACHER) {
        summary = await Attendance.getTeacherSummary(req.user._id, summaryDate);
      } else if (req.user.role === constants.ROLES.STUDENT) {
        summary = await Attendance.getStudentSummary(req.user._id, summaryDate);
      }
    }

    return sendSuccess(
      res,
      summary,
      'Attendance summary retrieved successfully'
    );
  } catch (error) {
    logger.error('Error getting attendance summary', { error: error.message, stack: error.stack });
    return next(error);
  }
};

module.exports = {
  markAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendance,
  getStudentAttendance,
  getClassAttendance,
  generateAttendanceReport,
  getClassAttendanceReport,
  getStudentAttendanceReport,
  getAttendanceSummary,
};