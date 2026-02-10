const router = require('express').Router();
const passport = require('passport');
const {
  register,
  login,
  getMe,
  logout,
  githubCallback,
} = require('../controllers/authController');
const auth = require('../middleware/auth');

// Email/password auth
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', auth, getMe);

// GitHub OAuth
router.get(
  '/github',
  passport.authenticate('github', { scope: ['user:email', 'read:user', 'repo'] })
);

router.get(
  '/github/callback',
  passport.authenticate('github', {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=github_auth_failed`,
  }),
  githubCallback
);

module.exports = router;
