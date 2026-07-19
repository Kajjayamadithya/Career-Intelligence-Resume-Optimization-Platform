const axios = require('axios');
const Resume = require('../models/resume');
const CareerChat = require('../models/careerChat');

class MentorService {
  /**
   * Processes a stateful message from a user, updates database records, and queries the Gemini chat service
   * @param {string} userId - ID of the sender
   * @param {string} userMessage - User's input text
   * @returns {Promise<Object>} The updated chat document
   */
  async sendMessage(userId, userMessage) {
    // 1. Fetch or initialize the user's career chat session
    let chat = await CareerChat.findOne({ userId });
    if (!chat) {
      chat = await CareerChat.create({ userId, messages: [] });
    }

    // 2. Fetch user's latest resume skills for context enrichment
    const latestResume = await Resume.findOne({ userId, isLatest: true });
    const resumeSkills = latestResume?.normalizedData?.skills || [];

    // 3. Format message history for Gemini (user vs model roles)
    // We only take the last 20 messages to keep request payloads clean and fast
    const historyWindow = chat.messages.slice(-20);
    const apiHistory = historyWindow.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      text: msg.text
    }));

    // 4. Save user message to database immediately
    chat.messages.push({
      sender: 'user',
      text: userMessage
    });
    await chat.save();

    // 5. Query FastAPI AI service
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    const payload = {
      message: userMessage,
      history: apiHistory,
      resume_skills: resumeSkills
    };

    try {
      const response = await axios.post(`${aiServiceUrl}/api/chat/message`, payload);
      
      if (!response.data || !response.data.success) {
        throw new Error('AI Mentor failed to reply.');
      }

      const mentorReply = response.data.reply;

      // 6. Save mentor reply to database
      chat.messages.push({
        sender: 'mentor',
        text: mentorReply
      });
      await chat.save();

      return chat;
    } catch (error) {
      console.error('FastAPI career mentor chat failed:', error.message);
      throw new Error(`AI Mentor chat failed: ${error.response?.data?.detail || error.message}`);
    }
  }

  /**
   * Fetches the full chat transcript for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>}
   */
  async getChatHistory(userId) {
    let chat = await CareerChat.findOne({ userId });
    if (!chat) {
      chat = await CareerChat.create({ userId, messages: [] });
    }
    return chat;
  }
}

module.exports = new MentorService();
