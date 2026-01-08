import nodemailer from 'nodemailer';
import config from '../config/config.js';

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: false,
  auth: {
    user: config.email.user,
    pass: config.email.password
  }
});

export const sendEmail = async (options) => {
  const mailOptions = {
    from: `Omarey <${config.email.user}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html
  };

  try {
    await transporter.sendMail(mailOptions);
    if ( config.nodeEnv === 'development' ) console.log('Email sent successfully');
  } catch (error) {
    console.error('Email error:', error);
  }
};