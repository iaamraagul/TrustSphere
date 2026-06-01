import express from "express";
import User from "../models/User";
import Verification from "../models/Verification";
import AuditLog from "../models/AuditLog";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();
const metricCache = {
  expiresAt: 0,
  metrics: null as null | {
    users: number;
    verifications: number;
    pending: number;
    fraudAlerts: number;
  },
};

router.use(protect);

router.get("/metrics", async (req, res) => {
  const now = Date.now();

  if (metricCache.metrics && metricCache.expiresAt > now) {
    res.set("Cache-Control", "private, max-age=5");
    res.json(metricCache.metrics);
    return;
  }

  const [users, verifications, pending, fraudAlerts] = await Promise.all([
    User.estimatedDocumentCount(),
    Verification.estimatedDocumentCount(),
    Verification.countDocuments({
      status: { $in: ["QUEUED", "VALIDATING", "BACKGROUND_CHECK"] },
    }),
    Verification.countDocuments({ riskLevel: "HIGH" }),
  ]);

  metricCache.metrics = {
    users,
    verifications,
    pending,
    fraudAlerts,
  };
  metricCache.expiresAt = now + 5000;

  res.set("Cache-Control", "private, max-age=5");
  res.json(metricCache.metrics);
});

router.get("/analytics", async (req, res) => {
  res.json({
    monthly: [50, 70, 95, 120, 160, 190, 230],
  });
});

router.get("/activity", async (req, res) => {
  const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(6).lean();

  if (!logs.length) {
    res.json([
      {
        action: "User verification completed",
        time: "2 minutes ago",
      },
      {
        action: "Admin created a new account",
        time: "8 minutes ago",
      },
      {
        action: "Fraud alert triggered",
        time: "15 minutes ago",
      },
    ]);
    return;
  }

  res.json(
    logs.map((log: any) => ({
      action: log.action || log.message || "System event recorded",
      time: log.createdAt
        ? new Date(log.createdAt).toLocaleString()
        : "Recently",
    })),
  );
});

export default router;
