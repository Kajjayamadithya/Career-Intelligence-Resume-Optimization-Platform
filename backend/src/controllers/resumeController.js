const Resume = require('../models/resume');
const cloudinaryService = require('../services/cloudinaryService');
const parserService = require('../services/parserService');

class ResumeController {
  // Upload resume file controller
  async uploadResume(req, res, next) {
    const fs = require('fs');
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a PDF resume file.'
        });
      }

      // Parse using local PyMuPDF + Gemini Resume Parser
      let rawResumeText = '';
      let parsedResume = {};
      let normalizedData = {};
      try {
        const parseResult = await parserService.parseResume(req.file.path);
        rawResumeText = parseResult.rawResumeText;
        parsedResume = parseResult.parsedResume;
        normalizedData = parserService.normalizeData(parsedResume);
      } catch (parseError) {
        console.error('Resume parsing failed:', parseError.message);
        // Safely cleanup the temp file on failure
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({
          success: false,
          message: `Resume parsing failed: ${parseError.message}`
        });
      }

      // Upload file to Cloudinary (this deletes the temp local file)
      const { pdfUrl, cloudinaryId } = await cloudinaryService.uploadResume(req.file.path);

      // Reset previous latest resumes for this user
      await Resume.updateMany(
        { userId: req.user.userId, isLatest: true },
        { $set: { isLatest: false } }
      );

      // Create new Resume entry
      const resume = await Resume.create({
        userId: req.user.userId,
        fileName: req.file.originalname,
        pdfUrl,
        cloudinaryId,
        rawResumeText,
        parsedResume,
        normalizedData,
        isLatest: true
      });

      res.status(201).json({
        success: true,
        message: 'Resume parsed and uploaded successfully.',
        resume
      });
    } catch (error) {
      next(error);
    }
  }

  // Get user's latest resume
  async getLatestResume(req, res, next) {
    try {
      const resume = await Resume.findOne({
        userId: req.user.userId,
        isLatest: true
      });

      if (!resume) {
        return res.status(404).json({
          success: false,
          message: 'No resume found. Please upload a resume.'
        });
      }

      res.status(200).json({
        success: true,
        resume
      });
    } catch (error) {
      next(error);
    }
  }

  // Fetch full resume version history
  async getResumeHistory(req, res, next) {
    try {
      const resumes = await Resume.find({ userId: req.user.userId }).sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        resumes
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete a specific resume version
  async deleteResume(req, res, next) {
    try {
      const { id } = req.params;

      const resume = await Resume.findOne({ _id: id, userId: req.user.userId });
      if (!resume) {
        return res.status(404).json({
          success: false,
          message: 'Resume version not found.'
        });
      }

      // Delete from Cloudinary
      await cloudinaryService.deleteResume(resume.cloudinaryId);

      // Delete from MongoDB
      await Resume.findByIdAndDelete(id);

      // If we deleted the latest resume, set the next newest as latest
      if (resume.isLatest) {
        const nextNewest = await Resume.findOne({ userId: req.user.userId }).sort({ createdAt: -1 });
        if (nextNewest) {
          nextNewest.isLatest = true;
          await nextNewest.save();
        }
      }

      res.status(200).json({
        success: true,
        message: 'Resume version deleted successfully.'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ResumeController();
