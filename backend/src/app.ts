import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import http from "http";

import authRoutes from "./routes/authRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import userRoutes from "./routes/userRoutes";
import auditRoutes from "./routes/auditRoutes";
import { initSocket } from "./sockets/socketServer";

dotenv.config();

const allowedOrigins = [
  "http://localhost:4200",
  "https://trust-sphere-vert.vercel.app",
  ...(process.env.CLIENT_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
];

const isAllowedOrigin = (origin?: string): boolean => {
  if (!origin) {
    return true;
  }

  if (allowedOrigins.includes(origin)) {
    return true;
  }

  try {
    const { hostname } = new URL(origin);
    return hostname === "vercel.app" || hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
};

const app = express();
const server = http.createServer(app);
initSocket(server, isAllowedOrigin);

app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, isAllowedOrigin(origin));
    },
    credentials: true,
  }),
);
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    service: "trustsphere-api",
    health: "/api/health",
  });
});

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "trustsphere-api",
    uptime: process.uptime(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);
app.use("/api/audit", auditRoutes);

mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => {
    console.log("MongoDB Connected");
    server.listen(process.env.PORT || 5000, () => {
      console.log("Server running");
    });
  })
  .catch((startupError) => {
    console.error(startupError);
  });
