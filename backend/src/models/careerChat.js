const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['user', 'mentor'],
    required: true
  },
  text: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const careerChatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true // One main chat thread per user
    },
    messages: [messageSchema]
  },
  {
    timestamps: true
  }
);

const CareerChat = mongoose.model('CareerChat', careerChatSchema);

module.exports = CareerChat;
