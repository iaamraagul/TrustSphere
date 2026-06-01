import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["ADMIN", "USER"],
      default: "USER",
    },

    status: {
      type: String,
      default: "ACTIVE",
    },

    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.index({ createdAt: -1 });
userSchema.index({ role: 1, status: 1 });
userSchema.index({ name: "text", email: "text" });

export default mongoose.model("User", userSchema);
