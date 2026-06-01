import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User";
import dotenv from "dotenv";

dotenv.config();

async function seedAdmin() {
  await mongoose.connect(process.env.MONGO_URI!);

  const exists = await User.findOne({
    email: "admin@trustsphere.com",
  });

  if (exists) {
    console.log("Admin already exists");
    process.exit();
  }

  const password = await bcrypt.hash("admin123", 10);

  await User.create({
    name: "Super Admin",
    email: "admin@trustsphere.com",
    password,
    role: "ADMIN",
    status: "ACTIVE",
  });

  console.log("Admin created");
  process.exit();
}

seedAdmin();
