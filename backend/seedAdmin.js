import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

mongoose.connect(process.env.MONGODB_URI);

const seedAdmin = async ()=>{
  const exists = await User.findOne({role:"admin"});

  if(exists){
    console.log("Admin already exists");
    process.exit();
  }

  const admin = await User.create({
    name:"Super Admin",
    email:"admin@test.com",
    passwordHash:"123456",
    role:"admin"
  });

  console.log("Admin created:");
  console.log("Email: admin@test.com");
  console.log("Password: 123456");

  process.exit();
};

seedAdmin();
