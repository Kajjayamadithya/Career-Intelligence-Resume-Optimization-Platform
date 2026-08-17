const axios = require('axios');
const Resume = require('../models/resume');
const CareerRoadmap = require('../models/careerRoadmap');
const resourceService = require('./resourceService');

class CareerService {
  /**
   * Generates a learning roadmap via AI based on the user's latest resume and goal
   * @param {string} userId - Requesting user ID
   * @param {string} careerGoal - Target job role
   * @returns {Promise<Object>} The created CareerRoadmap Mongoose document
   */
  async generateRoadmap(userId, careerGoal) {
    // 1. Fetch latest resume skills (fallback to empty list if no resume exists yet)
    const latestResume = await Resume.findOne({ userId, isLatest: true });
    const resumeSkills = latestResume?.normalizedData?.skills || [];

    // 2. Prepare payload
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    const payload = {
      career_goal: careerGoal,
      resume_skills: resumeSkills
    };

    try {
      // 3. Dispatch to FastAPI Python service
      const response = await axios.post(`${aiServiceUrl}/api/career/roadmap`, payload);
      
      if (!response.data || !response.data.success) {
        throw new Error('ML service failed to generate career roadmap.');
      }

      const { roadmap } = response.data;

      // 4. Preserve RAG-enriched resources or fallback to catalog matcher
      if (roadmap && Array.isArray(roadmap.weeklyPlan)) {
        roadmap.weeklyPlan = roadmap.weeklyPlan.map(week => {
          const resources = week.resources || resourceService.enrichWeeklyTopic(
            week.topic || '',
            week.objectives || []
          );
          return {
            ...week,
            resources
          };
        });
      }

      // 5. Save to database
      const roadmapDoc = await CareerRoadmap.create({
        userId,
        careerGoal,
        roadmapData: roadmap
      });

      return roadmapDoc;
    } catch (error) {
      console.error('FastAPI roadmap generation failed:', error.message);
      throw new Error(`AI Roadmap service failed: ${error.response?.data?.detail || error.message}`);
    }
  }

  /**
   * Fetches history of generated roadmaps for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>}
   */
  async getRoadmapHistory(userId) {
    return await CareerRoadmap.find({ userId }).sort({ createdAt: -1 });
  }
}

module.exports = new CareerService();
