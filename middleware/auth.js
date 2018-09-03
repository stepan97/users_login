const jwt = require('jsonwebtoken');
const config = require('config');
const User = require('../models/UserModel');

module.exports = function(req, res, next){
    const token = req.header('x-auth-token');
    if(!token) {
        let err = new Error("No token provided");
        err.statusCode = 401;
        return next(err);
    }
    
    const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
    req.user = decoded;    

    next();
}