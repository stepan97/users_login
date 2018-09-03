const mongoose = require('mongoose');
const config = require('config');
const winston = require('winston');

module.exports = function(){
    mongoose.connect(config.get('dbConStr').toString(), {useNewUrlParser: true})
        .then(winston.info("connected to db."));
}