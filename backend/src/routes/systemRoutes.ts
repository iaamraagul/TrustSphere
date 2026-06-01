import express from "express";

import { getSystemHealth } from "../controllers/systemController";

import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/health", protect, getSystemHealth);

export default router;
