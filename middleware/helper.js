require('dotenv').config();

const nodemailer = require('nodemailer');

const transport = nodemailer.createTransport({
  host: 'sandbox.smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASSWORD,
  },
});

async function sendEmail(message) {
  try {
    message.from = 'reshka201@gmail.com';

    const result = await transport.sendMail(message);
    console.log('Email sent:', result);

    return result;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
}

module.exports = sendEmail;