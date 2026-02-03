import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
{
  name: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  passwordHash: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ["admin","employee","student"],
    default: "student"
  },

  isActive: {
    type: Boolean,
    default: true
  },

  lastLogin: Date,

  profile: {
    avatar: {
      type: String,
      default: null
    },
    bio: String
  }

},
{
  timestamps: true
});



/* ===============================
   HASH PASSWORD BEFORE SAVE
================================ */

userSchema.pre("save", async function(){
  if(!this.isModified("passwordHash")) return;

  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});



/* ===============================
   PASSWORD CHECK
================================ */

userSchema.methods.comparePassword = async function(password){
  return await bcrypt.compare(password,this.passwordHash);
};



export default mongoose.model("User", userSchema);
