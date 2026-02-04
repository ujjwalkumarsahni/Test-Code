import mongoose from "mongoose";

export default mongoose.model("Employee",new mongoose.Schema({
  user:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
  school:{type:mongoose.Schema.Types.ObjectId,ref:"School"},
  designation:String
}));
