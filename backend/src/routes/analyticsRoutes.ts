import express from "express";

import { getDashboardStats } from "../controllers/analyticsController";

import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/dashboard", protect, getDashboardStats);

export default router;
