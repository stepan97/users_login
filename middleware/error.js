const winston = require('winston');

module.exports = function(err, req, res, next){
    if(!err.statusCode) err.statusCode = 500;
    if(!err.message) err.message = "Internal Server Error";
    
    winston.error(err.message, err);
    
    res.status(err.statusCode).send(err.message);
}