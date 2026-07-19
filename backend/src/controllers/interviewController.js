const interviewService = require('../services/interviewService');

/**
 * Starts a new interview session
 */
exports.startSession = async (req, res, next) => {
  try {
    const { role, category } = req.body;
    if (!role || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both role and category.'
      });
    }

    const data = await interviewService.startSession(req.user.userId, role, category);

    res.status(201).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submits an answer for the current question
 */
exports.submitAnswer = async (req, res, next) => {
  try {
    const { sessionId, answerText } = req.body;
    if (!sessionId || answerText === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide sessionId and answerText.'
      });
    }

    const data = await interviewService.submitAnswer(req.user.userId, sessionId, answerText);

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves the full interview history for the logged-in user
 */
exports.getHistory = async (req, res, next) => {
  try {
    const sessions = await interviewService.getHistory(req.user.userId);

    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves details for a specific interview session
 */
exports.getSessionDetails = async (req, res, next) => {
  try {
    const session = await interviewService.getSessionDetails(req.user.userId, req.params.id);

    res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    next(error);
  }
};
