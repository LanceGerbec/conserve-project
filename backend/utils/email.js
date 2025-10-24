// utils/email.js
// Purpose: Send email notifications

const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS // Use App Password, not regular password
    }
  });
};

// Send email when research is approved
exports.sendApprovalEmail = async (userEmail, researchTitle) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Research Approved - ConServe',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e3a8a;">Research Approved!</h2>
          <p>Congratulations! Your research paper has been approved and is now published on ConServe.</p>
          <p><strong>Title:</strong> ${researchTitle}</p>
          <p>You can now view your research on the ConServe platform.</p>
          <p style="color: #666; font-size: 12px;">This is an automated message from ConServe - NEUST College of Nursing Research Repository</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Approval email sent to:', userEmail);
  } catch (error) {
    console.error('❌ Email sending failed:', error);
  }
};

// Send email when research is rejected
exports.sendRejectionEmail = async (userEmail, researchTitle, reason) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Research Review Update - ConServe',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e3a8a;">Research Review Update</h2>
          <p>Thank you for submitting your research to ConServe.</p>
          <p><strong>Title:</strong> ${researchTitle}</p>
          <p><strong>Status:</strong> Requires Revision</p>
          <p><strong>Reviewer Notes:</strong></p>
          <p style="background: #f3f4f6; padding: 15px; border-radius: 5px;">${reason}</p>
          <p>Please make the necessary revisions and resubmit your research.</p>
          <p style="color: #666; font-size: 12px;">This is an automated message from ConServe - NEUST College of Nursing Research Repository</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Review email sent to:', userEmail);
  } catch (error) {
    console.error('❌ Email sending failed:', error);
  }
};

// Welcome email for new users
exports.sendWelcomeEmail = async (userEmail, userName) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Welcome to ConServe!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e3a8a;">Welcome to ConServe!</h2>
          <p>Hello ${userName},</p>
          <p>Thank you for joining ConServe - NEUST College of Nursing Research Repository.</p>
          <p>You can now:</p>
          <ul>
            <li>Browse nursing research papers</li>
            <li>Bookmark your favorite research</li>
            <li>Submit your own research for publication</li>
            <li>Access citation tools</li>
          </ul>
          <p>Happy researching!</p>
          <p style="color: #666; font-size: 12px;">ConServe - NEUST College of Nursing</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent to:', userEmail);
  } catch (error) {
    console.error('❌ Email sending failed:', error);
  }
};