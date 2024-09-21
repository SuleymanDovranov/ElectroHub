const nodemailer = require('nodemailer');

exports.sendMail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'planyyev@gmail.com',
      pass: 'password',
    },
  });

  // <adylmailer@gmail.com>
  const mailOptions = {
    from: `Messhur-Syyahat`,
    to: `${options.to}`,
    subject: 'Messhur-Syyahat Verification',
    text: `Your Verification Code: ${options.code}`,
  };

  await transporter.sendMail(mailOptions);
};
