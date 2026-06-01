import mongoose from "mongoose";

const auditSchema = new mongoose.Schema(
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

auditSchema.index({ createdAt: -1 });
auditSchema.index({ actor: 1, createdAt: -1 });
auditSchema.index({ action: 1, createdAt: -1 });

export default mongoose.models.Audit || mongoose.model("Audit", auditSchema);
