const mongoose = require('mongoose');

const interviewSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      required: [true, 'Please provide the target role.']
    },
    category: {
      type: String,
      required: [true, 'Please provide the interview category (e.g. Technical, Behavioral, HR).']
    },
    status: {
      type: String,
      enum: ['active', 'completed'],
      default: 'active'
    },
    questions: {
      type: [String],
      default: []
    },
    answers: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true },
        score: { type: Number, required: true },
        feedback: { type: String, required: true },
        suggestedAnswer: { type: String, required: true }
      }
    ],
    currentQuestionIndex: {
      type: Number,
      default: 0
    },
    overallScore: {
      type: Number,
      default: 0
    },
    overallFeedback: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

const InterviewSession = mongoose.model('InterviewSession', interviewSessionSchema);

module.exports = InterviewSession;
