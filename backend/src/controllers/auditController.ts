import { Request, Response } from "express";

import AuditLog from "../models/AuditLog";

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const page = Math.max(Number(req.query["page"]) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query["limit"]) || 25, 10), 100);
    const search = String(req.query["search"] || "").trim();
    const skip = (page - 1) * limit;

    const filter = search
      ? {
          $or: [
            { actor: { $regex: search, $options: "i" } },
            { action: { $regex: search, $options: "i" } },
            { target: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const [auditLogs, total] = await Promise.all([
      (AuditLog as any)
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      (AuditLog as any).countDocuments(filter),
    ]);

    res.set("Cache-Control", "private, max-age=10");
    res.json({
      items: auditLogs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};
