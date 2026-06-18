import express from "express";
import cors from "cors";

import testRoutes from "./routers/testRoutes.js";
import authRoutes from "./routers/authRoutes.js";
import magicLinkRoutes from "./routers/magicLinkRoutes.js";
import propertyRoutes from "./routers/propertyRouters.js";
import studentDashboardRoutes from "./routers/studentDashboardRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

// Register routes
app.use("/api/test", testRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/magic-link", magicLinkRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/student-dashboard", studentDashboardRoutes);
app.get("/", (req, res) => {
  res.json({
    message: "HomeFind SU API Running",
  });
});

export default app;