import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    actor: String,
    action: String,
    target: String,
    metadata: Object,
  },
  {
    timestamps: true,
  },
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ actor: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ actor: "text", action: "text", target: "text" });

export default mongoose.models.AuditLog ||
  mongoose.model("AuditLog", auditLogSchema, "audits");
