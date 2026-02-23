const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CALLBACK_URL) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL,
                passReqToCallback: true
            },
            async (req, accessToken, refreshToken, profile, done) => {
                try {
                    const email = profile.emails[0].value;
                    const googleId = profile.id;

                    let user = await User.findOne({ googleId });

                    if (user) {
                        return done(null, user);
                    }

                    user = await User.findOne({ email });

                    if (user) {
                        user.googleId = googleId;
                        user.profileImage = user.profileImage || profile.photos?.[0]?.value || null;
                        await user.save();
                        return done(null, user);
                    }

                    user = await User.create({
                        name: profile.displayName,
                        email,
                        googleId,
                        profileImage: profile.photos?.[0]?.value || null,
                        authProvider: 'google'
                    });

                    return done(null, user);
                } catch (error) {
                    return done(error, null);
                }
            }
        )
    );
    console.log('✅ Google OAuth strategy configured');
} else {
    console.warn('⚠️ Google OAuth not configured - missing GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, or GOOGLE_CALLBACK_URL');
}

module.exports = passport;
