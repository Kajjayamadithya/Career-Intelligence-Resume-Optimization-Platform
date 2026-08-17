const mentorService = require('../services/mentorService');

class MentorController {
  // Post user message to AI Career Mentor
  async sendMessage(req, res, next) {
    try {
      const { message } = req.body;

      if (!message || !message.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a message.'
        });
      }

      const chat = await mentorService.sendMessage(
        req.user.userId,
        message
      );

      // Return the updated chat transcript
      res.status(200).json({
        success: true,
        data: chat,
        chat
      });
    } catch (error) {
      next(error);
    }
  }

  // Fetch full conversation history
  async getHistory(req, res, next) {
    try {
      const chat = await mentorService.getChatHistory(req.user.userId);

      res.status(200).json({
        success: true,
        data: chat,
        chat
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MentorController();
