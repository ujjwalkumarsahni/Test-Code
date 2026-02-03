import Employee from "../models/Employee.js";
import Student from "../models/Student.js";

export const registerStudent = async (req,res)=>{
  const { employeeId, fullName, email } = req.body;

  const employee = await Employee.findById(employeeId);

  if(!employee){
    return res.status(404).json({message:"Employee not found"});
  }

  const schoolId = employee.school; // employee ka school

  const student = await Student.create({
    school: schoolId,
    registeredBy: employeeId,
    fullName,
    email
  });

  res.json({
    success:true,
    data:student
  });
};
