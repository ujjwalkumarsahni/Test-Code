import User from "../models/User.js";
import jwt from "jsonwebtoken";

/* ================= REGISTER ================= */

export const register = async (req,res)=>{
  try{
    const { name,email,password,role } = req.body;

    if(!name || !email || !password){
      return res.status(400).json({message:"All fields required"});
    }

    const exists = await User.findOne({email});
    if(exists){
      return res.status(400).json({message:"Email already exists"});
    }

    const user = await User.create({
      name,
      email,
      passwordHash: password,
      role
    });

    // Remove passwordHash
    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    res.json({
      success:true,
      message:"User registered",
      user: safeUser
    });

  }catch(err){
    res.status(500).json({message:err.message});
  }
};


/* ================= LOGIN ================= */

export const login = async (req,res)=>{
  try{
    const { email,password } = req.body;

    const user = await User.findOne({email});
    if(!user){
      return res.status(404).json({message:"User not found"});
    }

    const match = await user.comparePassword(password);
    if(!match){
      return res.status(400).json({message:"Wrong password"});
    }

    const token = jwt.sign(
      { id:user._id, role:user.role },
      process.env.JWT_SECRET || "SECRET123",
      { expiresIn:"7d" }
    );

    user.lastLogin = new Date();
    await user.save();

    const safeUser = {
      _id:user._id,
      name:user.name,
      email:user.email,
      role:user.role
    };

    res.json({
      success:true,
      token,
      user:safeUser
    });

  }catch(err){
    res.status(500).json({message:err.message});
  }
};
