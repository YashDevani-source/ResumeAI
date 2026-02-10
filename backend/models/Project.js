const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    techStack: [String],
    description: String,
    impact: String,
    bullets: [String], // AI-generated resume-ready bullet points
    source: {
      type: String,
      enum: ['github', 'manual'],
      default: 'manual',
    },
    // GitHub-specific fields
    githubData: {
      repoUrl: String,
      stars: Number,
      forks: Number,
      language: String,
      readme: String,
      lastUpdated: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);
