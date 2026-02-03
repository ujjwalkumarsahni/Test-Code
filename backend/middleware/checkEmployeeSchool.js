import Employee from "../models/Employee.js";
import School from "../models/School.js";

export const checkEmployeeSchool = async (req, res, next) => {
  const employeeId = req.user.employeeId;

  const employee = await Employee.findById(employeeId);

  const school = await School.findOne({
    currentTrainers: employee._id
  });

  if (!school) {
    return res.status(403).json({
      success: false,
      message: "Not authorized for any school"
    });
  }

  req.schoolId = school._id;
  req.employeeId = employee._id;

  next();
};
