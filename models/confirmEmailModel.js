const mongoose = require('mongoose');
const joi = require('joi');
joi.objectId = require('joi-objectid')(joi);
const bcrypt = require('bcrypt');

const confirmEmailSchema = new mongoose.Schema({
    confirmHash: {
        type: String,
        required: true
    },
    userID : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
});

async function generateRandomHash(){
    const current_date = (new Date()).valueOf().toString();
    const random = Math.random().toString();
    const salt = await bcrypt.genSalt(10);
    let confirmHash = await bcrypt.hash(current_date + random, salt);
    confirmHash = confirmHash.replace("/", "");

    return confirmHash;
}

module.exports.ConfirmEmail = mongoose.model('EmailConfirmation', confirmEmailSchema);
module.exports.generateRandomHashForEmail = generateRandomHash;