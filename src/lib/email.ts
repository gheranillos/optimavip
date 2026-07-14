import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.EMAIL_FROM ?? "OPTIMA VIP <no-reply@optimavip.com>";

// Lazily instantiated; email is a no-op in local dev when no key is set.
const resend = apiKey ? new Resend(apiKey) : null;

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
};

export async function sendEmail({ to, subject, html, replyTo }: SendEmailInput) {
  if (!resend) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[email] RESEND_API_KEY not set — skipping send:", subject);
    }
    return { skipped: true as const };
  }

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject,
    html,
    replyTo,
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }
  return { id: data?.id };
}
