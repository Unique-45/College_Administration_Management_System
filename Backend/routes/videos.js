/**
 * Videos Routes
 * All routes related to video content management
 * Phase 5: Video Content Management
 */

const express = require('express');
const videosController = require('../controllers/videosController');
const { authMiddleware } = require('../middleware/auth');
const { roleGuard } = require('../middleware/roleGuard');
const logger = require('../utils/logger');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// ============================================
// VIDEO UPLOAD (Teachers and Admins only)
// ============================================

/**
 * POST /api/videos/upload
 * Upload video to Azure Blob Storage
 * @body {file} file - Video file (required, multipart/form-data)
 * @body {string} title - Video title (required)
 * @body {string} description - Video description (optional)
 * @body {string} subject - Subject name (required)
 * @body {string} classId - Class ID (required)
 * @body {number} duration - Video duration in seconds (optional)
 * @returns {Object} - {success, data: {video details}}
 * @access Teacher, Admin only
 */
router.post(
  '/upload',
  roleGuard(['teacher', 'admin']),
  videosController.videoUpload.single('file'),
  videosController.uploadVideo
);

// ============================================
// VIDEO RETRIEVAL
// ============================================

/**
 * GET /api/videos
 * Get all videos with pagination and filters
 * Query parameters:
 *   - page: Page number (default: 1)
 *   - limit: Items per page (default: 10, max: 100)
 *   - classId: Filter by class ID
 *   - subject: Filter by subject name
 *   - teacherId: Filter by teacher ID (Admin only)
 * Role-based filtering:
 *   - Admin: Can see all videos
 *   - Teacher: Sees only their videos
 *   - Student: Sees videos from their enrolled classes
 * @returns {Object} - {success, data: {videos array, pagination}}
 * @access All authenticated users
 */
router.get('/', videosController.getVideos);

/**
 * GET /api/videos/:id
 * Get video details by ID with SAS URL for streaming
 * @param {string} id - Video ID (required)
 * @returns {Object} - {success, data: {video details, streaming URL}}
 * @access Admin, Video creator, Enrolled students
 */
router.get('/:id', videosController.getVideoById);

// ============================================
// VIDEO UPDATE
// ============================================

/**
 * PUT /api/videos/:id
 * Update video metadata (NOT file content)
 * @param {string} id - Video ID (required)
 * @body {string} title - Video title (optional)
 * @body {string} description - Video description (optional)
 * @body {string} subject - Subject name (optional)
 * @body {number} duration - Video duration in seconds (optional)
 * @body {boolean} isPublished - Publication status (optional)
 * @returns {Object} - {success, data: {updated video details}}
 * @access Video creator, Admin only
 */
router.put('/:id', roleGuard(['teacher', 'admin']), videosController.updateVideo);

// ============================================
// VIDEO DELETION
// ============================================

/**
 * DELETE /api/videos/:id
 * Delete (archive) video with soft delete in DB and blob deletion in Azure
 * @param {string} id - Video ID (required)
 * @returns {Object} - {success, data: {deleted video ID}}
 * @access Video creator, Admin only
 */
router.delete('/:id', roleGuard(['teacher', 'admin']), videosController.deleteVideo);

// ============================================
// WATCH PROGRESS TRACKING
// ============================================

/**
 * POST /api/videos/:id/progress
 * Log student's video watch progress
 * @param {string} id - Video ID (required)
 * @body {number} watchedDuration - Total seconds watched (required)
 * @body {number} totalDuration - Total video duration in seconds (optional)
 * @returns {Object} - {success, data: {progress details}}
 * @access Students only (via auth middleware)
 */
router.post('/:id/progress', videosController.logWatchProgress);

/**
 * GET /api/videos/:id/progress
 * Get student's watch progress for a video
 * @param {string} id - Video ID (required)
 * @returns {Object} - {success, data: {watch progress details}}
 * @access Students (view own progress)
 */
router.get('/:id/progress', videosController.getWatchProgress);

// ============================================
// VIDEO ANALYTICS
// ============================================

/**
 * GET /api/videos/:id/analytics
 * Get video analytics and statistics
 * @param {string} id - Video ID (required)
 * @returns {Object} - {success, data: {view count, completion stats, etc.}}
 * @access Video creator, Admin only
 */
router.get('/:id/analytics', videosController.getVideoAnalytics);

module.exports = router;
