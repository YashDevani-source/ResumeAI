const Resume = require('../models/Resume');
const Project = require('../models/Project');
const GeneratedResume = require('../models/GeneratedResume');
const { extractJobKeywords, generateResume } = require('../services/aiService');
const { generatePDF, generateDOCX } = require('../services/exportService');

// POST /api/generate — Generate a tailored resume
exports.generate = async (req, res, next) => {
  try {
    const { baseResumeId, jobDescription, roleTag, selectedProjectIds } = req.body;

    if (!baseResumeId || !jobDescription || !roleTag) {
      return res.status(400).json({
        success: false,
        message: 'Base resume, job description, and role tag are required.',
      });
    }

    // 1. Fetch base resume
    const baseResume = await Resume.findOne({
      _id: baseResumeId,
      userId: req.user._id,
    });

    if (!baseResume) {
      return res.status(404).json({ success: false, message: 'Base resume not found.' });
    }

    // 2. Fetch selected projects (or all)
    let projects;
    if (selectedProjectIds?.length) {
      projects = await Project.find({
        _id: { $in: selectedProjectIds },
        userId: req.user._id,
      });
    } else {
      projects = await Project.find({ userId: req.user._id });
    }

    // 3. Extract job keywords
    const jobAnalysis = await extractJobKeywords(jobDescription);

    // 4. Generate the tailored resume
    const generatedContent = await generateResume(
      baseResume.parsedContent.sections,
      projects.map((p) => ({
        title: p.title,
        techStack: p.techStack,
        description: p.description,
        bullets: p.bullets,
        impact: p.impact,
      })),
      jobAnalysis,
      baseResume.parsedContent.templateStructure
    );

    // 5. Save generated resume
    const generated = await GeneratedResume.create({
      userId: req.user._id,
      baseResumeId,
      roleTag,
      jobDescription,
      extractedKeywords: jobAnalysis.keywords || [],
      generatedContent: {
        summary: generatedContent.summary,
        education: generatedContent.education || [],
        experience: generatedContent.experience || [],
        skills: generatedContent.skills || {},
        projects: generatedContent.projects || [],
        certifications: generatedContent.certifications || [],
        achievements: generatedContent.achievements || [],
      },
      templateStructure: {
        sectionOrder: baseResume.parsedContent.templateStructure?.sectionOrder || [],
        style: baseResume.parsedContent.templateStructure?.style || 'single-column',
      },
      atsScore: generatedContent.atsScore || null,
    });

    res.status(201).json({
      success: true,
      message: 'Resume generated successfully!',
      generatedResume: generated,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/generate — List generated resumes
exports.getGenerated = async (req, res, next) => {
  try {
    const generated = await GeneratedResume.find({ userId: req.user._id })
      .select('-generatedContent')
      .populate('baseResumeId', 'title')
      .sort('-createdAt');

    res.json({ success: true, count: generated.length, resumes: generated });
  } catch (error) {
    next(error);
  }
};

// GET /api/generate/:id — Get a generated resume
exports.getGeneratedById = async (req, res, next) => {
  try {
    const generated = await GeneratedResume.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate('baseResumeId', 'title');

    if (!generated) {
      return res.status(404).json({ success: false, message: 'Generated resume not found.' });
    }

    res.json({ success: true, resume: generated });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/generate/:id
exports.deleteGenerated = async (req, res, next) => {
  try {
    const generated = await GeneratedResume.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!generated) {
      return res.status(404).json({ success: false, message: 'Generated resume not found.' });
    }

    res.json({ success: true, message: 'Generated resume deleted.' });
  } catch (error) {
    next(error);
  }
};

// GET /api/generate/:id/export?format=pdf|docx
exports.exportResume = async (req, res, next) => {
  try {
    const { format } = req.query;

    if (!['pdf', 'docx'].includes(format)) {
      return res.status(400).json({
        success: false,
        message: 'Format must be "pdf" or "docx".',
      });
    }

    const generated = await GeneratedResume.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!generated) {
      return res.status(404).json({ success: false, message: 'Generated resume not found.' });
    }

    if (format === 'pdf') {
      const pdfBuffer = await generatePDF(
        generated.generatedContent,
        generated.templateStructure
      );
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${generated.roleTag}-resume.pdf"`);
      res.send(pdfBuffer);
    } else {
      const docxBuffer = await generateDOCX(
        generated.generatedContent,
        generated.templateStructure
      );
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${generated.roleTag}-resume.docx"`
      );
      res.send(docxBuffer);
    }
  } catch (error) {
    next(error);
  }
};
