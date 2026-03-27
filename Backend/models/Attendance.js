/**
 * Attendance Model
 * MongoDB schema for attendance tracking
 * Per SRS 2.3: System tracks student attendance with detailed reporting
 */

const mongoose = require('mongoose');
const constants = require('../config/constants');

// ============================================
// ATTENDANCE SCHEMA DEFINITION
// ============================================

const attendanceSchema = new mongoose.Schema(
  {
    // Class Information
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
      index: true,
    },

    className: {
      type: String,
      required: true,
      index: true,
    },

    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    teacherName: {
      type: String,
      required: true,
    },

    // Date Information
    date: {
      type: Date,
      required: true,
      index: true,
    },

    // Attendance Records
    attendance: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
          index: true,
        },

        studentName: {
          type: String,
          required: true,
        },

        status: {
          type: String,
          enum: ['present', 'absent', 'late'],
          required: true,
        },

        markedAt: {
          type: Date,
          default: Date.now,
        },

        // Optional notes
        notes: {
          type: String,
          maxlength: 200,
        },
      },
    ],

    // Metadata
    totalStudents: {
      type: Number,
      required: true,
      min: 0,
    },

    presentCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    absentCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    lateCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Soft delete
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    deletedAt: {
      type: Date,
    },

    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// ============================================
// INDEXES
// ============================================

// Compound index for efficient queries
attendanceSchema.index({ classId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ teacherId: 1, date: -1 });
attendanceSchema.index({ 'attendance.studentId': 1, date: -1 });

// ============================================
// STATIC METHODS
// ============================================

/**
 * Find attendance by class and date
 */
attendanceSchema.statics.findByClassAndDate = function (classId, date) {
  return this.findOne({
    classId,
    date: {
      $gte: new Date(date).setHours(0, 0, 0, 0),
      $lt: new Date(date).setHours(23, 59, 59, 999),
    },
    isDeleted: false,
  });
};

/**
 * Get attendance summary for a class
 */
attendanceSchema.statics.getClassAttendanceSummary = function (classId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        classId: new mongoose.Types.ObjectId(classId),
        date: { $gte: new Date(startDate), $lte: new Date(endDate) },
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        totalPresent: { $sum: '$presentCount' },
        totalAbsent: { $sum: '$absentCount' },
        totalLate: { $sum: '$lateCount' },
        totalStudents: { $first: '$totalStudents' },
      },
    },
  ]);
};

/**
 * Get student attendance records
 */
attendanceSchema.statics.getStudentAttendance = function (studentId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        date: { $gte: new Date(startDate), $lte: new Date(endDate) },
        isDeleted: false,
        'attendance.studentId': new mongoose.Types.ObjectId(studentId),
      },
    },
    {
      $unwind: '$attendance',
    },
    {
      $match: {
        'attendance.studentId': new mongoose.Types.ObjectId(studentId),
      },
    },
    {
      $project: {
        date: 1,
        classId: 1,
        className: 1,
        status: '$attendance.status',
        notes: '$attendance.notes',
        markedAt: '$attendance.markedAt',
      },
    },
    {
      $sort: { date: -1 },
    },
  ]);
};

// ============================================
// INSTANCE METHODS
// ============================================

/**
 * Calculate attendance counts
 */
attendanceSchema.methods.calculateCounts = function () {
  this.presentCount = this.attendance.filter(a => a.status === 'present').length;
  this.absentCount = this.attendance.filter(a => a.status === 'absent').length;
  this.lateCount = this.attendance.filter(a => a.status === 'late').length;
};

/**
 * Soft delete attendance record
 */
attendanceSchema.methods.softDelete = function (deletedBy) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  return this.save();
};

// ============================================
// PRE-SAVE MIDDLEWARE
// ============================================

attendanceSchema.pre('save', function (next) {
  // Calculate counts before saving
  this.calculateCounts();
  next();
});

// ============================================
// EXPORT MODEL
// ============================================

const Attendance = mongoose.model('Attendance', attendanceSchema);

// ============================================
// ADDITIONAL STATIC METHODS FOR REPORTING
// ============================================

/**
 * Generate comprehensive class attendance report
 * @param {string} classId - Class ID
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @param {boolean} includeDetails - Include individual records
 * @returns {Object} - Report data
 */
Attendance.generateClassReport = async function (classId, startDate, endDate, includeDetails = false) {
  const pipeline = [
    {
      $match: {
        classId: new mongoose.Types.ObjectId(classId),
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
        isDeleted: { $ne: true },
      },
    },
    {
      $unwind: '$attendance',
    },
    {
      $group: {
        _id: {
          date: '$date',
          status: '$attendance.status',
        },
        count: { $sum: 1 },
        records: includeDetails ? { $push: '$attendance' } : [],
      },
    },
    {
      $group: {
        _id: '$_id.date',
        present: {
          $sum: {
            $cond: [{ $eq: ['$_id.status', 'present'] }, '$count', 0],
          },
        },
        absent: {
          $sum: {
            $cond: [{ $eq: ['$_id.status', 'absent'] }, '$count', 0],
          },
        },
        late: {
          $sum: {
            $cond: [{ $eq: ['$_id.status', 'late'] }, '$count', 0],
          },
        },
        total: { $sum: '$count' },
        details: includeDetails ? { $first: '$records' } : [],
      },
    },
    {
      $sort: { '_id': 1 },
    },
  ];

  const results = await this.aggregate(pipeline);

  const totalSessions = results.length;
  const totalPresent = results.reduce((sum, day) => sum + day.present, 0);
  const totalAbsent = results.reduce((sum, day) => sum + day.absent, 0);
  const totalLate = results.reduce((sum, day) => sum + day.late, 0);
  const totalStudents = results.length > 0 ? results[0].total : 0;

  return {
    classId,
    period: { startDate, endDate },
    summary: {
      totalSessions,
      totalPresent,
      totalAbsent,
      totalLate,
      totalStudents,
      attendancePercentage: totalStudents > 0
        ? ((totalPresent + totalLate * 0.5) / (totalStudents * totalSessions) * 100).toFixed(2)
        : 0,
    },
    dailyBreakdown: includeDetails ? results : [],
  };
};

/**
 * Generate student attendance report
 * @param {string} studentId - Student ID
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @param {string} classId - Optional class filter
 * @returns {Object} - Report data
 */
Attendance.generateStudentReport = async function (studentId, startDate, endDate, classId = null) {
  const matchConditions = {
    'attendance.studentId': new mongoose.Types.ObjectId(studentId),
    date: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
    isDeleted: { $ne: true },
  };

  if (classId) {
    matchConditions.classId = new mongoose.Types.ObjectId(classId);
  }

  const pipeline = [
    {
      $match: matchConditions,
    },
    {
      $unwind: '$attendance',
    },
    {
      $match: {
        'attendance.studentId': new mongoose.Types.ObjectId(studentId),
      },
    },
    {
      $group: {
        _id: '$attendance.status',
        count: { $sum: 1 },
        records: {
          $push: {
            date: '$date',
            classId: '$classId',
            className: '$className',
            status: '$attendance.status',
            notes: '$attendance.notes',
          },
        },
      },
    },
  ];

  const results = await this.aggregate(pipeline);

  const present = results.find(r => r._id === 'present')?.count || 0;
  const absent = results.find(r => r._id === 'absent')?.count || 0;
  const late = results.find(r => r._id === 'late')?.count || 0;
  const total = present + absent + late;

  return {
    studentId,
    period: { startDate, endDate },
    classId,
    summary: {
      totalSessions: total,
      present,
      absent,
      late,
      attendancePercentage: total > 0 ? ((present + late * 0.5) / total * 100).toFixed(2) : 0,
    },
    records: results.flatMap(r => r.records).sort((a, b) => new Date(b.date) - new Date(a.date)),
  };
};

/**
 * Get class summary for a specific date
 * @param {string} classId - Class ID
 * @param {string} date - Date (YYYY-MM-DD)
 * @returns {Object} - Summary data
 */
Attendance.getClassSummary = async function (classId, date) {
  const attendance = await this.findOne({
    classId,
    date: new Date(date),
    isDeleted: { $ne: true },
  });

  if (!attendance) {
    return {
      classId,
      date,
      totalStudents: 0,
      present: 0,
      absent: 0,
      late: 0,
      attendancePercentage: 0,
    };
  }

  return {
    classId,
    date,
    totalStudents: attendance.attendance.length,
    present: attendance.presentCount,
    absent: attendance.absentCount,
    late: attendance.lateCount,
    attendancePercentage: attendance.attendance.length > 0
      ? ((attendance.presentCount + attendance.lateCount * 0.5) / attendance.attendance.length * 100).toFixed(2)
      : 0,
  };
};

/**
 * Get admin summary for all classes on a date
 * @param {string} date - Date (YYYY-MM-DD)
 * @returns {Object} - Summary data
 */
Attendance.getAdminSummary = async function (date) {
  const pipeline = [
    {
      $match: {
        date: new Date(date),
        isDeleted: { $ne: true },
      },
    },
    {
      $group: {
        _id: null,
        totalClasses: { $sum: 1 },
        totalStudents: { $sum: { $size: '$attendance' } },
        totalPresent: { $sum: '$presentCount' },
        totalAbsent: { $sum: '$absentCount' },
        totalLate: { $sum: '$lateCount' },
      },
    },
  ];

  const result = await this.aggregate(pipeline);
  const summary = result[0] || {
    totalClasses: 0,
    totalStudents: 0,
    totalPresent: 0,
    totalAbsent: 0,
    totalLate: 0,
  };

  return {
    date,
    totalClasses: summary.totalClasses,
    totalStudents: summary.totalStudents,
    present: summary.totalPresent,
    absent: summary.totalAbsent,
    late: summary.totalLate,
    attendancePercentage: summary.totalStudents > 0
      ? ((summary.totalPresent + summary.totalLate * 0.5) / summary.totalStudents * 100).toFixed(2)
      : 0,
  };
};

/**
 * Get teacher summary for their classes on a date
 * @param {string} teacherId - Teacher ID
 * @param {string} date - Date (YYYY-MM-DD)
 * @returns {Object} - Summary data
 */
Attendance.getTeacherSummary = async function (teacherId, date) {
  const pipeline = [
    {
      $match: {
        teacherId: new mongoose.Types.ObjectId(teacherId),
        date: new Date(date),
        isDeleted: { $ne: true },
      },
    },
    {
      $group: {
        _id: null,
        totalClasses: { $sum: 1 },
        totalStudents: { $sum: { $size: '$attendance' } },
        totalPresent: { $sum: '$presentCount' },
        totalAbsent: { $sum: '$absentCount' },
        totalLate: { $sum: '$lateCount' },
      },
    },
  ];

  const result = await this.aggregate(pipeline);
  const summary = result[0] || {
    totalClasses: 0,
    totalStudents: 0,
    totalPresent: 0,
    totalAbsent: 0,
    totalLate: 0,
  };

  return {
    date,
    teacherId,
    totalClasses: summary.totalClasses,
    totalStudents: summary.totalStudents,
    present: summary.totalPresent,
    absent: summary.totalAbsent,
    late: summary.totalLate,
    attendancePercentage: summary.totalStudents > 0
      ? ((summary.totalPresent + summary.totalLate * 0.5) / summary.totalStudents * 100).toFixed(2)
      : 0,
  };
};

/**
 * Get student summary for their classes on a date
 * @param {string} studentId - Student ID
 * @param {string} date - Date (YYYY-MM-DD)
 * @returns {Object} - Summary data
 */
Attendance.getStudentSummary = async function (studentId, date) {
  const attendance = await this.findOne({
    date: new Date(date),
    'attendance.studentId': new mongoose.Types.ObjectId(studentId),
    isDeleted: { $ne: true },
  });

  if (!attendance) {
    return {
      studentId,
      date,
      classesAttended: 0,
      status: null,
    };
  }

  const studentRecord = attendance.attendance.find(
    a => a.studentId.toString() === studentId
  );

  return {
    studentId,
    date,
    classId: attendance.classId,
    className: attendance.className,
    status: studentRecord ? studentRecord.status : null,
    notes: studentRecord ? studentRecord.notes : null,
  };
};

module.exports = Attendance;