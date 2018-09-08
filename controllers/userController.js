const express = require('express');
const bcrypt = require('bcrypt');
const {User, validateUserRegistration, validateUserForLogin} = require('../models/UserModel');
const _ = require('lodash');
const {ConfirmEmail, generateRandomHashForEmail} = require('../models/confirmEmailModel');
const emailUtils = require('../email_verification/email');

let Controller = {
    login: async function(req, res, next) {
        const {error} = validateUserForLogin(req.body);
        if(error){
            error.statusCode = error.statusCode || 400;
            error.message = error.details[0].message;
            return next(error);
        }
    
        let user = await User.findOne({email: req.body.email});
        if(!user){
            let error = new Error("Invalid email or password.");
            error.statusCode = 400;
            return next(error);
        }
    
        const passwordIsValid = await bcrypt.compare(req.body.password, user.local.password);
        if(!passwordIsValid){
            let error = new Error("Invalid email or password.");
            error.statusCode = 400;
            return next(error);
        }
    
        if(!user.active){
            let error = new Error("You need to verify your email first.");
            error.statusCode = 403;
            return next(error);
        }
    
        const token = user.generateAuthToken();
        res.header('x-auth-token', token).send(_.pick(user, ['_id', 'name', 'email']));
    },

    editAccount: async function(req, res, next){
        const user = await User.findById(req.user._id);
        if(!user){
            let error = new Error("Invalid user ID.");
            error.statusCode = 404;
            next(error);
        }
    
        if(!(req.body.name)){
            let error = new Error("Name is required.");
            error.statusCode = 400;
            next(error);
        }
        
        user.name = req.body.name;
        await user.save();
        res.send(_.pick(user, ["_id", "name", "email"]));
    },

    deleteAccount: async function(req, res, next){
        const user = await User.findById(req.params.id);
        if(!user){
            let error = new Error("Invalid user ID.");
            error.statusCode = 400;
            return next(error);
        }
    
        if(!(String(user._id) === String(req.user._id)))
        {
            let error = new Error("You cannot delete this user.");
            error.statusCode = 403;
            return next(error);
        }
    
        await user.remove();
        res.send(_.pick(user, ['_id', 'name', 'email']));
    },
    
    forgot: async function(req, res, next) {
        const current_date = (new Date()).valueOf().toString();
        const random = Math.random().toString();
        const salt = await bcrypt.genSalt(10);
        let token = await bcrypt.hash(current_date + random, salt);
        token = token.replace("\/", "");
    
        let user = await User.findOne({ email: req.body.email });
        if (!user) {
            let err = new Error("No account with given email address exists");
            err.statusCode = 400;
            return next(err);
        }
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000;
    
        // send email
        let link = "https://" + req.hostname + "/api/users/reset/" + token;
        emailUtils.sendEmail('resetPasswordEmail', user.email, 'Reset Password', link, async (isSent) => {
            if(!isSent){
                let err = new Error("Could not send you email. Please try again later.");
                err.statusCode = 400;
                return next(err);
            }
        });
    
        await user.save();
        // res.header('PasswordResetToken', token).send(_.pick(user, ['_id', 'name', 'email']));
        return res.status(200).send("We've sent email to your email address, please check your inbox to reset your password");
    },
    
    resetToken: async function(req, res, next) {
        let user = await User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } });
        if (!user) {
            // let err = new Error("Password reset token is invalid or has expired.");
            // err.statusCode = 400;
            // return next(err);
            res.render('passwordResetFailure');
            return;
        }
        else{
            let submitURL = "https://" + req.hostname + "/api/users/reset";
            res.render('newPasswordPage', {formURL: submitURL, token: req.params.token});
        }
    },
    
    reset: async function(req, res ,next) {
        // console.log(req.body);
        console.log("req.body.token: " + req.body.token);
        console.log("req.body.password: " + req.body.password);
        let user = await User.findOne({ resetPasswordToken: req.body.token, resetPasswordExpires: { $gt: Date.now() } });
        if (!user) {
            res.render('passwordResetFailure');
            return;
        }
        const salt = await bcrypt.genSalt(10);
        user.local.password = await bcrypt.hash(req.body.password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
    
        // console.log("new password: " + req.body.password);
    
        await user.save();
        res.render('passwordResetSuccess');
    },

    register: async (req, res ,next) => {
        const {error} = validateUserRegistration(req.body);
        if(error) {
            let err = new Error(error.details[0].message);
            err.statusCode = 400;
            return next(err);
        }
    
        let user = await User.findOne({email: req.body.email});
        if(user) {
            let err = new Error("User with this email already exists.");
            err.statusCode = 400;
            return next(err);
        }
    
        // user = new User(_.pick(req.body, ['name', 'email', 'password']));
        user = new User({
            method: "local",
            active: false,
            name: req.body.name,
            email: req.body.email,
            local:{
                password: req.body.password
            }
        });
        const salt = await bcrypt.genSalt(10);
        user.local.password = await bcrypt.hash(user.local.password, salt);
    
        // create hash for db
        let confirmHash = await generateRandomHashForEmail();
        confirmHash = confirmHash.replace('\/', '');
        const confirmEmail = new ConfirmEmail({
            confirmHash: confirmHash, 
            userID: user._id
        });
    
        // console.log("USER: " + user);
    
        let link = "http://" + req.hostname + "/api/register/verifyemail/" + confirmHash;
        emailUtils.sendEmail('confirmEmail', user.email, 'Confirm Email', link, async (isSent) => {
            if(!isSent){
                let err = new Error("Could not send verification email. Please try again later.");
                err.statusCode = 400;
                return next(err);
            }else{
                await confirmEmail.save();
                await user.save();
                
                let endUser = _.pick(user, ['_id', 'active', 'method','name', 'email']);
                switch(endUser.method){
                    case 'google':
                        endUser.facebook = user.google;
                        break;
                    case 'facebook':
                        endUser.google = user.facebook;
                        break;
                }
                res.json(endUser);
            }
        });
    },
    
    // verifyemail for local registration
    verifyEmailLocalRegistration: async (req, res, next) => {
        const id = req.params.id; //req.query.id.toString();
        if(!id) {
            let err = new Error("No ID provided for verification.");
            err.statusCode = 400;
            return next(err);
        }
        
        const confirmHash = await ConfirmEmail.findOne({confirmHash: id});
        if(!confirmHash || confirmHash == {}){
            let err = new Error("ID for verification not found.");
            err.statusCode = 400;
            return next(err);
        }
        
        let user = await User.findById(confirmHash.userID);
        if(!user){
            let err = new Error("No user found with given ID.");
            err.statusCode = 400;
            return next(err);
        }
    
        user.active = true;
        await user.save();
        await ConfirmEmail.deleteOne({_id: confirmHash._id});
        res.send("Email verified.");
    },
    
    // google login/registration
    registerGoogle: async (req, res, next) => {
            // Generate token
            const user = new User(req.user);
            const token =  user.generateAuthToken(); //signToken(req.user);
            res.status(200).json({ token });
    },

    // facebook login/registration
    registerFacebook: async (req, res, next) => {
                const user = new User(req.user);
                const token = user.generateAuthToken();
                res.status(200).json({token});
    }
};

module.exports = Controller;