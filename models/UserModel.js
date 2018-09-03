const mongoose = require('mongoose');
const joi = require('joi');
const jwt = require('jsonwebtoken');
const config = require('config');

const userSchema = new mongoose.Schema({
    method:{
        type: String,
        enum: ['local', 'google', 'facebook'],
        required: true
    },
    name: {
        type: String,
    },
    email:{
        type: String
    },
    local:{
        password: {
            type: String,
            minlength: 6,
            maxlength: 1024
        }
    },
    google:{
        id: {
            type: String
        }
    },
    facebook:{
        id: {
            type: String
        }
    },
    active: {
        type: Boolean,
        required: true,
        default: false
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    }
});

userSchema.methods.generateAuthToken = function() { 
    const token = jwt.sign(
        { _id: this._id, name: this.name, email: this.email },
        config.get('jwtPrivateKey')
    );
    
    return token;
}


  function validateUserRegistration(user){
    const schema = {
        name: joi.string().min(5).max(25).required(),
        email: joi.string().required().email(),
        password: joi.string().min(6).max(1024).required()
    }

    return joi.validate(user, schema);
}

function validateUserLogin(user){
    const schema = {
        email: joi.string().required().email(),
        password: joi.string().min(6).max(1024).required()
    }

    return joi.validate(user, schema);
}

module.exports.User = mongoose.model('User', userSchema);
module.exports.validateUserRegistration = validateUserRegistration;
module.exports.validateUserForLogin = validateUserLogin;