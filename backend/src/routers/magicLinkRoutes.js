import express from "express";
import { sendMagicLink, verifyMagicLink } from "../controllers/magicLinkController.js";

const router = express.Router();

router.post("/send", sendMagicLink);
router.get("/:token", verifyMagicLink);

export default router;