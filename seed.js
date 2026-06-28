import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDb } from "./config/db.js";
import { Admin } from "./models/Admin.js";

async function seed() {
  await connectDb();

  const existing = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
  if (existing) {
    console.log("Admin already exists, skipping seed.");
    await mongoose.disconnect();
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);

  await Admin.create({
    username: "admin",
    email: process.env.ADMIN_EMAIL,
    password: hashedPassword,
  });

  console.log("Default admin created:");
  console.log(`  Email: ${process.env.ADMIN_EMAIL}`);
  console.log(`  Password: ${process.env.ADMIN_PASSWORD}`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
