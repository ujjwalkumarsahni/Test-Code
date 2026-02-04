import Employee from "../models/Employee.js";

export const schoolScope = async (req,res,next)=>{
  try{
    const emp = await Employee.findOne({user:req.user._id});

    if(!emp){
      return res.status(403).json({msg:"Employee not linked to school"});
    }

    req.schoolId = emp.school;
    next();

  }catch(err){
    res.status(500).json({msg:"School scope error"});
  }
};
