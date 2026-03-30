/**
 * Analytics Controller
 * Handles all analytics and reporting endpoints
 * Per SRS 4.4: Reach Analytics - real-time monitoring and analytics
 */

const analyticsService = require('../services/analyticsService');
const { sendSuccess, sendError } = require('../utils/responses');
const logger = require('../utils/logger');

// ============================================
// 8.1 VIDEO VIEWERSHIP ANALYTICS
// ============================================

/**
 * GET /api/analytics/videos
 * Get most watched videos with detailed analytics
 * Access: Admin, Teacher
 */
const getVideoAnalytics = async (req, res) => {
  try {
    const { classId, subject, limit = 10, skip = 0 } = req.query;

    // Parse limit and skip to integers
    const parsedLimit = Math.min(parseInt(limit) || 10, 100);
    const parsedSkip = parseInt(skip) || 0;

    // All logged-in users can view (Admin/Teacher prioritized)
    // Admin: can see all videos
    // Teacher: can see their class videos (enforced by service filter in future)
    // Student: can see their enrolled class videos

    const videos = await analyticsService.getMostWatchedVideos({
      classId,
      subject,
      limit: parsedLimit,
      skip: parsedSkip,
    });

    logger.info('Fetched video analytics', {
      context: 'analyticsController::getVideoAnalytics',
      count: videos.length,
      userId: req.user._id,
      role: req.user.role,
    });

    sendSuccess(res, videos, 'Most watched videos retrieved successfully', 200);
  } catch (error) {
    logger.error('Error fetching video analytics', {
      context: 'analyticsController::getVideoAnalytics',
      userId: req.user._id,
      error: error.message,
    });

    sendError(res, 'Failed to fetch video analytics', 'INTERNAL_ERROR', [], 500);
  }
};

/**
 * GET /api/analytics/videos/:videoId
 * Get detailed analytics for specific video
 * Access: Admin, Creator Teacher
 */
const getVideoDetailAnalytics = async (req, res) => {
  try {
    const { videoId } = req.params;

    // Validation
    if (!videoId) {
      return sendError(res, 'Video ID is required', 'VALIDATION_ERROR', [], 400);
    }

    const analytics = await analyticsService.getVideoDetailAnalytics(videoId);

    logger.info('Fetched detailed video analytics', {
      context: 'analyticsController::getVideoDetailAnalytics',
      videoId,
      userId: req.user._id,
    });

    sendSuccess(res, analytics, 'Video analytics retrieved successfully', 200);
  } catch (error) {
    if (error.message === 'Video not found') {
      return sendError(res, 'Video not found', 'NOT_FOUND', [], 404);
    }

    logger.error('Error fetching detailed video analytics', {
      context: 'analyticsController::getVideoDetailAnalytics',
      videoId: req.params.videoId,
      userId: req.user._id,
      error: error.message,
    });

    sendError(res, 'Failed to fetch video analytics', 'INTERNAL_ERROR', [], 500);
  }
};

// ============================================
// 8.2 VIEWERSHIP TRENDS
// ============================================

/**
 * GET /api/analytics/viewership-trends
 * Get viewership trends over time
 * Query params: granularity (day|week|month), days (7, 30, 90)
 * Access: Admin, Teacher
 */
const getViewershipTrends = async (req, res) => {
  try {
    const { granularity = 'day', days = 30 } = req.query;

    // Validate granularity
    if (!['day', 'week', 'month'].includes(granularity)) {
      return sendError(res, 'Invalid granularity. Must be day, week, or month', 'VALIDATION_ERROR', [], 400);
    }

    // Validate days
    const parsedDays = Math.min(Math.max(parseInt(days) || 30, 1), 90);

    const trends = await analyticsService.getViewershipTrends({
      granularity,
      days: parsedDays,
    });

    logger.info('Fetched viewership trends', {
      context: 'analyticsController::getViewershipTrends',
      granularity,
      days: parsedDays,
      dataPoints: trends.length,
      userId: req.user._id,
    });

    sendSuccess(res, trends, 'Viewership trends retrieved successfully', 200);
  } catch (error) {
    logger.error('Error fetching viewership trends', {
      context: 'analyticsController::getViewershipTrends',
      userId: req.user._id,
      error: error.message,
    });

    sendError(res, 'Failed to fetch viewership trends', 'INTERNAL_ERROR', [], 500);
  }
};

/**
 * GET /api/analytics/peak-watch-times
 * Get peak hours for video watching
 * Access: Admin, Teacher
 */
const getPeakWatchTimes = async (req, res) => {
  try {
    const peakData = await analyticsService.getPeakWatchTimes();

    logger.info('Fetched peak watch times', {
      context: 'analyticsController::getPeakWatchTimes',
      userId: req.user._id,
    });

    sendSuccess(res, peakData, 'Peak watch times retrieved successfully', 200);
  } catch (error) {
    logger.error('Error fetching peak watch times', {
      context: 'analyticsController::getPeakWatchTimes',
      userId: req.user._id,
      error: error.message,
    });

    sendError(res, 'Failed to fetch peak watch times', 'INTERNAL_ERROR', [], 500);
  }
};

// ============================================
// 8.3 STUDENT ENGAGEMENT ANALYTICS
// ============================================

/**
 * GET /api/analytics/engagement
 * Get overall student engagement metrics
 * Access: Admin, Teacher
 */
const getEngagementMetrics = async (req, res) => {
  try {
    const engagementData = await analyticsService.getEngagementMetrics();

    logger.info('Fetched engagement metrics', {
      context: 'analyticsController::getEngagementMetrics',
      userId: req.user._id,
      role: req.user.role,
    });

    sendSuccess(res, engagementData, 'Engagement metrics retrieved successfully', 200);
  } catch (error) {
    logger.error('Error fetching engagement metrics', {
      context: 'analyticsController::getEngagementMetrics',
      userId: req.user._id,
      error: error.message,
    });

    sendError(res, 'Failed to fetch engagement metrics', 'INTERNAL_ERROR', [], 500);
  }
};

// ============================================
// 8.4 ATTENDANCE ANALYTICS
// ============================================

/**
 * GET /api/analytics/attendance
 * Get attendance statistics and patterns
 * Query params: classId, days (7, 30, 90)
 * Access: Admin, Teacher
 */
const getAttendanceAnalytics = async (req, res) => {
  try {
    const { classId, days = 30 } = req.query;

    // Validate days
    const parsedDays = Math.min(Math.max(parseInt(days) || 30, 1), 365);

    const attendanceData = await analyticsService.getAttendanceAnalytics({
      classId,
      days: parsedDays,
    });

    logger.info('Fetched attendance analytics', {
      context: 'analyticsController::getAttendanceAnalytics',
      classId,
      days: parsedDays,
      userId: req.user._id,
    });

    sendSuccess(res, attendanceData, 'Attendance analytics retrieved successfully', 200);
  } catch (error) {
    logger.error('Error fetching attendance analytics', {
      context: 'analyticsController::getAttendanceAnalytics',
      userId: req.user._id,
      error: error.message,
    });

    sendError(res, 'Failed to fetch attendance analytics', 'INTERNAL_ERROR', [], 500);
  }
};

// ============================================
// 8.5 FINANCIAL ANALYTICS
// ============================================

/**
 * GET /api/analytics/revenue
 * Get revenue/financial analytics
 * Access: Admin only
 * Note: Awaiting Payment model from Phase 7
 */
const getRevenueAnalytics = async (req, res) => {
  try {
    // Admin only
    if (req.user.role !== 'admin') {
      return sendError(res, 'Only admins can view revenue analytics', 'FORBIDDEN', [], 403);
    }

    const revenueData = await analyticsService.getRevenueAnalytics();

    logger.info('Fetched revenue analytics', {
      context: 'analyticsController::getRevenueAnalytics',
      userId: req.user._id,
    });

    sendSuccess(res, revenueData, 'Revenue analytics retrieved successfully', 200);
  } catch (error) {
    logger.error('Error fetching revenue analytics', {
      context: 'analyticsController::getRevenueAnalytics',
      userId: req.user._id,
      error: error.message,
    });

    sendError(res, 'Failed to fetch revenue analytics', 'INTERNAL_ERROR', [], 500);
  }
};

// ============================================
// 8.7 REPORT GENERATION
// ============================================

/**
 * GET /api/analytics/reports/:type
 * Generate comprehensive analytics reports
 * Query params: period (last30days, last90days, custom), format (json, pdf)
 * Supported types: video, engagement, attendance, comprehensive
 * Access: Admin, Teacher
 */
const generateReport = async (req, res) => {
  try {
    const { type } = req.params;
    const { period = 'last30days', format = 'json', days = 30 } = req.query;

    // Validate report type
    const validTypes = ['video', 'engagement', 'attendance', 'comprehensive'];
    if (!validTypes.includes(type)) {
      return res
        .status(400)
        .json(
          errorResponse(
            `Invalid report type. Must be one of: ${validTypes.join(', ')}`,
            'VALIDATION_ERROR'
          )
        );
    }

    // Validate format (currently only JSON)
    if (!['json', 'pdf'].includes(format)) {
      return res
        .status(400)
        .json(
          errorResponse(
            'Invalid format. Currently supports json (pdf coming soon)',
            'VALIDATION_ERROR'
          )
        );
    }

    // Generate report
    const report = await analyticsService.generateAnalyticsReport(type, {
      period,
      userId: req.user._id,
      days: Math.min(Math.max(parseInt(days) || 30, 1), 90),
    });

    // Add metadata
    const reportWithMetadata = {
      ...report,
      requestedBy: {
        userId: req.user._id,
        role: req.user.role,
      },
      format,
      downloadUrl: `${req.baseUrl}?download=true&format=${format}`,
    };

    logger.info('Generated analytics report', {
      context: 'analyticsController::generateReport',
      reportType: type,
      period,
      userId: req.user._id,
      role: req.user.role,
    });

    // If PDF format requested, would generate here (not implemented in Phase 8)
    if (format === 'pdf') {
      return sendSuccess(res, { ...reportWithMetadata, status: 'PDF generation coming in Phase 8.2' }, 'Report generated successfully (JSON format)', 200);
    }

    sendSuccess(res, reportWithMetadata, 'Report generated successfully', 200);
  } catch (error) {
    logger.error('Error generating report', {
      context: 'analyticsController::generateReport',
      reportType: req.params.type,
      userId: req.user._id,
      error: error.message,
    });

    sendError(res, 'Failed to generate report', 'INTERNAL_ERROR', [], 500);
  }
};

/**
 * GET /api/analytics/reports
 * List available report types and descriptions
 * Access: All authenticated users
 */
const listReportTypes = async (req, res) => {
  try {
    const reportTypes = [
      {
        id: 'video',
        name: 'Video Viewership Report',
        description: 'Most watched videos with detailed analytics',
        fields: [
          'title',
          'subject',
          'views',
          'completionRate',
          'totalViewers',
          'averageWatchPercentage',
        ],
        access: 'All Users',
      },
      {
        id: 'engagement',
        name: 'Student Engagement Report',
        description: 'Overall engagement metrics and top engaged students',
        fields: [
          'totalActiveStudents',
          'engagementByClass',
          'topEngagedStudents',
        ],
        access: 'Admin, Teacher',
      },
      {
        id: 'attendance',
        name: 'Attendance Analytics Report',
        description: 'Attendance statistics, patterns, and chronic absentees',
        fields: [
          'overallStats',
          'byClass',
          'chronicAbsentees',
          'attendancePercentage',
        ],
        access: 'Admin, Teacher',
      },
      {
        id: 'comprehensive',
        name: 'Comprehensive System Report',
        description:
          'Complete system analytics including video, engagement, attendance, and trends',
        fields: [
          'videoAnalytics',
          'engagementMetrics',
          'attendanceData',
          'viewershipTrends',
        ],
        access: 'Admin only',
      },
    ];

    logger.info('Listed report types', {
      context: 'analyticsController::listReportTypes',
      userId: req.user._id,
    });

    sendSuccess(res, reportTypes, 'Available report types retrieved successfully', 200);
  } catch (error) {
    logger.error('Error listing report types', {
      context: 'analyticsController::listReportTypes',
      error: error.message,
    });

    sendError(res, 'Failed to list report types', 'INTERNAL_ERROR', [], 500);
  }
};

// ============================================
// EXPORT CONTROLLERS
// ============================================

module.exports = {
  // 8.1 Video Viewership
  getVideoAnalytics,
  getVideoDetailAnalytics,

  // 8.2 Viewership Trends
  getViewershipTrends,
  getPeakWatchTimes,

  // 8.3 Student Engagement
  getEngagementMetrics,

  // 8.4 Attendance Analytics
  getAttendanceAnalytics,

  // 8.5 Financial Analytics
  getRevenueAnalytics,

  // 8.7 Report Generation
  generateReport,
  listReportTypes,
};
