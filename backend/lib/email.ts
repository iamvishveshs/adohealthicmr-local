import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';

/**
 * Generate a 6-digit OTP
 */
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Verify Gmail connection
 */
export const verifyGmailConnection = async (): Promise<boolean> => {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_PASS;

  if (!gmailUser || !gmailPass) {
    console.warn('⚠️  Gmail credentials not configured.');
    console.log('   Add GMAIL_USER and GMAIL_PASS to .env.local');
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass.trim(), // Remove any whitespace
      },
    });

    await transporter.verify();
    console.log('✅ Gmail server is ready');
    return true;
  } catch (error: any) {
    console.error('❌ Gmail verification failed');
    if (error.code === 'EAUTH') {
      console.error('   Authentication failed. Common issues:');
      console.error('   1. App Password is incorrect');
      console.error('   2. 2-Step Verification not enabled');
      console.error('   3. App Password has spaces (remove them)');
      console.error('   4. Using regular password instead of App Password');
      console.error('\n   Get App Password: https://myaccount.google.com/apppasswords');
    } else {
      console.error('   Error:', error.message);
    }
    return false;
  }
};

/**
 * Send test email
 */
export const sendTestEmail = async (): Promise<void> => {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_PASS;

  if (!gmailUser || !gmailPass) {
    throw new Error('Gmail credentials not configured');
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailPass,
    },
  });

  await transporter.verify();
  console.log('✅ Gmail server is ready');

  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: process.env.GMAIL_USER,
    subject: 'Test Email - ADO Health ICMR',
    text: 'If you got this, Gmail works!',
    html: '<h2>Test Email</h2><p>If you got this, Gmail works!</p>',
  });

  console.log('✅ Test email sent successfully');
};

/**
 * Send OTP email using Gmail
 */
export const sendOTPEmail = async (email: string, otp: string): Promise<void> => {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_PASS; // App Password

  if (!gmailUser || !gmailPass) {
    console.warn('⚠️  Gmail credentials not configured. OTP will be logged to console.');
    console.log(`📧 OTP for ${email}: ${otp}`);
    throw new Error('Gmail credentials not configured');
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass.trim(), // App Password (remove whitespace)
      },
    });

    // Verify Gmail connection before sending
    await transporter.verify();
    console.log('✅ Gmail server is ready');
    console.log('📧 OTP:', otp);

    await transporter.sendMail({
      from: `"ADO Health ICMR" <${gmailUser}>`,
      to: email,
      subject: 'Your Login OTP - ADO Health ICMR',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Your Login OTP</h2>
          <p>Your OTP code is:</p>
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="color: #2563eb; font-size: 32px; margin: 0; letter-spacing: 4px;">${otp}</h1>
          </div>
          <p style="color: #6b7280;">This code will expire in <strong>10 minutes</strong>.</p>
          <p style="color: #6b7280;">If you did not request this code, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #9ca3af; font-size: 12px;">ADO Health ICMR - This is an automated message.</p>
        </div>
      `,
      text: `Your OTP code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you did not request this code, please ignore this email.`,
    });

    console.log(`✅ OTP email sent successfully to ${email}`);
  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    throw error;
  }
};

/**
 * Send notification email about an answer submission using SendGrid
 */
export const sendAnswerNotification = async (to: string, payload: {
  userId: string;
  moduleId: number;
  questionId: number;
  questionText?: string;
  answer: string;
  isCorrect?: boolean;
}): Promise<void> => {
  const sendgridApiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@adohealthicmr.com';

  if (!sendgridApiKey) {
    console.warn('SendGrid API key not configured — logging answer notification instead of sending');
    console.log('Answer notification:', { to, ...payload });
    return;
  }

  const subject = `New answer submitted by ${payload.userId}`;
  const correctness = payload.isCorrect === undefined ? 'Unknown' : payload.isCorrect ? 'Correct' : 'Incorrect';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>New Answer Submission</h2>
      <p><strong>User:</strong> ${payload.userId}</p>
      <p><strong>Module ID:</strong> ${payload.moduleId}</p>
      <p><strong>Question ID:</strong> ${payload.questionId}</p>
      ${payload.questionText ? `<p><strong>Question:</strong> ${payload.questionText}</p>` : ''}
      <p><strong>Answer:</strong> ${payload.answer}</p>
      <p><strong>Result:</strong> ${correctness}</p>
      <hr />
      <p style="color: #9ca3af; font-size: 12px;">This is an automated notification from ADO Health ICMR.</p>
    </div>
  `;

  const text = `New answer submitted by ${payload.userId}\nModule: ${payload.moduleId}\nQuestion: ${payload.questionId}\nAnswer: ${payload.answer}\nResult: ${correctness}`;

  try {
    sgMail.setApiKey(sendgridApiKey);
    await sgMail.send({
      to,
      from: fromEmail,
      subject,
      html,
      text,
    });
    console.log(`Answer notification sent to ${to} via SendGrid`);
  } catch (err) {
    console.error('Failed to send answer notification via SendGrid:', err);
  }
};
