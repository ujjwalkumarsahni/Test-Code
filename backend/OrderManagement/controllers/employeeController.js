import Employee from "../models/Employee.js";
import Student from "../models/student.js";
import User from "../models/User.js";
import UserActivity from "../models/UserActivity.js";
import EmployeePosting from "../models/EmployeePosting.js";
import UserRole from "../models/UserRole.js";

// HR creates employee with basic info
export const createEmployee = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      employeeId,
      designation,
      department,
      reportingManager,
      dateOfJoining,
      employmentType,
      workMode,
      workLocation,
      salary,
      organization,
      role = "employee",
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !email ||
      !password ||
      !employeeId ||
      !designation ||
      !department ||
      !reportingManager ||
      !dateOfJoining ||
      !employmentType ||
      !workMode ||
      !workLocation ||
      !salary
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    if (req.user.role !== "admin" && role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin can create admin account.",
      });
    }
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Check if employee ID already exists
    const existingEmployee = await Employee.findOne({
      "basicInfo.employeeId": employeeId,
    });
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: "Employee ID already exists",
      });
    }

    // Create user account
    const user = new User({
      name,
      email,
      passwordHash: password,
      role: role,
      organization: organization || "",
    });

    await user.save();

    await UserRole.create({
      user: user._id,
      role: role || "employee",
      assignedBy: req.user._id,
      isActive: true,
    });

    // Assign default permissions based on role
    // const defaultPermissions = await Permission.findOne({ role });
    // const userRole = new UserRole({
    //     user: user._id,
    //     role: role,
    //     permissions: defaultPermissions?._id || null
    // });

    // await userRole.save();

    // Create employee profile with basic info
    const employee = new Employee({
      user: user._id,
      basicInfo: {
        fullName: name,
        employeeId,
        designation,
        department,
        reportingManager,
        dateOfJoining: new Date(dateOfJoining),
        employmentType,
        workMode,
        workLocation,
        salary: salary || 0,
        employeeStatus: "Active",
      },
      createdBy: req.user._id,
      lastUpdatedBy: req.user._id,
    });

    await employee.save();

    // console.log(employee)
    // Send welcome email to employee
    // await sendWelcomeEmail(email, name, employeeId, password);

    // Log registration activity
    await UserActivity.create({
      user: user._id,
      action: "user_created",
      resourceType: "user",
      details: {
        selfRegistration: true,
        role: role,
        organization: organization || "",
      },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        employee: {
          employeeId: employee.basicInfo.employeeId,
          designation: employee.basicInfo.designation,
          department: employee.basicInfo.department,
        },
      },
    });
  } catch (error) {
    console.error("Create employee error:", error);

    // Cleanup if error occurs
    if (req.body.email) {
      await User.findOneAndDelete({ email: req.body.email });
    }

    res.status(500).json({
      success: false,
      message: "Error creating employee",
      error: error.message,
    });
  }
};

// Get all employees for HR
export const getAllEmployees = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      department = "",
      status = "",
    } = req.query;

    const query = {};

    if (search) {
      query["$or"] = [
        { "basicInfo.fullName": { $regex: search, $options: "i" } },
        { "basicInfo.employeeId": { $regex: search, $options: "i" } },
        { "basicInfo.designation": { $regex: search, $options: "i" } },
      ];
    }

    if (department) {
      query["basicInfo.department"] = department;
    }

    if (status) {
      query["basicInfo.employeeStatus"] = status;
    }

    const employees = await Employee.find(query)
      .populate("user", "name email role isActive lastLogin")
      .populate({ path: "basicInfo.reportingManager", select: "name email" })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Employee.countDocuments(query);

    res.json({
      success: true,
      data: employees,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Get all employees error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const registerStudent = async (req, res) => {
  try {
    const { name, email, password, grade } = req.body;

    // Role check
    if (req.user.role !== "employee") {
      return res.status(403).json({
        message: "Only employees can register students",
      });
    }

    if (!name || !email || !password || !grade) {
      return res.status(400).json({
        message: "All fields required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password too short",
      });
    }

    // Duplicate email check
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    // Find employee
    const employee = await Employee.findOne({ user: req.user._id });

    if (!employee) {
      return res.status(400).json({
        message: "Employee profile not found",
      });
    }

    // Active posting
    const posting = await EmployeePosting.findOne({
      employee: employee._id,
      isActive: true,
    });

    if (!posting) {
      return res.status(400).json({
        message: "Employee not assigned to any school",
      });
    }

    const schoolId = posting.school;

    // Create user
    const user = await User.create({
      name,
      email,
      passwordHash: password,
      role: "student",
    });

    // Create student
    const student = await Student.create({
      user: user._id,
      grade,
      school: schoolId,
      createdByEmployee: employee._id,
    });

    await UserRole.create({
      user: user._id,
      role: "student",
      assignedBy: req.user._id,
      isActive: true,
    });

    res.json({
      success: true,
      message: "Student registered successfully",
      student,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

// import Student from "../models/student.js";
// import fs from "fs";
// import csv from "csv-parser";
// import XLSX from "xlsx";
// import UserRole from "../models/UserRole.js";
// export const createStudent = async (req,res)=>{
//   try{
//     const { name,email,password } = req.body;

//     const user = await User.create({
//       name,
//       email,
//       passwordHash: password,
//       role:"student"
//     });

//     const student = await Student.create({
//       user:user._id,
//       school:req.schoolId // auto from middleware
//     });

//     res.json({
//       success:true,
//       login:{
//         email,
//         password
//       },
//       student
//     });

//   }catch(err){
//     res.status(500).json({msg:err.message});
//   }
// };

// export const bulkCreateStudents = async (req,res)=>{

//   if(!req.file){
//     return res.status(400).json({msg:"CSV file required"});
//   }

//   let created=0;
//   let skipped=0;
//   let total=0;
//   const failedRows=[];

//   try{

//     const stream = fs.createReadStream(req.file.path)
//       .pipe(csv());

//     for await (const row of stream){
//       total++;

//       if(!row.email || !row.name || !row.password){
//         skipped++;
//         failedRows.push({
//           ...row,
//           reason:"Missing fields"
//         });
//         continue;
//       }

//       const exists = await User.findOne({email:row.email});

//       if(exists){
//         skipped++;
//         failedRows.push({
//           ...row,
//           reason:"Duplicate email"
//         });
//         continue;
//       }

//       const user = await User.create({
//         name:row.name.trim(),
//         email:row.email.trim(),
//         passwordHash:row.password.trim(),
//         role:"student"
//       });

//       await Student.create({
//         user:user._id,
//         school:req.schoolId
//       });

//       created++;
//     }

//     // delete uploaded CSV
//     fs.unlinkSync(req.file.path);

//     /* ===== If failures exist → send Excel ===== */

//     if(failedRows.length>0){

//       const wb = XLSX.utils.book_new();
//       const ws = XLSX.utils.json_to_sheet(failedRows);

//       XLSX.utils.book_append_sheet(wb,ws,"Failed");

//       const buffer = XLSX.write(wb,{
//         type:"buffer",
//         bookType:"xlsx"
//       });

//       res.setHeader(
//         "Content-Disposition",
//         "attachment; filename=failed_students.xlsx"
//       );

//       res.type(
//         "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//       );

//       return res.send(buffer);
//     }

//     /* ===== If no failures → normal JSON ===== */

//     res.json({
//       success:true,
//       total,
//       created,
//       skipped
//     });

//   }catch(err){

//     if(req.file && fs.existsSync(req.file.path)){
//       fs.unlinkSync(req.file.path);
//     }

//     res.status(500).json({msg:err.message});
//   }
// };
