const { Strategy  } = require("passport-google-oauth20");
const passport = require("passport");

const  User  = require("../models/User.js");
const UserData  = require("../models/UserData.js");
const originalData = require('../data');


 const passportConfig = () => {

    passport.use(new Strategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback"
    },
        async (accessToken, refreshToken, profile, done) => {
          
            try {
                const user = await User.findOne({ googleId: profile.id });
                if (user) {
                    done(null, user);
                } else {
                   
                    const newUser = await User.create({
                        googleId: profile.id,
                        displayName: profile.displayName,
                        photo:profile._json.picture,  
                    });

                    const newUserData = await UserData.create({
                        googleId: profile.id,
                        data: originalData
                    });

                    done(null, newUser);
                }
            } catch (error) {
                console.log(error);
            }
        }
    ));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (error) {
            console.log(error);
        }
    });

}


module.exports = passportConfig;