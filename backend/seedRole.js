import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./OrderManagement/models/User.js";
import UserRole from "./OrderManagement/models/UserRole.js";

dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);

const run = async () => {
  const user = await User.findOne({ email: "admin@test.com" });

  if (!user) {
    console.log("User not found");
    process.exit();
  }

  const existing = await UserRole.findOne({ user: user._id });

  if (existing) {
    console.log("Role already exists");
    process.exit();
  }

  await UserRole.create({
    user: user._id,
    role: "admin",
    permissions: null,
    isActive: true
  });

  console.log("✅ Role assigned successfully");
  process.exit();
};

run();
