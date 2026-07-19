const mongoose = require('mongoose');

const atsReportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true
    },
    jobTitle: {
      type: String,
      default: ''
    },
    jobDescriptionText: {
      type: String,
      required: [true, 'Please provide the Job Description text.']
    },
    scores: {
      overall: { type: Number, required: true },
      skillMatch: { type: Number, required: true },
      semanticMatch: { type: Number, required: true },
      experience: { type: Number, required: true },
      projects: { type: Number, required: true },
      education: { type: Number, required: true },
      structure: { type: Number, required: true },
      certifications: { type: Number, required: true }
    },
    analysis: {
      matchedSkills: { type: [String], default: [] },
      missingSkills: { type: [String], default: [] },
      strengths: { type: [String], default: [] },
      weaknesses: { type: [String], default: [] },
      improvementTips: { type: [String], default: [] }
    }
  },
  {
    timestamps: true
  }
);

const ATSReport = mongoose.model('ATSReport', atsReportSchema);

module.exports = ATSReport;
