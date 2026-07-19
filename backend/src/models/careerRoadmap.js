const mongoose = require('mongoose');

const careerRoadmapSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    careerGoal: {
      type: String,
      required: [true, 'Please provide the target career goal (e.g. AI Engineer).'],
      trim: true
    },
    roadmapData: {
      type: Object,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const CareerRoadmap = mongoose.model('CareerRoadmap', careerRoadmapSchema);

module.exports = CareerRoadmap;
