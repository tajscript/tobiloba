// lib/emailService.ts
import { Resend } from 'resend';

// Created on first use so a build without RESEND_API_KEY doesn't fail.
let client: Resend | null = null;
function resend() {
  client ??= new Resend(process.env.RESEND_API_KEY);
  return client;
}

// The sender must be on a domain verified in Resend (tobiadetimehin.com is).
const FROM = process.env.EMAIL_FROM || 'Tobi The Artist <hello@tobiadetimehin.com>';
// Comma-separated list of who gets notified.
const TO = (process.env.EMAIL_TO || 'hello@tobiadetimehin.com')
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

    const result = await resend().emails.send({
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

// Newsletter subscribers are also kept as contacts in a Resend audience so
// newsletters can be sent from Resend (Broadcasts), which adds the unsubscribe
// link. Uses RESEND_AUDIENCE_ID if set, otherwise the account's first audience.
let audienceId: string | null = process.env.RESEND_AUDIENCE_ID || null;

async function newsletterAudience() {
  if (audienceId) return audienceId;
  const { data, error } = await resend().audiences.list();
  if (error) throw new Error(error.message);
  audienceId = data?.data[0]?.id ?? null;
  if (!audienceId) throw new Error('No audience found in Resend');
  return audienceId;
}

/** Adds an address to the Resend newsletter audience. Returns false if Resend refused it. */
export async function addToNewsletter(email: string) {
  try {
    const { error } = await resend().contacts.create({ audienceId: await newsletterAudience(), email, unsubscribed: false });
    if (error) {
      console.error('Resend contact error:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Resend contact error:', error);
    return false;
  }
}

/** Removes an address from the Resend newsletter audience. */
export async function removeFromNewsletter(email: string) {
  try {
    const { error } = await resend().contacts.remove({ audienceId: await newsletterAudience(), email });
    if (error && error.name !== 'not_found') {
      console.error('Resend contact error:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Resend contact error:', error);
    return false;
  }
}
