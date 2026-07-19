const skillsService = require('../services/skillsService');

class SkillsController {
  // Analyze skill gaps against a Job Description
  async analyzeSkills(req, res, next) {
    try {
      const { jobDescriptionText } = req.body;

      if (!jobDescriptionText || !jobDescriptionText.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Please provide the Job Description text.'
        });
      }

      const analysis = await skillsService.analyzeSkills(
        req.user.userId,
        jobDescriptionText
      );

      res.status(200).json({
        success: true,
        analysis
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SkillsController();
