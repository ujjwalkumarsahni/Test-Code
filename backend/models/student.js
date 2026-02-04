import mongoose from "mongoose";

export default mongoose.model("Student",new mongoose.Schema({
  user:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
  school:{type:mongoose.Schema.Types.ObjectId,ref:"School"}
}));
