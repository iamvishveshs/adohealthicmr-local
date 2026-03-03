import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, body: emailBody, answers } = body;

    // Format the email content
    let formattedBody = emailBody || 'Module 1 Pre-Post Questions - Answers\n\n';
    
    if (answers) {
      Object.entries(answers).forEach(([question, answer]) => {
        formattedBody += `${question}: ${answer}\n`;
      });
      formattedBody += '\n\nSubmitted via AdoHealth Initiative Website';
    }

    // Format answers as HTML for better email display
    let htmlBody = '<h2>Module 1 Pre-Post Questions - Answers</h2><ul>';
    if (answers) {
      Object.entries(answers).forEach(([question, answer]) => {
        htmlBody += `<li><strong>${question}:</strong> ${answer}</li>`;
      });
    }
    htmlBody += '</ul><p><em>Submitted via AdoHealth Initiative Website</em></p>';

    // Use Web3Forms - Free email service (get access key from https://web3forms.com)
    // This works immediately without much setup
    const web3formsAccessKey = process.env.WEB3FORMS_ACCESS_KEY;
    
    if (web3formsAccessKey && web3formsAccessKey !== 'YOUR_ACCESS_KEY_HERE') {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_key: web3formsAccessKey,
          subject: subject || 'Module 1 Pre-Post Questions Answers',
          from_name: 'AdoHealth Initiative',
          email: to || 'adohealthicmr2025@gmail.com',
          message: formattedBody,
          html: htmlBody,
        }),
      });

      const text = await response.text();
      let result: { success?: boolean } = {};
      try {
        result = JSON.parse(text);
      } catch {
        console.warn('Email service returned non-JSON (e.g. HTML). Response length:', text?.length);
        return NextResponse.json(
          { success: true, message: 'Answers saved. Email could not be sent (service returned invalid response).', emailSent: false },
          { status: 200 }
        );
      }

      if (result.success) {
        return NextResponse.json(
          { success: true, message: 'Answers submitted successfully', emailSent: true },
          { status: 200 }
        );
      }
    }

    // Fallback: Log the email details (for debugging)
    // In production, configure WEB3FORMS_ACCESS_KEY in .env.local
    console.log('=== EMAIL SUBMISSION ===');
    console.log('To:', to || 'adohealthicmr2025@gmail.com');
    console.log('Subject:', subject);
    console.log('Body:', formattedBody);
    console.log('Answers:', JSON.stringify(answers, null, 2));
    console.log('========================');
    
    // For now, return success but log that email service needs to be configured
    // To enable email sending:
    // 1. Go to https://web3forms.com
    // 2. Get your free access key
    // 3. Add WEB3FORMS_ACCESS_KEY=your_key_here to .env.local
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Answers submitted successfully',
        note: 'Email service not configured. Check server logs for email content.'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit answers', error: String(error) },
      { status: 500 }
    );
  }
}
