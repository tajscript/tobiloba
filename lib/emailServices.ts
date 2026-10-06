// lib/emailService.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailData {
  type: 'subscription' | 'contact';
  data: any;
}

export const sendNotificationEmail = async ({ type, data }: EmailData) => {
  try {
    let subject = '';
    let htmlContent = '';

    switch (type) {
      case 'subscription':
        subject = 'New Newsletter Subscription';
        htmlContent = `
          <h2>New Newsletter Subscription</h2>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Subscribed at:</strong> ${new Date().toLocaleString()}</p>
        `;
        break;

      case 'contact':
        subject = 'New Contact Form Submission';
        htmlContent = `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Receive Newsletters:</strong> ${data.receiveNewsletters}</p>
          <p><strong>Message:</strong></p>
          <p style="background-color: #f5f5f5; padding: 10px; border-radius: 5px;">${data.message}</p>
          <p><strong>Submitted at:</strong> ${new Date().toLocaleString()}</p>
        `;
        break;

    }

    const result = await resend.emails.send({
      from: 'Tobi The Artist <onboarding@resend.dev>',
      to: ['adeyinkx20@gmail.com', 'tobitheartist@gmail.com'],
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