const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Configure Cloudinary credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

class CloudinaryService {
  /**
   * Uploads a local file to Cloudinary and deletes the local buffer file.
   * @param {string} localFilePath - Path of the file on local disk
   * @returns {Promise<{ pdfUrl: string, cloudinaryId: string }>}
   */
  async uploadResume(localFilePath) {
    try {
      if (!localFilePath) {
        throw new Error('Local file path is required for upload.');
      }

      const result = await cloudinary.uploader.upload(localFilePath, {
        folder: 'career_intelligence_platform/resumes',
        resource_type: 'raw', // PDF needs 'raw' or 'image'. Since it's a PDF, we use 'raw' (or 'image' to enable preview thumbnails).
        // Let's use 'image' and format 'pdf' so Cloudinary returns a proper preview image if needed, or 'raw'. Let's use 'raw' to preserve document integrity.
        // Wait, for PDFs 'raw' works perfectly, let's keep 'raw'.
        access_mode: 'public'
      });

      // Safely delete the local file after upload
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }

      return {
        pdfUrl: result.secure_url,
        cloudinaryId: result.public_id
      };
    } catch (error) {
      // Cleanup file if error occurs
      if (localFilePath && fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }
      console.error('Cloudinary upload failed:', error.message);
      throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
  }

  /**
   * Deletes a file from Cloudinary.
   * @param {string} publicId - Cloudinary public ID of the resource
   * @returns {Promise<any>}
   */
  async deleteResume(publicId) {
    try {
      if (!publicId) return null;
      return await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
    } catch (error) {
      console.error('Cloudinary delete failed:', error.message);
      throw new Error(`Cloudinary delete failed: ${error.message}`);
    }
  }
}

module.exports = new CloudinaryService();
