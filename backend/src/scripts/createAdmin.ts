import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

import User from "../models/User";

dotenv.config();

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI as string);

  const existingAdmin = await User.findOne({
    email: "admin@trustsphere.com",
  });

  if (existingAdmin) {
    console.log("Admin already exists");

    process.exit();
  }

  const password = await bcrypt.hash("admin123", 10);

  await User.create({
    name: "System Admin",

    email: "admin@trustsphere.com",

    password,

    role: "ADMIN",

    status: "ACTIVE",
  });

  console.log("Admin Created");

  process.exit();
}

createAdmin();
