const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
      scope: ['user:email', 'read:user', 'repo'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ githubId: profile.id });

        if (user) {
          // Update tokens
          user.githubAccessToken = accessToken;
          user.githubProfile = {
            username: profile.username,
            displayName: profile.displayName,
            avatarUrl: profile.photos?.[0]?.value,
            profileUrl: profile.profileUrl,
          };
          await user.save();
        } else {
          // Check if user exists with same email
          const email = profile.emails?.[0]?.value;
          if (email) {
            user = await User.findOne({ email });
          }

          if (user) {
            // Link GitHub to existing account
            user.githubId = profile.id;
            user.githubAccessToken = accessToken;
            user.githubProfile = {
              username: profile.username,
              displayName: profile.displayName,
              avatarUrl: profile.photos?.[0]?.value,
              profileUrl: profile.profileUrl,
            };
            await user.save();
          } else {
            // Create new user
            user = await User.create({
              name: profile.displayName || profile.username,
              email: email || `${profile.username}@github.local`,
              githubId: profile.id,
              githubAccessToken: accessToken,
              githubProfile: {
                username: profile.username,
                displayName: profile.displayName,
                avatarUrl: profile.photos?.[0]?.value,
                profileUrl: profile.profileUrl,
              },
            });
          }
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
