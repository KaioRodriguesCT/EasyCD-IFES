const nodemailer = require('nodemailer');

exports = module.exports = function emailHandler(settings) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: settings.email.user,
      pass: settings.email.password,
    },
  });

  const sendEmail = async ({
    to,
    subject,
    text,
  }) => {
    try {
      await transporter.sendMail({
        from: settings.email.user,
        to,
        subject,
        text,
      });
      console.log('Email sent successfully');
    } catch (e) {
      console.error('Error on sending email', e);
    }
  };

  return {
    sendEmail,
  };
};

exports['@singleton'] = true;
exports['@require'] = [
  'boot/settings',
];
