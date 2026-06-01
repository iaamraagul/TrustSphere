import { Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import { AuthRequest } from "../middleware/authMiddleware";
import { createAuditLog } from "../services/auditService";
import { getIO } from "../sockets/socketServer";

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const page = Math.max(Number(req.query["page"]) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query["limit"]) || 20, 5), 100);
    const search = String(req.query["search"] || "").trim();
    const skip = (page - 1) * limit;

    const filter = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { role: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    res.set("Cache-Control", "private, max-age=10");
    res.json({
      items: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (error) {
    console.error("Get users failed:", error);
    res.status(500).json({ message: "Failed to retrieve users" });
  }
};

export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const password = req.body.password || `${req.body.name || "Trust"}@12345`;

    const user = await User.create({
      ...req.body,
      password: await bcrypt.hash(password, 10),
    });

    const safeUser = user.toObject() as any;
    delete safeUser.password;

    await createAuditLog(
      req.user?.role || "ADMIN",
      "USER_CREATED",
      user.email,
      {
        userId: user._id,
        role: user.role,
      },
    );
    getIO()?.emit("users:changed", { action: "created", user: safeUser });

    res.status(201).json(safeUser);
  } catch (error: any) {
    if (error?.code === 11000) {
      res.status(409).json({ message: "Email already exists" });
      return;
    }

    console.error("Create user failed:", error);
    res.status(500).json({ message: "Failed to create user" });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const updatePayload = { ...req.body };

    if (updatePayload.password) {
      updatePayload.password = await bcrypt.hash(updatePayload.password, 10);
    } else {
      delete updatePayload.password;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updatePayload, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    await createAuditLog(
      req.user?.role || "ADMIN",
      "USER_UPDATED",
      user.email,
      {
        userId: user._id,
      },
    );
    getIO()?.emit("users:changed", { action: "updated", user });

    res.json(user);
  } catch (error) {
    console.error("Update user failed:", error);
    res.status(500).json({ message: "Failed to update user" });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id).select(
      "-password",
    );

    if (!deleted) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    await createAuditLog(
      req.user?.role || "ADMIN",
      "USER_DELETED",
      deleted.email,
      {
        userId: deleted._id,
      },
    );
    getIO()?.emit("users:changed", { action: "deleted", id: req.params.id });

    res.json({
      success: true,
    });
  } catch (error) {
    console.error("Delete user failed:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
};
