const users = require('../routes/users');
const registration = require('../routes/registration');

module.exports = function(app){
    app.use('/api/users', users);
    app.use('/api/register', registration);
}