const mongoose = require('mongoose');

const generatedResumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    baseResumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
    },
    roleTag: {
      type: String,
      required: true,
      trim: true,
    },
    jobDescription: {
      type: String,
      required: true,
    },
    extractedKeywords: [String],
    // Generated resume content in structured JSON
    generatedContent: {
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
    templateStructure: {
      sectionOrder: [String],
      style: String,
    },
    atsScore: Number, // Estimated ATS compatibility score
  },
  { timestamps: true }
);

module.exports = mongoose.model('GeneratedResume', generatedResumeSchema);
