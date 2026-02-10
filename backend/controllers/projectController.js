const Project = require('../models/Project');
const User = require('../models/User');
const { fetchDetailedRepos } = require('../services/githubService');
const { generateProjectBullets } = require('../services/aiService');

// GET /api/projects — List user's projects
exports.getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ userId: req.user._id }).sort('-createdAt');
    res.json({ success: true, count: projects.length, projects });
  } catch (error) {
    next(error);
  }
};

// POST /api/projects — Create a manual project
exports.createProject = async (req, res, next) => {
  try {
    const { title, techStack, description, impact } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Project title is required.' });
    }

    // Generate AI bullet points
    let bullets = [];
    try {
      const aiResult = await generateProjectBullets({
        title,
        techStack,
        description,
      });
      bullets = aiResult.bullets || [];
    } catch {
      // If AI fails, continue without bullets
    }

    const project = await Project.create({
      userId: req.user._id,
      title,
      techStack: techStack || [],
      description,
      impact,
      bullets,
      source: 'manual',
    });

    res.status(201).json({ success: true, project });
  } catch (error) {
    next(error);
  }
};

// PUT /api/projects/:id — Update a project
exports.updateProject = async (req, res, next) => {
  try {
    const { title, techStack, description, impact, bullets } = req.body;

    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { title, techStack, description, impact, bullets },
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    res.json({ success: true, project });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/projects/:id
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    res.json({ success: true, message: 'Project deleted.' });
  } catch (error) {
    next(error);
  }
};

// POST /api/projects/github/sync — Import projects from GitHub
exports.syncGithubProjects = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+githubAccessToken');

    if (!user.githubAccessToken) {
      return res.status(400).json({
        success: false,
        message: 'GitHub not connected. Please authenticate with GitHub first.',
      });
    }

    const username = user.githubProfile?.username;
    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'GitHub username not found.',
      });
    }

    // Fetch repos from GitHub
    const repos = await fetchDetailedRepos(user.githubAccessToken, username);

    const imported = [];
    for (const repo of repos) {
      // Skip if already imported
      const existing = await Project.findOne({
        userId: req.user._id,
        'githubData.repoUrl': repo.url,
      });

      if (existing) continue;

      // Generate AI bullets
      let aiResult = { bullets: [], description: repo.description || '' };
      try {
        aiResult = await generateProjectBullets({
          title: repo.name,
          techStack: repo.techStack,
          readme: repo.readme,
          description: repo.description,
          stars: repo.stars,
          forks: repo.forks,
        });
      } catch {
        // Continue without AI bullets
      }

      const project = await Project.create({
        userId: req.user._id,
        title: repo.name,
        techStack: repo.techStack || [],
        description: aiResult.description || repo.description || '',
        bullets: aiResult.bullets || [],
        source: 'github',
        githubData: {
          repoUrl: repo.url,
          stars: repo.stars,
          forks: repo.forks,
          language: repo.language,
          readme: repo.readme,
          lastUpdated: repo.updatedAt,
        },
      });

      imported.push(project);
    }

    res.json({
      success: true,
      message: `Imported ${imported.length} projects from GitHub.`,
      imported: imported.length,
      projects: imported,
    });
  } catch (error) {
    next(error);
  }
};
