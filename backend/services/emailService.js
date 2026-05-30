const nodemailer = require('nodemailer');
require('dotenv').config();

// Nodemailer left for legacy SMTP fallback if ever needed
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_KEY,
  },
});

exports.sendOTP = async (email, otp) => {
  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #0070f3; text-align: center;">Zenda Verification</h2>
      <p>Hello,</p>
      <p>Your verification code for Zenda is:</p>
      <div style="text-align: center; margin: 30px 0; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333;">
        ${otp}
      </div>
      <p>This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #888; text-align: center;">Zenda - Financing the future, bit by bit.</p>
    </div>
  `;
  return exports.sendEmail(email, 'Your Zenda Verification Code', `Your OTP is ${otp}`, htmlContent, otp);
};

exports.sendDeliveryOTP = async (email, orderId, otp) => {
  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #22c55e; text-align: center;">Delivery Confirmation Code</h2>
      <p>Hello,</p>
      <p>Your gadget is arriving! Please share the code below with the delivery agent to confirm receipt of your order <b>#${orderId.slice(0, 8)}</b>.</p>
      <div style="text-align: center; margin: 30px 0; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #166534; background: #f0fdf4; padding: 20px; border-radius: 15px;">
        ${otp}
      </div>
      <p style="color: #ef4444; font-weight: bold;">Only share this code when you have inspected and received your gadget.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #888; text-align: center;">Zenda - Financing the future, bit by bit.</p>
    </div>
  `;
  return exports.sendEmail(email, `Delivery Code for Order #${orderId.slice(0, 8)}`, `Your Delivery Code is ${otp}`, htmlContent, otp);
};

exports.sendEmail = async (to, subject, text, html, otp = null) => {
  try {
    // 3rd party mail APIs disabled for complete presentation independence
    console.log(`--- [SANDBOX EMAIL LOG] TO ${to} ---`);
    console.log(`Subject: ${subject}`);
    if (otp) console.log(`OTP Code: ${otp}`);
    console.log('------------------------------------');
    return { success: true, mock: true };
  } catch (error) {
    console.error('Email dispatch logging failed:', error.message);
    return { success: false, error: error.message };
  }
};


