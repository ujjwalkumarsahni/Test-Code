import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true
  },

  registeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true
  },

  fullName: { type: String, required: true },
  email: { type: String, required: true },
  
  status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active"
  }
}, { timestamps: true });

export default mongoose.model("Student", studentSchema);
