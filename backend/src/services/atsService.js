const axios = require('axios');
const Resume = require('../models/resume');
const ATSReport = require('../models/atsReport');

class ATSService {
  /**
   * Compares the user's latest resume against a target job description
   * @param {string} userId - ID of the user requesting matching
   * @param {string} jobDescriptionText - Job Description text to evaluate
   * @param {string} jobTitle - Optional target job title
   * @returns {Promise<Object>} The created ATSReport Mongoose document
   */
  async calculateATS(userId, jobDescriptionText, jobTitle = '') {
    // 1. Fetch latest active resume for this user
    const latestResume = await Resume.findOne({ userId, isLatest: true });
    if (!latestResume) {
      const error = new Error('No active resume found. Please upload a resume first before calculating ATS score.');
      error.statusCode = 404;
      throw error;
    }

    // 2. Setup AI Service payload
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    const payload = {
      resume_data: latestResume,
      job_description: jobDescriptionText,
      target_title: jobTitle
    };

    try {
      // 3. Dispatch to FastAPI semantic matcher
      const response = await axios.post(`${aiServiceUrl}/api/ats/calculate`, payload);
      
      if (!response.data || !response.data.success) {
        throw new Error('ML engine failed to calculate ATS score.');
      }

      const { report } = response.data;

      // 4. Save calculations as an ATSReport document in MongoDB
      const reportDocument = await ATSReport.create({
        userId,
        resumeId: latestResume._id,
        jobTitle: jobTitle || latestResume.normalizedData?.fullName || '',
        jobDescriptionText,
        scores: report.overallScore ? report.sectionScores : {
          overall: report.overallScore || 0,
          skillMatch: report.sectionScores?.skillMatch || 0,
          semanticMatch: report.sectionScores?.semanticMatch || 0,
          experience: report.sectionScores?.experience || 0,
          projects: report.sectionScores?.projects || 0,
          education: report.sectionScores?.education || 0,
          structure: report.sectionScores?.structure || 0,
          certifications: report.sectionScores?.certifications || 0
        },
        // Wait, overall score was not listed inside scores sub-schema in atsReport.js
        // Let's check: in atsReport.js we defined:
        // scores: { overall, skillMatch, semanticMatch, experience, projects, education, structure, certifications }
        // Yes, overall is in scores! So we map it.
        scores: {
          overall: report.overallScore || 0,
          skillMatch: report.sectionScores?.skillMatch || 0,
          semanticMatch: report.sectionScores?.semanticMatch || 0,
          experience: report.sectionScores?.experience || 0,
          projects: report.sectionScores?.projects || 0,
          education: report.sectionScores?.education || 0,
          structure: report.sectionScores?.structure || 0,
          certifications: report.sectionScores?.certifications || 0
        },
        analysis: report.analysis
      });

      return reportDocument;
    } catch (error) {
      console.error('FastAPI calculation request failed:', error.message);
      throw new Error(`ATS scoring service failed: ${error.response?.data?.detail || error.message}`);
    }
  }

  /**
   * Retrieves a previously calculated report by ID
   * @param {string} reportId - The unique report ObjectId
   * @param {string} userId - Verifies ownership
   * @returns {Promise<Object>}
   */
  async getReportById(reportId, userId) {
    const report = await ATSReport.findOne({ _id: reportId, userId }).populate('resumeId', 'fileName pdfUrl');
    if (!report) {
      const error = new Error('ATS Report not found.');
      error.statusCode = 404;
      throw error;
    }
    return report;
  }
}

module.exports = new ATSService();
