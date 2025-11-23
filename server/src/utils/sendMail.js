import { Resend } from "resend";
import { queueMail } from "../queue/mailQueue.js";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOtpMail(to, name, otpCode) {
  const subject = "OTP Code for MyGradway";
  const emailHtml = getMessage(name, otpCode);
  await queueMail({ to, subject, html: emailHtml, type: "otp" }, 1);
  return true;
}

export async function sendPasswordResetMail(to, name, token) {
  const emailHtml = getResetPasswordMessage(name, token);
  const subject = "Reset Password for MyGradway";
  await queueMail({ to, subject, html: emailHtml, type: "password_reset" }, 1);
  return true;
}

export async function sendContactMail(to, name) {
  const emailHtml = getContactThankYouMessage(name);
  const subject = "Thank you for contacting us";
  await queueMail({ to, subject, html: emailHtml, type: "contact" }, 5);
  return true;
}

export async function sendEmail(to,subject,html){
  const { data, error } = await resend.emails.send({
    from: "MyGradway <notifications@updates.mygradway.com>",
    to: [to],
    subject: subject,
    html: html,
  });
  if (error) {
    
    return false;
  }
  return true;
}

function getMessage(name, otpCode) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>OTP Email – MyGradway</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', sans-serif;
      background-color: #f4f6f8;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(to right, #007bff, #00c6ff);
      color: #ffffff;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      letter-spacing: 1px;
    }
    .header p {
      margin: 5px 0 0;
      font-size: 14px;
      opacity: 0.9;
    }
    .content {
      padding: 30px;
      font-size: 16px;
      line-height: 1.6;
    }
    .otp-box {
      text-align: center;
      margin: 30px 0;
      padding: 20px;
      background-color: #f0f4ff;
      border-radius: 8px;
      font-size: 24px;
      font-weight: bold;
      letter-spacing: 5px;
      color: #007bff;
    }
    .footer {
      padding: 20px 30px;
      font-size: 14px;
      color: #777;
      background-color: #f9fafc;
      text-align: center;
    }
    .footer a {
      color: #007bff;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>MyGradway</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${name}</strong>,</p>
      <p>You're just one step away from securing access to your MyGradway account.</p>
      <p>Please use the One-Time Password (OTP) below to proceed:</p>
      <div class="otp-box">
        ${otpCode}
      </div>
      <p>This OTP is valid for the next <strong>10 minutes</strong>.</p>
      <p>If you didn’t request this, you can safely ignore this email. Your account is secure.</p>
    </div>
    <div class="footer">
      Need help? Contact us at <a href="mailto:support@mygradway.com">support@mygradway.com</a><br/><br/>
      &copy; 2025 MyGradway | <a href="https://mygradway.com">www.mygradway.com</a>
    </div>
  </div>
</body>
</html>

`;
}

function getResetPasswordMessage(name, token) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Password Reset – MyGradway</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', sans-serif;
      background-color: #f4f6f8;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(to right, #007bff, #00c6ff);
      color: #ffffff;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      letter-spacing: 1px;
    }
    .header p {
      margin: 5px 0 0;
      font-size: 14px;
      opacity: 0.9;
    }
    .content {
      padding: 30px;
      font-size: 16px;
      line-height: 1.6;
    }
    .reset-button {
      display: inline-block;
      margin: 30px 0;
      padding: 12px 24px;
      background-color: #007bff;
      color: #ffffff !important;
      text-decoration: none;
      font-size: 16px;
      font-weight: bold;
      border-radius: 6px;
    }
    .footer {
      padding: 20px 30px;
      font-size: 14px;
      color: #777;
      background-color: #f9fafc;
      text-align: center;
    }
    .footer a {
      color: #007bff;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>MyGradway</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${name}</strong>,</p>
      <p>We received a request to reset your MyGradway account password.</p>
      <p>You can reset it by clicking the button below:</p>
      <p style="text-align: center;">
        <a href="https://mygradway.com/reset-password?token=${token}" class="reset-button">Reset Password</a>
      </p>
      <p>If you didn't request this, you can safely ignore this email.</p>
      <p>This link is valid for the next <strong>30 minutes</strong>.</p>
    </div>
    <div class="footer">
      Need help? Contact us at <a href="mailto:support@mygradway.com">support@mygradway.com</a><br/><br/>
      &copy; 2025 MyGradway | <a href="https://mygradway.com">www.mygradway.com</a>
    </div>
  </div>
</body>
</html>
`;
}

function getContactThankYouMessage(name) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Thank You – MyGradway</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', sans-serif;
      background-color: #f4f6f8;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(to right, #007bff, #00c6ff);
      color: #ffffff;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      letter-spacing: 1px;
    }
    .content {
      padding: 30px;
      font-size: 16px;
      line-height: 1.6;
    }
    .footer {
      padding: 20px 30px;
      font-size: 14px;
      color: #777;
      background-color: #f9fafc;
      text-align: center;
    }
    .footer a {
      color: #007bff;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>MyGradway</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${name}</strong>,</p>
      <p>Thank you for reaching out to us!</p>
      <p>We’ve received your message and our support team will get back to you within <strong>24 hours</strong>.</p>
      <p>We appreciate your patience and look forward to assisting you.</p>
      <p>If your query is urgent, feel free to contact us directly at <a href="mailto:support@mygradway.com">support@mygradway.com</a>.</p>
      <p>Warm regards,<br/><strong>The MyGradway Team</strong></p>
    </div>
    <div class="footer">
      &copy; 2025 MyGradway | <a href="https://mygradway.com">www.mygradway.com</a>
    </div>
  </div>
</body>
</html>`;
}
