let passport = require('passport');
let GooglePlusTokenStrategy = require('passport-google-plus-token');
let FacebookTokenStrategy = require('passport-facebook-token');
const User = require('../models/UserModel').User;
const config = require('config');

module.exports = function(){
    // google auth
    passport.use('googleToken', new GooglePlusTokenStrategy({
        clientID: config.get("googleclientSecret"),
        clientSecret: config.get("googleclientSecret")
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            // console.log('profile', profile);
            // console.log('accessToken', accessToken);
            // console.log('refreshToken', refreshToken);
        
            // check if user with GOOGLE ID exists
            let existingUser = await User.findOne({ "google.id": profile.id });
            if (existingUser ) {
                if(existingUser.active){
                    if(!existingUser.google.id){
                        existingUser.google.id = profile.id;
                        if(!existingUser.email && profile.emails[0].value)
                            existingUser.email = profile.emails[0].value;
                        await existingUser.save();
                    }
                    return done(null, existingUser);
                }
            }
            
            // check if user with GOOGLE's EMAIL exists
            existingUser = await User.findOne({email: profile.emails[0].value});
            if (existingUser ) {
                if(existingUser.active)
                    return done(null, existingUser);
            }

            const newUser = new User({
                method: 'google',
                active: true,
                name: profile.name.givenName,
                email: profile.emails[0].value,
                google: {
                    id: profile.id
                }
            });
        
            await newUser.save();
            done(null, newUser);
        } catch(error) {
            done(error, false, error.message);
        }
    }));

    // facebook auth
    passport.use('facebookToken', new FacebookTokenStrategy({
        clientID: config.get("facebookclientID"),
        clientSecret: config.get("facebookclientSecret")
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            // console.log('profile', profile);
            // console.log('accessToken', accessToken);
            // console.log('refreshToken', refreshToken);
        
            let existingUser = await User.findOne({ "facebook.id": profile.id });
            if (existingUser ) {
                if(existingUser.active)
                {
                    if(!existingUser.facebook.id){
                        existingUser.facebook.id = profile.id;
                        if(!existingUser.email && profile.emails[0].value)
                            existingUser.email = profile.emails[0].value;
                        await existingUser.save();
                    }
                    return done(null, existingUser);
                }
            }

            console.log("fb email: " + profile.emails[0].value);
            if(profile.emails[0].value){
                existingUser = await User.findOne({ email: profile.emails[0].value });
                if (existingUser ) {
                    if(existingUser.active)
                        return done(null, existingUser);
                }
            }

            console.log("created new fb user");
            const newUser = new User({
                method: 'facebook',
                active: true,
                name: profile.name.givenName,
                email: profile.emails[0].value,
                facebook: {
                    id: profile.id
                }
            });
        
            await newUser.save();
            done(null, newUser);
        } catch(error) {
            done(error, false, error.message);
        }
    }));
}