/**
 * Video Model
 * MongoDB schema for video content management
 * Per SRS 4.3: Subject-Wise Video Streaming (Student)
 */

const mongoose = require('mongoose');
const constants = require('../config/constants');

// ============================================
// VIDEO SCHEMA DEFINITION
// ============================================

const videoSchema = new mongoose.Schema(
  {
    // Basic Information
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 200,
      index: true,
    },

    description: {
      type: String,
      optional: true,
      maxlength: 1000,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    // Teacher/Creator Information
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    teacherName: {
      type: String,
      optional: true, // Denormalized for quick access
    },

    // Class Association
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
      index: true,
    },

    className: {
      type: String,
      optional: true, // Denormalized
    },

    // Azure Blob Storage Information
    blobName: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    blobUrl: {
      type: String,
      optional: true, // Full URL before SAS token
    },

    blobContainer: {
      type: String,
      default: constants.AZURE_SETTINGS.VIDEO_CONTAINER,
    },

    // Video Metadata
    duration: {
      type: Number, // Duration in seconds
      optional: true,
    },

    fileSize: {
      type: Number, // File size in bytes
      optional: true,
    },

    mimeType: {
      type: String,
      enum: Object.values(constants.VIDEO_FORMATS),
      optional: true,
    },

    // Thumbnail/Cover Image
    thumbnail: {
      type: String, // URL to thumbnail image
      optional: true,
    },

    // Video Statistics
    views: {
      type: Number,
      default: 0,
      index: true,
    },

    uniqueViewers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    completionRate: {
      type: Number, // Average completion rate as percentage (0-100)
      default: 0,
    },

    // Access Control
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    // Metadata
    tags: [
      {
        type: String,
        trim: true,
      },
    ],

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

    deletedAt: {
      type: Date,
      default: null,
      sparse: true,
    },
  },
  {
    timestamps: true,
    collection: 'videos',
  }
);

// ============================================
// INDEXES
// ============================================

// Compound index for class + subject queries
videoSchema.index({ classId: 1, subject: 1 });

// Index for teacher's videos
videoSchema.index({ uploadedBy: 1, isActive: 1 });

// Index for published videos
videoSchema.index({ isPublished: 1, isActive: 1, createdAt: -1 });

// ============================================
// STATIC METHODS
// ============================================

/**
 * Find video by ID (only active, non-deleted videos)
 * @param {string} videoId - Video ID
 * @returns {Promise<Object>}
 */
videoSchema.statics.findById = function (videoId) {
  return this.findOne({
    _id: videoId,
    isActive: true,
    deletedAt: null,
  });
};

/**
 * Find all videos uploaded by a teacher
 * @param {string} teacherId - Teacher ID
 * @returns {Promise<Array>}
 */
videoSchema.statics.findByTeacher = function (teacherId) {
  return this.find({
    uploadedBy: teacherId,
    isActive: true,
    deletedAt: null,
  })
    .populate('uploadedBy', 'name email')
    .populate('classId', 'name subject');
};

/**
 * Find videos by class
 * @param {string} classId - Class ID
 * @returns {Promise<Array>}
 */
videoSchema.statics.findByClass = function (classId) {
  return this.find({
    classId,
    isPublished: true,
    isActive: true,
    deletedAt: null,
  })
    .populate('uploadedBy', 'name email')
    .sort({ createdAt: -1 });
};

/**
 * Find videos by subject
 * @param {string} subject - Subject name
 * @returns {Promise<Array>}
 */
videoSchema.statics.findBySubject = function (subject) {
  return this.find({
    subject: new RegExp(subject, 'i'),
    isPublished: true,
    isActive: true,
    deletedAt: null,
  });
};

/**
 * Get most watched videos
 * @param {number} limit - Number of videos to return
 * @returns {Promise<Array>}
 */
videoSchema.statics.getMostWatched = function (limit = 10) {
  return this.find({
    isPublished: true,
    isActive: true,
    deletedAt: null,
  })
    .sort({ views: -1 })
    .limit(limit)
    .populate('uploadedBy', 'name')
    .populate('classId', 'name');
};

// ============================================
// INSTANCE METHODS
// ============================================

/**
 * Record a view
 * @param {string} userId - User ID viewing the video
 * @returns {Promise}
 */
videoSchema.methods.recordView = async function (userId) {
  this.views += 1;

  // Track unique viewers
  if (!this.uniqueViewers.includes(userId)) {
    this.uniqueViewers.push(userId);
  }

  return this.save();
};

/**
 * Update completion rate based on watch progress records
 * @param {number} completionPercentage - Average completion percentage
 * @returns {Promise}
 */
videoSchema.methods.updateCompletionRate = async function (completionPercentage) {
  this.completionRate = Math.round(completionPercentage);
  return this.save();
};

/**
 * Publish video
 * @returns {Promise}
 */
videoSchema.methods.publish = async function () {
  this.isPublished = true;
  this.updatedAt = new Date();
  return this.save();
};

/**
 * Unpublish video
 * @returns {Promise}
 */
videoSchema.methods.unpublish = async function () {
  this.isPublished = false;
  this.updatedAt = new Date();
  return this.save();
};

/**
 * Soft delete video
 * @returns {Promise}
 */
videoSchema.methods.softDelete = async function () {
  this.deletedAt = new Date();
  this.isActive = false;
  return this.save();
};

/**
 * Restore soft deleted video
 * @returns {Promise}
 */
videoSchema.methods.restore = async function () {
  this.deletedAt = null;
  this.isActive = true;
  return this.save();
};

// ============================================
// MODELS
// ============================================

module.exports = mongoose.model('Video', videoSchema);
