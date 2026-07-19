const careerService = require('../services/careerService');

class CareerController {
  // Generate a customized career learning path
  async generateRoadmap(req, res, next) {
    try {
      const { careerGoal } = req.body;

      if (!careerGoal || !careerGoal.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a target career goal (e.g. AI Engineer).'
        });
      }

      const roadmap = await careerService.generateRoadmap(
        req.user.userId,
        careerGoal
      );

      res.status(201).json({
        success: true,
        message: 'Career roadmap generated successfully.',
        roadmap
      });
    } catch (error) {
      next(error);
    }
  }

  // Get user's roadmap generation history
  async getHistory(req, res, next) {
    try {
      const history = await careerService.getRoadmapHistory(req.user.userId);

      res.status(200).json({
        success: true,
        history
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CareerController();
