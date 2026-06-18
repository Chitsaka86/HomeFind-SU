import express from "express";
import { getStudentDashboard } from "../controllers/studentDashboardController.js";

const router = express.Router();

router.get("/", getStudentDashboard);

export default router;