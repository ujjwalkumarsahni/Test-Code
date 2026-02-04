import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  exam:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Exam",
    required:true
  },

  questionText:{
    type:String,
    required:true,
    trim:true
  },

  options:{
    type:[String],
    required:true,
    validate:{
      validator:arr => arr.length >= 2,
      message:"At least 2 options required"
    }
  },

  correctAnswer:{
    type:Number,
    required:true,
    min:0
  },

  marks:{
    type:Number,
    default:1,
    min:1
  }

},{timestamps:true});

export default mongoose.model("Question",questionSchema);
