import nodemailer from 'nodemailer';

/**
 * Creates and returns a Nodemailer transporter instance configured for Gmail SMTP
 */
export const createTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: user.trim(),
      pass: pass.trim(),
    },
  });
};

/**
 * Base reusable email sender function
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML body
 * @param {string} [options.text] - Plain text fallback
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createTransporter();

    if (!transporter) {
      console.warn(
        `⚠️ [SkillSwap Email] EMAIL_USER or EMAIL_PASS is not configured in backend/.env. Simulated sending to: ${to} | Subject: "${subject}"`
      );
      return { success: false, notConfigured: true };
    }

    const mailOptions = {
      from: `"SkillSwap Platform" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: text || html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(),
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 [SkillSwap Email] Sent successfully to ${to} (Message ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ [SkillSwap Email] Error delivering email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Reusable HTML Email Wrapper Template
 */
const buildEmailTemplate = ({ title, preheader, contentHtml, footerNote }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #334155;
    }
    .wrapper {
      width: 100%;
      background-color: #f8fafc;
      padding: 30px 15px;
    }
    .container {
      max-width: 580px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 14px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .header {
      background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
      padding: 28px 24px;
      text-align: center;
      color: #ffffff;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .header p {
      margin: 6px 0 0;
      font-size: 13px;
      opacity: 0.9;
    }
    .body {
      padding: 32px 28px;
      font-size: 15px;
      line-height: 1.6;
    }
    .greeting {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 14px;
    }
    .otp-box {
      margin: 24px 0;
      padding: 20px;
      text-align: center;
      background: #f5f3ff;
      border: 2px dashed #7c3aed;
      border-radius: 10px;
    }
    .otp-code {
      font-size: 32px;
      font-weight: 800;
      letter-spacing: 6px;
      color: #7c3aed;
      font-family: monospace;
    }
    .otp-note {
      margin-top: 8px;
      font-size: 12px;
      color: #64748b;
    }
    .info-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
      margin: 18px 0;
    }
    .info-row {
      margin: 6px 0;
      font-size: 14px;
    }
    .info-label {
      font-weight: 600;
      color: #0f172a;
    }
    .btn {
      display: inline-block;
      padding: 12px 26px;
      background: #7c3aed;
      color: #ffffff !important;
      text-decoration: none;
      font-weight: 600;
      border-radius: 8px;
      margin-top: 14px;
    }
    .footer {
      background: #f1f5f9;
      padding: 20px 24px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
      border-top: 1px solid #e2e8f0;
    }
    .footer a {
      color: #7c3aed;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div style="display:none;font-size:1px;color:#333333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${preheader || ''}
  </div>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>SkillSwap</h1>
        <p>Student Skill Exchange Platform</p>
      </div>
      <div class="body">
        ${contentHtml}
      </div>
      <div class="footer">
        <p>${footerNote || 'This is an automated notification from SkillSwap. Please do not reply directly to this email.'}</p>
        <p>© ${new Date().getFullYear()} SkillSwap Community. Peer-to-Peer Student Learning.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

/**
 * 1. Send OTP for Registration / Email Verification
 */
export const sendVerificationEmail = async (email, name, otp) => {
  const contentHtml = `
    <div class="greeting">Hello ${name || 'Student'}!</div>
    <p>Thank you for signing up for <strong>SkillSwap</strong>, the student peer-to-peer skill exchange platform.</p>
    <p>To verify your email address and activate your account, please enter the following 6-digit One-Time Password (OTP):</p>
    
    <div class="otp-box">
      <div class="otp-code">${otp}</div>
      <div class="otp-note">⏱️ Valid for 5 minutes only. Never share this code with anyone.</div>
    </div>

    <p>If you did not attempt to sign up for SkillSwap, you can safely ignore this message.</p>
  `;

  return sendEmail({
    to: email,
    subject: 'Verify Your SkillSwap Account (OTP Code)',
    html: buildEmailTemplate({
      title: 'Verify Your SkillSwap Account',
      preheader: `Your verification code is ${otp}. Valid for 5 minutes.`,
      contentHtml,
    }),
  });
};

/**
 * 2. Send Welcome Email upon successful email verification
 */
export const sendWelcomeEmail = async (email, name) => {
  const contentHtml = `
    <div class="greeting">Welcome to SkillSwap, ${name || 'Fellow Learner'}! 🎉</div>
    <p>Your email address has been successfully verified, and your SkillSwap account is now active!</p>
    
    <p><strong>What is SkillSwap?</strong><br>
    SkillSwap is a collaborative student community where knowledge is shared without money. Trade your coding, design, language, or creative talents for skills you want to master.</p>

    <div class="info-card">
      <div class="info-row"><span class="info-label">🚀 What to do next:</span></div>
      <div class="info-row">• Complete your profile with the skills you can teach</div>
      <div class="info-row">• Explore skills offered by fellow students</div>
      <div class="info-row">• Send your first exchange proposal and start learning together</div>
    </div>

    <p>Thank you for being part of our student learning community. We're excited to see what skills you'll teach and learn!</p>

    <p style="margin-top: 24px;">Happy Swapping,<br><strong>The SkillSwap Team</strong></p>
  `;

  return sendEmail({
    to: email,
    subject: 'Welcome to SkillSwap!',
    html: buildEmailTemplate({
      title: 'Welcome to SkillSwap!',
      preheader: `Welcome to SkillSwap, ${name}! Your email is verified.`,
      contentHtml,
    }),
  });
};

/**
 * 3. Send OTP for Forgot Password
 */
export const sendPasswordResetEmail = async (email, name, otp) => {
  const contentHtml = `
    <div class="greeting">Hello ${name || 'there'},</div>
    <p>We received a request to reset your password on SkillSwap.</p>
    <p>Use the 6-digit verification code below to set up a new password:</p>

    <div class="otp-box">
      <div class="otp-code">${otp}</div>
      <div class="otp-note">⏱️ This code expires in 5 minutes.</div>
    </div>

    <p>If you didn't request a password reset, please ensure your account is secure. No changes have been made yet.</p>
  `;

  return sendEmail({
    to: email,
    subject: 'Your SkillSwap Password Reset Code',
    html: buildEmailTemplate({
      title: 'Reset Your SkillSwap Password',
      preheader: `Your password reset code is ${otp}. Valid for 5 minutes.`,
      contentHtml,
    }),
  });
};

/**
 * 4. Send Notification: New Skill Exchange Request
 */
export const sendExchangeRequestEmail = async (
  recipientEmail,
  recipientName,
  senderName,
  skillOffered,
  skillRequested,
  message
) => {
  const contentHtml = `
    <div class="greeting">Hello ${recipientName || 'Student'}!</div>
    <p>Great news! <strong>${senderName}</strong> has sent you a new skill exchange request on SkillSwap.</p>

    <div class="info-card">
      <div class="info-row"><span class="info-label">👤 From:</span> ${senderName}</div>
      <div class="info-row"><span class="info-label">💡 Skill Offered to You:</span> ${skillOffered}</div>
      <div class="info-row"><span class="info-label">🎯 Skill Requested from You:</span> ${skillRequested}</div>
      ${
        message
          ? `<div class="info-row" style="margin-top: 10px; font-style: italic; color: #475569;"><span class="info-label" style="font-style: normal;">💬 Note:</span> "${message}"</div>`
          : ''
      }
    </div>

    <p>Please log in to SkillSwap to review this request and decide whether to accept or decline the swap!</p>
  `;

  return sendEmail({
    to: recipientEmail,
    subject: 'New Skill Exchange Request',
    html: buildEmailTemplate({
      title: 'New Skill Exchange Request',
      preheader: `${senderName} wants to swap skills with you!`,
      contentHtml,
    }),
  });
};

/**
 * 5. Send Notification: Exchange Request Accepted
 */
export const sendRequestAcceptedEmail = async (
  senderEmail,
  senderName,
  accepterName,
  skillOffered,
  skillRequested
) => {
  const contentHtml = `
    <div class="greeting">Awesome news, ${senderName}! 🎉</div>
    <p><strong>${accepterName}</strong> has accepted your skill exchange request!</p>

    <div class="info-card">
      <div class="info-row"><span class="info-label">🤝 Exchange Partner:</span> ${accepterName}</div>
      <div class="info-row"><span class="info-label">💡 You will teach:</span> ${skillOffered}</div>
      <div class="info-row"><span class="info-label">🎯 You will learn:</span> ${skillRequested}</div>
    </div>

    <p>Your real-time chat room with ${accepterName} is now unlocked on SkillSwap! Log in anytime to message them, schedule your learning sessions, and start swapping skills.</p>
  `;

  return sendEmail({
    to: senderEmail,
    subject: 'Your Skill Exchange Request Was Accepted',
    html: buildEmailTemplate({
      title: 'Your Skill Exchange Request Was Accepted',
      preheader: `${accepterName} accepted your skill exchange request!`,
      contentHtml,
    }),
  });
};

/**
 * 6. Send Notification: Exchange Request Rejected
 */
export const sendRequestRejectedEmail = async (
  senderEmail,
  senderName,
  rejecterName,
  skillOffered,
  skillRequested
) => {
  const contentHtml = `
    <div class="greeting">Hello ${senderName},</div>
    <p>Your skill exchange request with <strong>${rejecterName}</strong> for <em>${skillOffered}</em> ↔ <em>${skillRequested}</em> was not accepted at this time.</p>

    <p>Don't be discouraged! There are many other talented students across the SkillSwap community eager to trade knowledge. Check out the Explore page to find new learning partners.</p>
  `;

  return sendEmail({
    to: senderEmail,
    subject: 'Your Skill Exchange Request Was Rejected',
    html: buildEmailTemplate({
      title: 'Your Skill Exchange Request Was Rejected',
      preheader: `Update on your skill exchange request with ${rejecterName}.`,
      contentHtml,
    }),
  });
};
