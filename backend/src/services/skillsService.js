const axios = require('axios');
const Resume = require('../models/resume');

class SkillsService {
  /**
   * Performs a comparison between the user's latest resume and required JD text
   * @param {string} userId - Requesting user ID
   * @param {string} jobDescription - Job description text containing required skills
   * @returns {Promise<Object>} The prioritized skill gap analysis from FastAPI
   */
  async analyzeSkills(userId, jobDescription) {
    // 1. Fetch latest resume
    const latestResume = await Resume.findOne({ userId, isLatest: true });
    if (!latestResume) {
      const error = new Error('No active resume found. Please upload a resume first to enable skill gap calculations.');
      error.statusCode = 404;
      throw error;
    }

    const resumeSkills = latestResume.normalizedData?.skills || [];

    // 2. Format AI payload
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    const payload = {
      resume_skills: resumeSkills,
      job_description: jobDescription
    };

    try {
      const response = await axios.post(`${aiServiceUrl}/api/skills/analyze`, payload);
      
      if (!response.data || !response.data.success) {
        throw new Error('ML engine failed to analyze skill gaps.');
      }

      return response.data.analysis;
    } catch (error) {
      console.error('FastAPI skill analysis failed:', error.message);
      throw new Error(`Skill Gap analysis failed: ${error.response?.data?.detail || error.message}`);
    }
  }
}

module.exports = new SkillsService();
