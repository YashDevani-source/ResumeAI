const router = require('express').Router();
const {
  uploadResume,
  getResumes,
  getResume,
  deleteResume,
} = require('../controllers/resumeController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(auth); // All resume routes require authentication

router.post('/upload', upload.single('resume'), uploadResume);
router.get('/', getResumes);
router.get('/:id', getResume);
router.delete('/:id', deleteResume);

module.exports = router;
