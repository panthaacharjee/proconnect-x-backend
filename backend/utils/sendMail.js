const nodemailer = require("nodemailer");

const sendMail = async (options) => {
  const transpoter = nodemailer.createTransport({
    service: process.env.SMTP_SERVICE,
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });
  const mailOption = {
    from: process.env.SMTP_SERVICE,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  await transpoter.sendMail(mailOption);
};
module.exports = sendMail;
