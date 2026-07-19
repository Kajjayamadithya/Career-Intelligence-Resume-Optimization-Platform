const axios = require('axios');
const InterviewSession = require('../models/interviewSession');

class InterviewService {
  /**
   * Starts a new interview session and generates questions
   * @param {string} userId
   * @param {string} role
   * @param {string} category
   */
  async startSession(userId, role, category) {
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';

    try {
      // 1. Generate questions from Python FastAPI
      const response = await axios.post(`${aiServiceUrl}/api/interview/questions`, {
        role,
        category
      });

      if (!response.data || !response.data.success || !response.data.questions) {
        throw new Error('Failed to generate interview questions.');
      }

      const questions = response.data.questions;

      // 2. Create the interview session in MongoDB
      const session = await InterviewSession.create({
        userId,
        role,
        category,
        questions,
        answers: [],
        currentQuestionIndex: 0,
        status: 'active'
      });

      return {
        sessionId: session._id,
        role: session.role,
        category: session.category,
        totalQuestions: questions.length,
        currentQuestionIndex: 0,
        nextQuestion: questions[0]
      };
    } catch (error) {
      console.error('Start interview session failed:', error.message);
      throw new Error(`Interview start failed: ${error.response?.data?.detail || error.message}`);
    }
  }

  /**
   * Submits an answer for the current question
   * @param {string} userId
   * @param {string} sessionId
   * @param {string} answerText
   */
  async submitAnswer(userId, sessionId, answerText) {
    const session = await InterviewSession.findOne({ _id: sessionId, userId, status: 'active' });
    if (!session) {
      throw new Error('Active interview session not found.');
    }

    const currentQuestion = session.questions[session.currentQuestionIndex];
    if (!currentQuestion) {
      throw new Error('Invalid question index.');
    }

    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';

    try {
      // 1. Evaluate the answer via FastAPI
      const evalResponse = await axios.post(`${aiServiceUrl}/api/interview/evaluate`, {
        question: currentQuestion,
        answer: answerText,
        role: session.role,
        category: session.category
      });

      if (!evalResponse.data || !evalResponse.data.success || !evalResponse.data.evaluation) {
        throw new Error('Failed to evaluate answer.');
      }

      const evalData = evalResponse.data.evaluation;

      // 2. Push answer details
      session.answers.push({
        question: currentQuestion,
        answer: answerText,
        score: evalData.score,
        feedback: evalData.feedback,
        suggestedAnswer: evalData.suggestedAnswer
      });

      // 3. Move index forward
      session.currentQuestionIndex += 1;

      // 4. Check if interview is completed
      if (session.currentQuestionIndex >= session.questions.length) {
        session.status = 'completed';

        // Calculate overall score
        const totalScore = session.answers.reduce((acc, curr) => acc + curr.score, 0);
        session.overallScore = Math.round(totalScore / session.answers.length);

        // Fetch overall feedback from FastAPI
        const feedbackResponse = await axios.post(`${aiServiceUrl}/api/interview/feedback`, {
          role: session.role,
          category: session.category,
          qas: session.answers
        });

        if (feedbackResponse.data && feedbackResponse.data.success) {
          session.overallFeedback = feedbackResponse.data.feedback;
        } else {
          session.overallFeedback = 'Could not generate overall feedback report. Great job finishing the interview!';
        }

        await session.save();
        return {
          completed: true,
          session
        };
      }

      await session.save();
      return {
        completed: false,
        currentQuestionIndex: session.currentQuestionIndex,
        totalQuestions: session.questions.length,
        nextQuestion: session.questions[session.currentQuestionIndex],
        latestEvaluation: session.answers[session.answers.length - 1]
      };
    } catch (error) {
      console.error('Submit answer failed:', error.message);
      throw new Error(`Submit answer failed: ${error.response?.data?.detail || error.message}`);
    }
  }

  /**
   * Retrieves all interview sessions for a user
   * @param {string} userId
   */
  async getHistory(userId) {
    return await InterviewSession.find({ userId }).sort({ createdAt: -1 });
  }

  /**
   * Retrieves a specific interview session for a user
   * @param {string} userId
   * @param {string} sessionId
   */
  async getSessionDetails(userId, sessionId) {
    const session = await InterviewSession.findOne({ _id: sessionId, userId });
    if (!session) {
      throw new Error('Interview session not found.');
    }
    return session;
  }
}

module.exports = new InterviewService();
