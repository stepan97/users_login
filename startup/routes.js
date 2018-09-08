const users = require('../routes/users');
const registration = require('../routes/registration');
const todos = require('../routes/todos');

module.exports = function(app){
    app.use('/api/users', users);
    app.use('/api/register', registration);
    app.use('/api/todos', todos);
}