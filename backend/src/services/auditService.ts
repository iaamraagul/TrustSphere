import AuditLog from "../models/AuditLog";
import { getIO } from "../sockets/socketServer";

export const createAuditLog = async (
  actor: string,
  action: string,
  target: string,
  metadata?: object,
) => {
  try {
    const log = await (AuditLog as any).create({
      actor,
      action,
      target,
      metadata,
    });

    const safeLog = log.toObject();
    const io = getIO();

    if (io) {
      io.emit("audit:created", safeLog);
      io.emit("dashboard:changed", {
        scope: "audit",
        action,
      });
      io.emit("notification", {
        type: "info",
        message: `${action} recorded`,
      });
    }
  } catch (auditLogError) {
    console.error("Audit Log Error:", auditLogError);
  }
};
