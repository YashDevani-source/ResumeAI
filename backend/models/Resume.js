const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      default: 'My Resume',
      trim: true,
    },
    originalFileName: String,
    filePath: String,
    // Parsed structured content from the uploaded resume
    parsedContent: {
      rawText: String,
      sections: {
        summary: String,
        education: [
          {
            institution: String,
            degree: String,
            field: String,
            startDate: String,
            endDate: String,
            gpa: String,
            details: String,
          },
        ],
        experience: [
          {
            company: String,
            role: String,
            startDate: String,
            endDate: String,
            location: String,
            bullets: [String],
          },
        ],
        skills: {
          technical: [String],
          soft: [String],
          languages: [String],
          tools: [String],
        },
        projects: [
          {
            title: String,
            techStack: [String],
            description: String,
            bullets: [String],
          },
        ],
        certifications: [
          {
            name: String,
            issuer: String,
            date: String,
          },
        ],
        achievements: [String],
      },
      // Original template structure (section order, formatting hints)
      templateStructure: {
        sectionOrder: [String],
        hasObjective: Boolean,
        hasSummary: Boolean,
        style: {
          type: String,
          enum: ['single-column', 'two-column', 'modern', 'classic'],
          default: 'single-column',
        },
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resume', resumeSchema);
