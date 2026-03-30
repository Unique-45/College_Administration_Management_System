/**
 * Video Watch Progress Model
 * MongoDB schema for tracking student video watch progress
 * Per SRS 4.3: Subject-Wise Video Streaming (Student)
 */

const mongoose = require('mongoose');

// ============================================
// VIDEO WATCH PROGRESS SCHEMA
// ============================================

const videoWatchProgressSchema = new mongoose.Schema(
  {
    // Video and Student Reference
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video',
      required: true,
      index: true,
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
      index: true,
    },

    // Watch Progress
    watchedDuration: {
      type: Number, // Seconds watched
      default: 0,
    },

    totalDuration: {
      type: Number, // Total video duration in seconds
      optional: true,
    },

    completionPercentage: {
      type: Number, // 0-100 percentage
      default: 0,
    },

    lastWatchedAt: {
      type: Date,
      default: null,
    },

    lastWatchedPosition: {
      type: Number, // Last position watched in seconds (for resume)
      default: 0,
    },

    // Watch Status
    isCompleted: {
      type: Boolean,
      default: false,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    // Multiple Views Tracking
    numberOfViews: {
      type: Number,
      default: 1,
    },

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: 'video_watch_events',
  }
);

// ============================================
// UNIQUE COMPOUND INDEX
// ============================================

// Only one record per student per video
videoWatchProgressSchema.index(
  { videoId: 1, studentId: 1 },
  { unique: true }
);

// Indexes for queries
videoWatchProgressSchema.index({ studentId: 1, classId: 1 });
videoWatchProgressSchema.index({ videoId: 1, isCompleted: 1 });
videoWatchProgressSchema.index({ lastWatchedAt: -1 });

// ============================================
// STATIC METHODS
// ============================================

/**
 * Find or create watch progress record
 * @param {string} videoId - Video ID
 * @param {string} studentId - Student ID
 * @param {string} classId - Class ID
 * @returns {Promise<Object>}
 */
videoWatchProgressSchema.statics.findOrCreate = async function (
  videoId,
  studentId,
  classId,
  totalDuration = null
) {
  let progress = await this.findOne({
    videoId,
    studentId,
  });

  if (!progress) {
    progress = new this({
      videoId,
      studentId,
      classId,
      totalDuration,
    });
    await progress.save();
  }

  return progress;
};

/**
 * Get student's watch progress for a video
 * @param {string} videoId - Video ID
 * @param {string} studentId - Student ID
 * @returns {Promise<Object>}
 */
videoWatchProgressSchema.statics.getStudentProgress = function (videoId, studentId) {
  return this.findOne({
    videoId,
    studentId,
  });
};

/**
 * Get all videos watched by a student in a class
 * @param {string} studentId - Student ID
 * @param {string} classId - Class ID
 * @returns {Promise<Array>}
 */
videoWatchProgressSchema.statics.getStudentClassProgress = function (studentId, classId) {
  return this.find({
    studentId,
    classId,
  })
    .populate('videoId', 'title subject duration')
    .sort({ lastWatchedAt: -1 });
};

/**
 * Get completion statistics for a video
 * @param {string} videoId - Video ID
 * @returns {Promise<Object>}
 */
videoWatchProgressSchema.statics.getVideoStats = async function (videoId) {
  const stats = await this.aggregate([
    {
      $match: { videoId: mongoose.Types.ObjectId(videoId) },
    },
    {
      $group: {
        _id: '$videoId',
        totalViewers: { $sum: 1 },
        completedCount: {
          $sum: { $cond: ['$isCompleted', 1, 0] },
        },
        averageCompletion: { $avg: '$completionPercentage' },
        averageWatchedDuration: { $avg: '$watchedDuration' },
      },
    },
  ]);

  return stats[0] || {
    totalViewers: 0,
    completedCount: 0,
    averageCompletion: 0,
    averageWatchedDuration: 0,
  };
};

/**
 * Get class-wide video analytics
 * @param {string} classId - Class ID
 * @returns {Promise<Array>}
 */
videoWatchProgressSchema.statics.getClassVideoAnalytics = function (classId) {
  return this.aggregate([
    {
      $match: { classId: mongoose.Types.ObjectId(classId) },
    },
    {
      $group: {
        _id: '$videoId',
        totalViewers: { $sum: 1 },
        completedCount: {
          $sum: { $cond: ['$isCompleted', 1, 0] },
        },
        averageCompletion: { $avg: '$completionPercentage' },
      },
    },
    { $sort: { totalViewers: -1 } },
  ]);
};

// ============================================
// INSTANCE METHODS
// ============================================

/**
 * Update watch progress
 * @param {number} watchedDuration - Total watched duration in seconds
 * @param {number} totalDuration - Total video duration in seconds
 * @returns {Promise}
 */
videoWatchProgressSchema.methods.updateProgress = async function (
  watchedDuration,
  totalDuration = null
) {
  this.watchedDuration = Math.max(this.watchedDuration, watchedDuration);
  if (totalDuration) {
    this.totalDuration = totalDuration;
  }

  // Calculate completion percentage
  if (this.totalDuration) {
    this.completionPercentage = Math.round((this.watchedDuration / this.totalDuration) * 100);
  }

  this.lastWatchedPosition = watchedDuration;
  this.lastWatchedAt = new Date();

  // Mark as completed if watched 95% or more
  if (this.completionPercentage >= 95 && !this.isCompleted) {
    this.isCompleted = true;
    this.completedAt = new Date();
  }

  return this.save();
};

/**
 * Record a new view
 * @returns {Promise}
 */
videoWatchProgressSchema.methods.recordView = async function () {
  this.numberOfViews += 1;
  this.updatedAt = new Date();
  return this.save();
};

/**
 * Get formatted progress for API response
 * @returns {Object}
 */
videoWatchProgressSchema.methods.getFormattedProgress = function () {
  return {
    videoId: this.videoId,
    studentId: this.studentId,
    watchedDuration: this.watchedDuration,
    totalDuration: this.totalDuration,
    completionPercentage: this.completionPercentage,
    isCompleted: this.isCompleted,
    completedAt: this.completedAt,
    lastWatchedPosition: this.lastWatchedPosition,
    numberOfViews: this.numberOfViews,
    updatedAt: this.updatedAt,
  };
};

// ============================================
// MODELS
// ============================================

module.exports = mongoose.model('VideoWatchProgress', videoWatchProgressSchema);
