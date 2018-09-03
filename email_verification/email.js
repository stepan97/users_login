
// const ConfirmationHtml = 
var EmailUtil = {
    sendEmail: function(template, to, subject, link, callback){
      console.log("Trying to send email:" + to);
        let mailer = require('../index');
        mailer.send(template, {
            to: to, // REQUIRED. This can be a comma delimited string just like a normal email to field. 
            subject: subject, // REQUIRED.
            otherProperty: 'Other Property', // All additional properties are also passed to the template as local variables.
            linkToActivate: link
          }, function (err) {
            if (err) {
              console.log("ERROR ON SENDING EMAIL: " + err);
              // res.send('There was an error sending the email');
              callback(false);
              return;
            }
            // res.send('Email Sent');
            callback(true);
          });
    }
};

module.exports = EmailUtil;