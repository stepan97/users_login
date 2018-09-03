require('express-async-errors');
const config = require('config');
const winston = require('winston');
const express = require('express');
const error = require('./middleware/error');
let mailer = require('express-mailer');
const bodyParser = require('body-parser');

const app = express();

process.on('uncaughtException', (ex) => {
    winston.error(ex.message, ex);
    process.exit(1);
});

process.on('unhandledRejection', (ex) => {
    winston.error(ex.message, ex);
    process.exit(1);
});

winston.add(winston.transports.File, {filename: "logfile.log"});

app.use(express.json());
app.use(bodyParser.urlencoded({extended:false}));
require('./startup/config')();
require('./startup/db')();
require('./startup/passport')();
require('./startup/routes')(app);
require('./startup/prod')(app);

mailer.extend(app, {
    from: 'no-reply@userlogin.com',
    host: 'smtp.sendgrid.net', // hostname
    secureConnection: true, // use SSL
    port: 465, // port for secure SMTP
    transportMethod: 'SMTP', // default is SMTP. Accepts anything that nodemailer accepts
    auth: {
        user: config.get('mySendgridApiKey'),
        pass: config.get('mySendgridPassword')
    }
});

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(error);

const port = process.env.PORT || 3000;
app.listen(port, () => {console.log("Listening on port: " + port)});

module.exports = app.mailer;