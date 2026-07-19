const atsService = require('../services/atsService');

class ATSController {
  // Trigger custom ATS calculation
  async calculateATS(req, res, next) {
    try {
      const { jobDescriptionText, jobTitle } = req.body;

      if (!jobDescriptionText || !jobDescriptionText.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Please provide the Job Description text.'
        });
      }

      const report = await atsService.calculateATS(
        req.user.userId,
        jobDescriptionText,
        jobTitle
      );

      res.status(201).json({
        success: true,
        message: 'ATS evaluation completed successfully.',
        report
      });
    } catch (error) {
      next(error);
    }
  }

  // Get specific report by ID
  async getReport(req, res, next) {
    try {
      const { id } = req.params;
      const report = await atsService.getReportById(id, req.user.userId);

      res.status(200).json({
        success: true,
        report
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ATSController();
