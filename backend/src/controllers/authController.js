import { v4 as uuidv4 } from "uuid";
import { sendMagicLink } from "../services/emailService.js";

function buildFrontendUrl(pathname) {
  const baseUrl = process.env.FRONTEND_URL || "http://localhost:5175";
  return new URL(pathname, baseUrl).toString();
}

export const login = async (req, res) => {
  try {
    const { email } = req.body;

    const token = uuidv4();

    const magicLink = buildFrontendUrl(`/auth/verify?token=${token}`);

    await sendMagicLink(email, magicLink);

    res.status(200).json({
      message: "Magic link sent successfully",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to send magic link",
    });
  }
};