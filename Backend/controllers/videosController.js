/**
 * Videos Controller
 * Handles video upload, retrieval, streaming, and progress tracking
 * Phase 5: Video Content Management
 */

const Video = require('../models/Video');
const VideoWatchProgress = require('../models/VideoWatchProgress');
const Class = require('../models/Class');
const User = require('../models/User');
const videoService = require('../services/videoService');
const logger = require('../utils/logger');
const { sendSuccess, sendError } = require('../utils/responses');
const { validateVideoUpload, validateVideoUpdate, extractValidationErrors } = require('../utils/validators');
const constants = require('../config/constants');
const multer = require('multer');

// ============================================
// MULTER CONFIGURATION (In-Memory Upload)
// ============================================

const storage = multer.memoryStorage();
const videoUpload = multer({
  storage,
  limits: {
    fileSize: constants.FILE_SIZES.MAX_VIDEO_SIZE_MB * 1024 * 1024,
  },
});

// ============================================
// VIDEO UPLOAD
// ============================================

/**
 * Upload video to Azure Blob Storage
 * POST /api/videos/upload
 * Only teachers can upload videos
 * @param {Object} req - Express request with file and metadata
 * @param {Object} res - Express response
 */
const uploadVideo = async (req, res, next) => {
  try {
    logger.info('Starting video upload', {
      uploadedBy: req.user._id,
      fileName: req.file?.originalname,
    });

    // Check if file was provided
    if (!req.file) {
      return sendError(
        res,
        'No video file provided',
        constants.ERROR_CODES.VALIDATION_ERROR,
        null,
        constants.HTTP_STATUS.BAD_REQUEST
      );
    }

    // Validate input
    const { error, value } = validateVideoUpload(req.body);
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

    const { title, description, subject, classId, duration } = value;

    // Validate video file
    const fileValidation = videoService.validateVideoFile(
      req.file.buffer,
      req.file.mimetype,
      req.file.originalname
    );

    if (!fileValidation.valid) {
      return sendError(
        res,
        fileValidation.error,
        constants.ERROR_CODES.VALIDATION_ERROR,
        null,
        constants.HTTP_STATUS.BAD_REQUEST
      );
    }

    // Verify class exists and teacher has access
    const classData = await Class.findById(classId);
    if (!classData) {
      logger.warn('Class not found for video upload', { classId });
      return sendError(
        res,
        'Class not found',
        constants.ERROR_CODES.NOT_FOUND,
        null,
        constants.HTTP_STATUS.NOT_FOUND
      );
    }

    // Only teacher of the class or admin can upload videos
    const isAuthorized =
      req.user.role === constants.ROLES.ADMIN ||
      classData.teacher.toString() === req.user._id.toString();

    if (!isAuthorized) {
      logger.warn('User not authorized to upload video', {
        userId: req.user._id,
        classId,
      });
      return sendError(
        res,
        'Unauthorized: Cannot upload videos for this class',
        constants.ERROR_CODES.FORBIDDEN,
        null,
        constants.HTTP_STATUS.FORBIDDEN
      );
    }

    // Upload to Azure
    const azureResult = await videoService.uploadVideoToAzure(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    // Get teacher info
    const teacher = await User.findById(req.user._id).select('name email');

    // Create video record
    const video = new Video({
      title,
      description: description || '',
      subject,
      uploadedBy: req.user._id,
      teacherName: teacher.name,
      classId,
      className: classData.name,
      blobName: azureResult.blobName,
      blobUrl: azureResult.blobUrl,
      blobContainer: azureResult.container,
      fileSize: azureResult.fileSize,
      duration: parseInt(duration) || null,
      mimeType: req.file.mimetype,
      isPublished: true,
    });

    await video.save();

    logger.info('Video uploaded successfully', {
      videoId: video._id,
      blobName: azureResult.blobName,
      uploadedBy: req.user._id,
    });

    return sendSuccess(
      res,
      {
        id: video._id,
        title: video.title,
        subject: video.subject,
        class: video.className,
        uploadedBy: video.teacherName,
        fileSize: video.fileSize,
        duration: video.duration,
        createdAt: video.createdAt,
      },
      'Video uploaded successfully',
      constants.HTTP_STATUS.CREATED
    );
  } catch (error) {
    logger.error('Error uploading video', { error: error.message });
    next(error);
  }
};

// ============================================
// VIDEO RETRIEVAL
// ============================================

/**
 * Get all videos with filters and pagination
 * GET /api/videos?classId=xxx&subject=Math&page=1&limit=10
 * @param {Object} req - Express request with query parameters
 * @param {Object} res - Express response
 */
const getVideos = async (req, res, next) => {
  try {
    logger.info('Fetching videos', { requestedBy: req.user._id, query: req.query });

    // Extract query parameters
    const page = parseInt(req.query.page) || constants.PAGINATION_DEFAULTS.PAGE;
    const limit = Math.min(
      parseInt(req.query.limit) || constants.PAGINATION_DEFAULTS.LIMIT,
      constants.PAGINATION_DEFAULTS.MAX_LIMIT
    );
    const classId = req.query.classId;
    const subject = req.query.subject;
    const teacherId = req.query.teacherId;

    // Build filter based on role
    const filter = {
      isPublished: true,
      isActive: true,
      deletedAt: null,
    };

    // Students can only see videos from their enrolled classes
    if (req.user.role === constants.ROLES.STUDENT) {
      const studentClasses = await Class.find({
        students: req.user._id,
        isActive: true,
        deletedAt: null,
      }).select('_id');

      const classIds = studentClasses.map((c) => c._id);
      filter.classId = { $in: classIds };
    }

    // Teachers can see their own videos (unless admin)
    if (req.user.role === constants.ROLES.TEACHER) {
      filter.uploadedBy = req.user._id;
    }

    // Add optional filters
    if (classId) {
      filter.classId = classId;
    }

    if (subject) {
      filter.subject = new RegExp(subject, 'i');
    }

    if (teacherId && req.user.role === constants.ROLES.ADMIN) {
      filter.uploadedBy = teacherId;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const videos = await Video.find(filter)
      .select('title subject className duration views uploadedBy teacherName createdAt')
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count
    const total = await Video.countDocuments(filter);

    logger.info('Videos retrieved successfully', {
      page,
      limit,
      total,
      count: videos.length,
    });

    return sendSuccess(res, {
      videos: videos.map((video) => ({
        id: video._id,
        title: video.title,
        subject: video.subject,
        class: video.className,
        duration: video.duration,
        views: video.views,
        uploadedBy: video.teacherName,
        createdAt: video.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }, 'Videos retrieved successfully');
  } catch (error) {
    logger.error('Error fetching videos', { error: error.message });
    next(error);
  }
};

/**
 * Get video by ID with SAS URL
 * GET /api/videos/:id
 * @param {Object} req - Express request with videoId in params
 * @param {Object} res - Express response
 */
const getVideoById = async (req, res, next) => {
  try {
    const { id } = req.params;
    logger.info('Fetching video by ID', { videoId: id, requestedBy: req.user._id });

    const video = await Video.findById(id)
      .populate('uploadedBy', 'name email')
      .populate('classId', 'name subject');

    if (!video || !video.isActive) {
      logger.warn('Video not found or inactive', { videoId: id });
      return sendError(
        res,
        'Video not found',
        constants.ERROR_CODES.NOT_FOUND,
        null,
        constants.HTTP_STATUS.NOT_FOUND
      );
    }

    // Check access permissions
    let hasAccess = req.user.role === constants.ROLES.ADMIN || 
                    video.uploadedBy._id.toString() === req.user._id.toString();

    if (!hasAccess && req.user.role === constants.ROLES.STUDENT) {
      // Check if student is enrolled in the class
      const enrollment = await Class.findOne({
        _id: video.classId._id,
        students: req.user._id,
      });
      hasAccess = !!enrollment;
    }

    if (!hasAccess) {
      logger.warn('User does not have access to video', { videoId: id, userId: req.user._id });
      return sendError(
        res,
        'Unauthorized: Cannot access this video',
        constants.ERROR_CODES.FORBIDDEN,
        null,
        constants.HTTP_STATUS.FORBIDDEN
      );
    }

    // Generate SAS URL for streaming
    const sasUrl = await videoService.generateSASUrl(video.blobName);

    // Record view
    await video.recordView(req.user._id);

    logger.info('Video retrieved successfully', { videoId: id });

    return sendSuccess(res, {
      id: video._id,
      title: video.title,
      description: video.description,
      subject: video.subject,
      class: {
        id: video.classId._id,
        name: video.classId.name,
      },
      uploadedBy: {
        id: video.uploadedBy._id,
        name: video.uploadedBy.name,
      },
      duration: video.duration,
      fileSize: video.fileSize,
      views: video.views,
      completionRate: video.completionRate,
      streamingUrl: sasUrl,
      createdAt: video.createdAt,
      updatedAt: video.updatedAt,
    }, 'Video retrieved successfully');
  } catch (error) {
    logger.error('Error fetching video by ID', { error: error.message });
    next(error);
  }
};

// ============================================
// VIDEO UPDATE
// ============================================

/**
 * Update video metadata
 * PUT /api/videos/:id
 * Only video creator or admin can update
 * @param {Object} req - Express request with update data
 * @param {Object} res - Express response
 */
const updateVideo = async (req, res, next) => {
  try {
    const { id } = req.params;
    logger.info('Updating video', { videoId: id, updatedBy: req.user._id });

    const video = await Video.findById(id);

    if (!video || !video.isActive) {
      logger.warn('Video not found for update', { videoId: id });
      return sendError(
        res,
        'Video not found',
        constants.ERROR_CODES.NOT_FOUND,
        null,
        constants.HTTP_STATUS.NOT_FOUND
      );
    }

    // Check authorization
    const isAuthorized =
      req.user.role === constants.ROLES.ADMIN ||
      video.uploadedBy.toString() === req.user._id.toString();

    if (!isAuthorized) {
      logger.warn('User not authorized to update video', { videoId: id, userId: req.user._id });
      return sendError(
        res,
        'Unauthorized: Cannot update this video',
        constants.ERROR_CODES.FORBIDDEN,
        null,
        constants.HTTP_STATUS.FORBIDDEN
      );
    }

    // Validate input
    const { error, value } = validateVideoUpdate(req.body);
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

    // Update fields
    if (value.title) video.title = value.title;
    if (value.description) video.description = value.description;
    if (value.subject) video.subject = value.subject;
    if (value.duration) video.duration = parseInt(value.duration);
    if (typeof value.isPublished === 'boolean') video.isPublished = value.isPublished;

    video.updatedAt = new Date();

    await video.save();

    logger.info('Video updated successfully', { videoId: id });

    return sendSuccess(res, {
      id: video._id,
      title: video.title,
      description: video.description,
      subject: video.subject,
      duration: video.duration,
      isPublished: video.isPublished,
      updatedAt: video.updatedAt,
    }, 'Video updated successfully');
  } catch (error) {
    logger.error('Error updating video', { error: error.message });
    next(error);
  }
};

// ============================================
// VIDEO DELETION
// ============================================

/**
 * Delete (archive) video
 * DELETE /api/videos/:id
 * Only video creator or admin can delete
 * @param {Object} req - Express request with videoId in params
 * @param {Object} res - Express response
 */
const deleteVideo = async (req, res, next) => {
  try {
    const { id } = req.params;
    logger.info('Deleting video', { videoId: id, deletedBy: req.user._id });

    const video = await Video.findById(id);

    if (!video || !video.isActive) {
      logger.warn('Video not found for deletion', { videoId: id });
      return sendError(
        res,
        'Video not found',
        constants.ERROR_CODES.NOT_FOUND,
        null,
        constants.HTTP_STATUS.NOT_FOUND
      );
    }

    // Check authorization
    const isAuthorized =
      req.user.role === constants.ROLES.ADMIN ||
      video.uploadedBy.toString() === req.user._id.toString();

    if (!isAuthorized) {
      logger.warn('User not authorized to delete video', { videoId: id, userId: req.user._id });
      return sendError(
        res,
        'Unauthorized: Cannot delete this video',
        constants.ERROR_CODES.FORBIDDEN,
        null,
        constants.HTTP_STATUS.FORBIDDEN
      );
    }

    // Soft delete from DB
    await video.softDelete();

    // Delete from Azure (async, don't wait)
    videoService.deleteVideoBlob(video.blobName).catch((error) => {
      logger.error('Error deleting blob from Azure', { error: error.message, blobName: video.blobName });
    });

    logger.info('Video deleted successfully', { videoId: id });

    return sendSuccess(res, {
      id: video._id,
      message: 'Video has been archived',
    }, 'Video deleted successfully');
  } catch (error) {
    logger.error('Error deleting video', { error: error.message });
    next(error);
  }
};

// ============================================
// WATCH PROGRESS TRACKING
// ============================================

/**
 * Log watch progress
 * POST /api/videos/:id/progress
 * Students can log their watch progress
 * @param {Object} req - Express request with watchedDuration in body
 * @param {Object} res - Express response
 */
const logWatchProgress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { watchedDuration, totalDuration } = req.body;

    logger.info('Logging watch progress', {
      videoId: id,
      studentId: req.user._id,
      watchedDuration,
    });

    // Validate input
    if (typeof watchedDuration !== 'number' || watchedDuration < 0) {
      return sendError(
        res,
        'Invalid watched duration',
        constants.ERROR_CODES.VALIDATION_ERROR,
        null,
        constants.HTTP_STATUS.BAD_REQUEST
      );
    }

    // Verify video exists
    const video = await Video.findById(id);
    if (!video || !video.isActive) {
      logger.warn('Video not found for progress tracking', { videoId: id });
      return sendError(
        res,
        'Video not found',
        constants.ERROR_CODES.NOT_FOUND,
        null,
        constants.HTTP_STATUS.NOT_FOUND
      );
    }

    // Get or create watch progress record
    const progress = await VideoWatchProgress.findOrCreate(
      id,
      req.user._id,
      video.classId,
      totalDuration || video.duration
    );

    // Update progress
    await progress.updateProgress(watchedDuration, totalDuration || video.duration);

    logger.info('Watch progress recorded', {
      videoId: id,
      studentId: req.user._id,
      completionPercentage: progress.completionPercentage,
    });

    return sendSuccess(res, {
      videoId: id,
      watchedDuration: progress.watchedDuration,
      totalDuration: progress.totalDuration,
      completionPercentage: progress.completionPercentage,
      isCompleted: progress.isCompleted,
    }, 'Watch progress recorded');
  } catch (error) {
    logger.error('Error logging watch progress', { error: error.message });
    next(error);
  }
};

/**
 * Get watch progress
 * GET /api/videos/:id/progress
 * Get student's watch progress for a video
 * @param {Object} req - Express request with videoId in params
 * @param {Object} res - Express response
 */
const getWatchProgress = async (req, res, next) => {
  try {
    const { id } = req.params;
    logger.info('Fetching watch progress', { videoId: id, studentId: req.user._id });

    // Verify video exists
    const video = await Video.findById(id);
    if (!video || !video.isActive) {
      logger.warn('Video not found', { videoId: id });
      return sendError(
        res,
        'Video not found',
        constants.ERROR_CODES.NOT_FOUND,
        null,
        constants.HTTP_STATUS.NOT_FOUND
      );
    }

    // Get progress
    const progress = await VideoWatchProgress.getStudentProgress(id, req.user._id);

    if (!progress) {
      // Return default (no progress yet)
      return sendSuccess(res, 'No watch progress yet', {
        videoId: id,
        watchedDuration: 0,
        totalDuration: video.duration,
        completionPercentage: 0,
        isCompleted: false,
        lastWatchedPosition: 0,
      });
    }

    logger.info('Watch progress retrieved', {
      videoId: id,
      completionPercentage: progress.completionPercentage,
    });

    return sendSuccess(res, progress.getFormattedProgress(), 'Watch progress retrieved');
  } catch (error) {
    logger.error('Error fetching watch progress', { error: error.message });
    next(error);
  }
};

// ============================================
// ANALYTICS
// ============================================

/**
 * Get video analytics
 * GET /api/videos/:id/analytics
 * Only admin or video creator can view analytics
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const getVideoAnalytics = async (req, res, next) => {
  try {
    const { id } = req.params;
    logger.info('Fetching video analytics', { videoId: id, requestedBy: req.user._id });

    const video = await Video.findById(id);

    if (!video) {
      logger.warn('Video not found', { videoId: id });
      return sendError(
        res,
        'Video not found',
        constants.ERROR_CODES.NOT_FOUND,
        null,
        constants.HTTP_STATUS.NOT_FOUND
      );
    }

    // Check authorization
    const isAuthorized =
      req.user.role === constants.ROLES.ADMIN ||
      video.uploadedBy.toString() === req.user._id.toString();

    if (!isAuthorized) {
      logger.warn('User not authorized to view analytics', { videoId: id });
      return sendError(
        res,
        'Unauthorized',
        constants.ERROR_CODES.FORBIDDEN,
        null,
        constants.HTTP_STATUS.FORBIDDEN
      );
    }

    // Get statistics
    const stats = await VideoWatchProgress.getVideoStats(video._id);

    logger.info('Video analytics retrieved', { videoId: id, stats });

    return sendSuccess(res, {
      videoId: id,
      title: video.title,
      totalViews: video.views,
      uniqueViewers: video.uniqueViewers.length,
      viewerCount: stats.totalViewers,
      completedCount: stats.completedCount,
      completionRate: stats.averageCompletion || 0,
      averageWatchedDuration: Math.round(stats.averageWatchedDuration || 0),
    }, 'Video analytics retrieved');
  } catch (error) {
    logger.error('Error fetching video analytics', { error: error.message });
    next(error);
  }
};

module.exports = {
  videoUpload,
  uploadVideo,
  getVideos,
  getVideoById,
  updateVideo,
  deleteVideo,
  logWatchProgress,
  getWatchProgress,
  getVideoAnalytics,
};
