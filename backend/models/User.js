import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name:{type:String,required:true},
  email:{type:String,unique:true,required:true},
  passwordHash:{type:String,required:true},
  role:{
    type:String,
    enum:["admin","employee","student"],
    required:true
  }
},{timestamps:true});

userSchema.pre("save",async function(){
  if(!this.isModified("passwordHash")) return;
  this.passwordHash = await bcrypt.hash(this.passwordHash,10);
});

userSchema.methods.comparePassword=function(p){
  return bcrypt.compare(p,this.passwordHash);
};

export default mongoose.model("User",userSchema);
