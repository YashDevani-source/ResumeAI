const router = require('express').Router();
const {
  generate,
  getGenerated,
  getGeneratedById,
  deleteGenerated,
  exportResume,
} = require('../controllers/generateController');
const auth = require('../middleware/auth');

router.use(auth); // All generate routes require authentication

router.post('/', generate);
router.get('/', getGenerated);
router.get('/:id', getGeneratedById);
router.delete('/:id', deleteGenerated);
router.get('/:id/export', exportResume);

module.exports = router;
