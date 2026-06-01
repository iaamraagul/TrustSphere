import mongoose from "mongoose";

const verificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    verificationType: {
      type: String,
      default: "Employment Verification",
    },

    status: {
      type: String,
      enum: [
        "QUEUED",
        "VALIDATING",
        "BACKGROUND_CHECK",
        "APPROVED",
        "REJECTED",
      ],
      default: "QUEUED",
    },

    confidenceScore: {
      type: Number,
      default: 85,
    },

    riskLevel: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "LOW",
    },

    remarks: {
      type: String,
      default: "Verification initiated",
    },

    processingTime: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

verificationSchema.index({ createdAt: -1 });
verificationSchema.index({ status: 1, createdAt: -1 });
verificationSchema.index({ riskLevel: 1, createdAt: -1 });

export default mongoose.model("Verification", verificationSchema);
