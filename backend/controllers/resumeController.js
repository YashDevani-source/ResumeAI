const Resume = require('../models/Resume');
const { extractText } = require('../services/resumeParser');
const { parseResumeContent } = require('../services/aiService');

// POST /api/resumes/upload — Upload and parse a resume
exports.uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a PDF or DOCX file.',
      });
    }

    const { title } = req.body;

    // 1. Extract raw text from file
    const rawText = await extractText(req.file.path);

    // 2. Use AI to parse into structured sections
    const parsed = await parseResumeContent(rawText);

    // 3. Create resume record
    const resume = await Resume.create({
      userId: req.user._id,
      title: title || req.file.originalname.replace(/\.[^/.]+$/, ''),
      originalFileName: req.file.originalname,
      filePath: req.file.path,
      parsedContent: {
        rawText,
        sections: {
          summary: parsed.summary || '',
          education: parsed.education || [],
          experience: parsed.experience || [],
          skills: parsed.skills || { technical: [], soft: [], languages: [], tools: [] },
          projects: parsed.projects || [],
          certifications: parsed.certifications || [],
          achievements: parsed.achievements || [],
        },
        templateStructure: {
          sectionOrder: parsed.sectionOrder || ['summary', 'education', 'experience', 'skills', 'projects'],
          hasSummary: !!parsed.summary,
          style: parsed.style || 'single-column',
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Resume uploaded and parsed successfully.',
      resume,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/resumes — List user's base resumes
exports.getResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id })
      .select('-parsedContent.rawText')
      .sort('-createdAt');

    res.json({ success: true, count: resumes.length, resumes });
  } catch (error) {
    next(error);
  }
};

// GET /api/resumes/:id — Get a single resume
exports.getResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found.' });
    }

    res.json({ success: true, resume });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/resumes/:id
exports.deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found.' });
    }

    res.json({ success: true, message: 'Resume deleted.' });
  } catch (error) {
    next(error);
  }
};
