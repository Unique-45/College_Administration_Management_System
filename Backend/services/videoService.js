/**
 * Video Service
 * Handles Azure Blob Storage operations and video-related business logic
 * Per SRS 4.3: Subject-Wise Video Streaming (Student)
 */

const { BlobServiceClient, generateBlobSASUrl, BlobSASPermissions } = require('@azure/storage-blob');
const config = require('../config/environment');
const logger = require('../utils/logger');
const constants = require('../config/constants');

// ============================================
// AZURE BLOB SERVICE INITIALIZATION
// ============================================

let blobServiceClient = null;

const initializeBlobService = () => {
  try {
    if (!blobServiceClient) {
      blobServiceClient = BlobServiceClient.fromConnectionString(
        config.azure.connectionString
      );
      logger.info('Azure Blob Service initialized');
    }
    return blobServiceClient;
  } catch (error) {
    logger.error('Failed to initialize Azure Blob Service', { error: error.message });
    throw new Error('Azure storage configuration error');
  }
};

// ============================================
// VIDEO UPLOAD
// ============================================

/**
 * Upload video to Azure Blob Storage
 * @param {Buffer} fileBuffer - Video file buffer
 * @param {string} fileName - Original filename
 * @param {string} mimeType - MIME type
 * @returns {Promise<Object>} - {blobName, blobUrl, fileSize}
 */
const uploadVideoToAzure = async (fileBuffer, fileName, mimeType) => {
  try {
    const service = initializeBlobService();
    const containerClient = service.getContainerClient(constants.AZURE_SETTINGS.VIDEO_CONTAINER);

    // Generate unique blob name (prevent collisions)
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    const blobName = `${timestamp}-${randomId}-${fileName}`;

    logger.info('Starting video upload to Azure', {
      fileName,
      blobName,
      fileSize: fileBuffer.length,
    });

    // Create block blob client
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Upload with options
    await blockBlobClient.upload(fileBuffer, fileBuffer.length, {
      blobHTTPHeaders: {
        blobContentType: mimeType,
      },
      metadata: {
        uploadedAt: new Date().toISOString(),
        originalFileName: fileName,
      },
    });

    logger.info('Video uploaded successfully to Azure', { blobName });

    return {
      blobName,
      blobUrl: blockBlobClient.uri,
      fileSize: fileBuffer.length,
      container: constants.AZURE_SETTINGS.VIDEO_CONTAINER,
    };
  } catch (error) {
    logger.error('Error uploading video to Azure', { error: error.message, fileName });
    throw new Error(`Failed to upload video: ${error.message}`);
  }
};

// ============================================
// SAS URL GENERATION
// ============================================

/**
 * Generate SAS URL for secure video streaming
 * @param {string} blobName - Blob name in Azure
 * @param {number} expiryMinutes - URL expiry time in minutes
 * @returns {Promise<string>} - SAS URL
 */
const generateSASUrl = async (blobName, expiryMinutes = 15) => {
  try {
    const service = initializeBlobService();
    const containerClient = service.getContainerClient(constants.AZURE_SETTINGS.VIDEO_CONTAINER);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Generate SAS URL with read permissions
    const sasUrl = generateBlobSASUrl(
      config.azure.accountName,
      constants.AZURE_SETTINGS.VIDEO_CONTAINER,
      blobName,
      new BlobSASPermissions({ read: true }),
      new Date(new Date().valueOf() + expiryMinutes * 60 * 1000) // Expiry time
    );

    logger.info('SAS URL generated', {
      blobName,
      expiryMinutes,
    });

    return sasUrl;
  } catch (error) {
    logger.error('Error generating SAS URL', { error: error.message, blobName });
    throw new Error(`Failed to generate secure URL: ${error.message}`);
  }
};

// ============================================
// BLOB DELETION
// ============================================

/**
 * Delete video blob from Azure
 * @param {string} blobName - Blob name in Azure
 * @returns {Promise<boolean>}
 */
const deleteVideoBlob = async (blobName) => {
  try {
    const service = initializeBlobService();
    const containerClient = service.getContainerClient(constants.AZURE_SETTINGS.VIDEO_CONTAINER);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Delete the blob
    await blockBlobClient.delete();

    logger.info('Video blob deleted from Azure', { blobName });
    return true;
  } catch (error) {
    logger.error('Error deleting video blob from Azure', { error: error.message, blobName });
    // Log error but don't throw - soft delete in DB is more important
    return false;
  }
};

// ============================================
// BLOB METADATA
// ============================================

/**
 * Get blob properties (size, MIME type, etc.)
 * @param {string} blobName - Blob name in Azure
 * @returns {Promise<Object>}
 */
const getBlobProperties = async (blobName) => {
  try {
    const service = initializeBlobService();
    const containerClient = service.getContainerClient(constants.AZURE_SETTINGS.VIDEO_CONTAINER);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    const properties = await blockBlobClient.getProperties();

    return {
      size: properties.contentLength,
      mimeType: properties.blobHTTPHeaders?.blobContentType,
      createdAt: properties.createdOn,
      lastModified: properties.lastModified,
      metadata: properties.metadata,
    };
  } catch (error) {
    logger.error('Error getting blob properties', { error: error.message, blobName });
    throw new Error(`Failed to get blob properties: ${error.message}`);
  }
};

// ============================================
// VIDEO VALIDATION
// ============================================

/**
 * Validate video file for upload
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} mimeType - MIME type
 * @param {string} originalFileName - Original filename
 * @returns {Object} - {valid: boolean, error: string | null}
 */
const validateVideoFile = (fileBuffer, mimeType, originalFileName) => {
  // Check file size (max 500 MB)
  const maxSizeMB = constants.FILE_SIZES.MAX_VIDEO_SIZE_MB;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (fileBuffer.length > maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds maximum limit of ${maxSizeMB}MB`,
    };
  }

  // Check MIME type
  if (!Object.values(constants.VIDEO_FORMATS).includes(mimeType)) {
    return {
      valid: false,
      error: `Invalid video format. Supported formats: ${Object.keys(constants.VIDEO_FORMATS).join(', ')}`,
    };
  }

  // Check filename
  if (!originalFileName || originalFileName.length === 0) {
    return {
      valid: false,
      error: 'Invalid filename',
    };
  }

  return {
    valid: true,
    error: null,
  };
};

// ============================================
// EXPORTS
// ============================================

module.exports = {
  uploadVideoToAzure,
  generateSASUrl,
  deleteVideoBlob,
  getBlobProperties,
  validateVideoFile,
  initializeBlobService,
};
