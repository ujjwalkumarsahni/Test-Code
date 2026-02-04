import mongoose from "mongoose";

const examSchema = new mongoose.Schema({

  school:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"School",
    required:true
  },

  createdBy:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Employee",
    required:true
  },

  title:{
    type:String,
    required:true,
    trim:true
  },

  description:String,

  totalMarks:{
    type:Number,
    default:0
  },

  duration:{
    type:Number,
    required:true
  },

  examDate:{
    type:Date,
    required:true
  },

  students:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Student"
  }],

  status:{
    type:String,
    enum:["Draft","Published","Completed"],
    default:"Draft"
  }

},{timestamps:true});


examSchema.virtual("questions",{
  ref:"Question",
  localField:"_id",
  foreignField:"exam"
});

examSchema.set("toObject",{virtuals:true});
examSchema.set("toJSON",{virtuals:true});

export default mongoose.model("Exam",examSchema);
