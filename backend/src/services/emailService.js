import { Resend } from "resend";

function createResendClient() {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }

  return new Resend(process.env.RESEND_API_KEY);
}

export const sendMagicLink = async (email, magicLink) => {
  try {
    const resend = createResendClient();

    if (!resend) {
      console.warn("RESEND_API_KEY is missing; skipping email send and logging the magic link instead.");
      console.log(`Magic link for ${email}: ${magicLink}`);
      return null;
    }

    const response = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Your HomeFind SU Login Link",
      html: `
        <h2>HomeFind SU</h2>
        <p>Click the link below to log in:</p>
        <a href="${magicLink}">
          Login to HomeFind SU
        </a>
      `,
    });

    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
};