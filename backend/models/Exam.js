import mongoose from 'mongoose'

const examSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true
  },

  title: String,
  description: String,

  totalMarks: Number,
  duration: Number, // minutes

  examDate: Date,

  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student"
  }],

  status: {
    type: String,
    enum: ["Draft", "Published", "Completed"],
    default: "Draft"
  }

}, { timestamps: true });

export default mongoose.model("Exam", examSchema);
