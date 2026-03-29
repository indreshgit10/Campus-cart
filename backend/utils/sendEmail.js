import { Resend } from 'resend';

const sendEmail = async (options) => {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    console.warn("RESEND_API_KEY is missing! Simulating email send (Dev Mode)");
    console.log(`[SIMULATED EMAIL TO: ${options.email}] Subject: ${options.subject}`);
    return;
  }

  const resend = new Resend(resendApiKey);

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'CampusCart <onboarding@resend.dev>',
      to: options.email,
      subject: options.subject,
      html: options.html || `<p>${options.message}</p>`,
    });

    if (error) {
      console.error('RESEND ERROR:', error);
      throw new Error(`Email delivery failed: ${error.message}`);
    }

    console.log('Email sent successfully:', data.id);
  } catch (error) {
    console.error('CRITICAL EMAIL ERROR:', error);
    throw new Error(`Email delivery failed: ${error.message}`);
  }
};

export default sendEmail;
