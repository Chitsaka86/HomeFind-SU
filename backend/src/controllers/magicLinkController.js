import crypto from "node:crypto";
import nodemailer from "nodemailer";

const magicLinks = new Map();
const MAGIC_LINK_TTL_MS = 15 * 60 * 1000;

function buildFrontendUrl(pathname) {
  const baseUrl = process.env.FRONTEND_URL || "http://localhost:5175";
  return new URL(pathname, baseUrl).toString();
}

function buildBackendUrl(pathname) {
  const baseUrl = process.env.BACKEND_URL || "http://localhost:5000";
  return new URL(pathname, baseUrl).toString();
}

function createTransporter() {
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;

  if (!smtpHost || !smtpUser || !process.env.SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE).toLowerCase() === "true",
    auth: {
      user: smtpUser,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendViaResend({ to, from, subject, html, text }) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY is missing." };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html,
      text,
    }),
  });

  if (!response.ok) {
    let message = "Resend email request failed.";
    try {
      const data = await response.json();
      message = data?.message || data?.error || message;
    } catch {
      // Keep the default message when Resend returns non-JSON.
    }
    return { ok: false, error: message };
  }

  return { ok: true };
}

export const sendMagicLink = async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({ message: "Email and role are required." });
    }

    if (!["student", "landlord"].includes(role)) {
      return res.status(400).json({ message: "Invalid role." });
    }

    const token = crypto.randomUUID();
    const expiresAt = Date.now() + MAGIC_LINK_TTL_MS;

    magicLinks.set(token, { email, role, expiresAt });

    const magicLink = buildBackendUrl(`/api/magic-link/${token}`);
    const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;
    const subject = "Your HomeFind SU magic link";
    const text = `Use this link to sign in as a ${role}: ${magicLink}`;
    const html = `<p>Use this link to sign in as a <strong>${role}</strong>:</p><p><a href="${magicLink}">${magicLink}</a></p><p>This link expires in 15 minutes.</p>`;
    const transporter = createTransporter();

    if (transporter) {
      await transporter.verify();
      await transporter.sendMail({
        from: fromAddress,
        to: email,
        subject,
        text,
        html,
      });
    } else if (process.env.RESEND_API_KEY) {
      const resendResult = await sendViaResend({
        to: email,
        from: fromAddress || "onboarding@resend.dev",
        subject,
        html,
        text,
      });

      if (!resendResult.ok) {
        return res.status(500).json({
          message: resendResult.error,
        });
      }
    } else {
      return res.status(500).json({
        message: "Email is not configured. Add SMTP settings or RESEND_API_KEY in backend/.env.",
      });
    }

    return res.status(200).json({
      message: "Magic link sent successfully.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Unable to send magic link right now." });
  }
};

export const verifyMagicLink = (req, res) => {
  const { token } = req.params;
  const link = magicLinks.get(token);

  if (!link) {
    return res.status(400).json({ message: "Invalid or expired magic link." });
  }

  if (Date.now() > link.expiresAt) {
    magicLinks.delete(token);
    return res.status(400).json({ message: "Invalid or expired magic link." });
  }

  magicLinks.delete(token);

  const redirectPath = link.role === "landlord" ? "/landlord-dashboard" : "/student-dashboard";
  return res.redirect(buildFrontendUrl(redirectPath));
};