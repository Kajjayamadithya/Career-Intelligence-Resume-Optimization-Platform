const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    fileName: {
      type: String,
      required: true
    },
    pdfUrl: {
      type: String,
      required: true
    },
    cloudinaryId: {
      type: String,
      required: true
    },
    rawResumeText: {
      type: String,
      default: ''
    },
    parsedResume: {
      type: Object,
      default: {}
    },
    rawParserJson: {
      type: Object,
      default: {}
    },
    normalizedData: {
      fullName: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      skills: { type: [String], default: [] },
      education: [
        {
          institution: { type: String, default: '' },
          degree: { type: String, default: '' },
          fieldOfStudy: { type: String, default: '' },
          startYear: { type: String, default: '' },
          endYear: { type: String, default: '' }
        }
      ],
      experience: [
        {
          company: { type: String, default: '' },
          title: { type: String, default: '' },
          startDate: { type: String, default: '' },
          endDate: { type: String, default: '' },
          description: { type: String, default: '' }
        }
      ],
      projects: [
        {
          title: { type: String, default: '' },
          description: { type: String, default: '' },
          technologies: { type: [String], default: [] }
        }
      ],
      certifications: { type: [String], default: [] },
      languages: { type: [String], default: [] },
      summary: { type: String, default: '' }
    },
    isLatest: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Compound index to quickly fetch latest resume for a user
resumeSchema.index({ userId: 1, isLatest: -1 });

const Resume = mongoose.model('Resume', resumeSchema);

module.exports = Resume;
