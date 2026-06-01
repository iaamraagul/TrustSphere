import express from "express";

import {
  createVerification,
  getVerifications,
  processVerification,
} from "../controllers/verificationController";

import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", protect, createVerification);

router.get("/", protect, getVerifications);

router.post("/process", protect, processVerification);

export default router;
