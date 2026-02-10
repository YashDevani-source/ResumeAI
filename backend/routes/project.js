const router = require('express').Router();
const {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  syncGithubProjects,
} = require('../controllers/projectController');
const auth = require('../middleware/auth');

router.use(auth); // All project routes require authentication

router.get('/', getProjects);
router.post('/', createProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);
router.post('/github/sync', syncGithubProjects);

module.exports = router;
