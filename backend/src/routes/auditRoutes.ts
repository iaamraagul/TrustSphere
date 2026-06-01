import express from "express";
import { protect } from "../middleware/authMiddleware";
import { getAuditLogs } from "../controllers/auditController";

const router = express.Router();

router.get("/", protect, getAuditLogs);

export default router;
