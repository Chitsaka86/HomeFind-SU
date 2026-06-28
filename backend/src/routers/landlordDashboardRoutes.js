
import express from "express";
import { getLandlordDashboard } from "../controllers/landlordDashboardController.js";

const router = express.Router();

router.get("/", getLandlordDashboard);

export default router;
