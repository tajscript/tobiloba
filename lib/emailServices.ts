// lib/emailService.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Resend's shared onboarding@resend.dev sender can only deliver to the email
// address that owns the Resend account; any other recipient makes the whole
// send fail. Once a domain is verified in Resend, set EMAIL_FROM to an address
// on it (e.g. "Tobi The Artist <hello@tobiadetimehin.com>").
const FROM = process.env.EMAIL_FROM || 'Tobi The Artist <onboarding@resend.dev>';
// Comma-separated list of who gets notified.
const TO = (process.env.EMAIL_TO || 'adeyinkx20@gmail.com,tobitheartist@gmail.com')
  .split(',')
  .map((address) => address.trim())
  .filter(Boolean);

interface EmailData {
  type: 'subscription' | 'contact';
  data: any;
}

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export const sendNotificationEmail = async ({ type, data }: EmailData) => {
  try {
    let subject = '';
    let htmlContent = '';
    let replyTo: string | undefined;

    switch (type) {
      case 'subscription':
        subject = 'New Newsletter Subscription';
        htmlContent = `
          <h2>New Newsletter Subscription</h2>
          <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
          <p><strong>Subscribed at:</strong> ${new Date().toLocaleString()}</p>
        `;
        break;

      case 'contact':
        subject = 'New Contact Form Submission';
        replyTo = data.email;
        htmlContent = `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${escapeHtml(data.firstName)} ${escapeHtml(data.lastName)}</p>
          <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
          <p><strong>Receive Newsletters:</strong> ${escapeHtml(data.receiveNewsletters)}</p>
          <p><strong>Message:</strong></p>
          <p style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; white-space: pre-wrap;">${escapeHtml(data.message)}</p>
          <p><strong>Submitted at:</strong> ${new Date().toLocaleString()}</p>
        `;
        break;

    }

    const result = await resend.emails.send({
      from: FROM,
      to: TO,
      replyTo,
      subject,
      html: htmlContent,
    });

    // Resend reports rejected sends in the result instead of throwing.
    if (result.error) {
      console.error('Email sending error:', result.error);
      return { success: false, error: result.error };
    }

    return { success: true, result };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error };
  }
};
