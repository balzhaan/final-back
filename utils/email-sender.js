const nodemailer = require('nodemailer');
const emailConfig = require('../config/email');
 
const transporter = nodemailer.createTransport(emailConfig);

const sendWelcomeEmail = (email, firstName) => {

  const message = {
    from: emailConfig.auth.user,
    to: email,
    subject: 'Welcome to the Portfolio Platform!',
    text: `Hello ${firstName},\n\nWelcome to our platform! We are glad to have you on board.`,
  };
  
  transporter.sendMail(message, (error, info) => {
    if (error) {
      console.error('Error sending welcome email:', error);
    } else {
      console.log('Welcome email sent:', info.response);
    }
  });
};

const sendFailedLoginNotification = (email) => {
  const message = {
    to: email,
    subject: 'Failed Login Attempts Alert',
    text: 'We noticed multiple failed login attempts on your account. If this was not you, please secure your account.',
  };

  transporter.sendMail(message, (error, info) => {
    if (error) {
      console.error('Error sending failed login email:', error);
    } else {
      console.log('Login Failed email sent:', info.response);
    }
  });
}

module.exports = { sendWelcomeEmail, sendFailedLoginNotification };