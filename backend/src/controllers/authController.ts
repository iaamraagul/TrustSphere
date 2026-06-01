import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { createAuditLog } from "../services/auditService";
import { getIO } from "../sockets/socketServer";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role === "ADMIN" ? "ADMIN" : "USER",
      status: "ACTIVE",
    });

    await createAuditLog(user.name, "Register", user.email, {
      role: user.role,
    });

    return res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    });
  } catch (error) {
    console.error("Register controller crash:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (role && role !== user.role) {
      return res
        .status(403)
        .json({ message: "Selected role does not match this account" });
    }

    if (user.status === "BLOCKED") {
      return res.status(403).json({ message: "Account is blocked" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "1d" },
    );

    await createAuditLog(user.name, "Login", user.email, { ipAddress: req.ip });

    getIO().emit("notification", {
      message: `${user.name} logged in`,
    });

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login controller crash:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
