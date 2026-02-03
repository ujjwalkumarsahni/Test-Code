import Employee from '../models/Employee.js';
import User from '../models/User.js';
import UserRole from '../models/UserRole.js';

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
            role = 'employee'
        } = req.body;

        // Required fields (reportingManager optional)
        if (!name || !email || !password || !employeeId || !designation || !department || !dateOfJoining || !employmentType || !workMode || !workLocation || !salary) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        const existingEmployee = await Employee.findOne({
            'basicInfo.employeeId': employeeId
        });
        if (existingEmployee) {
            return res.status(400).json({
                success: false,
                message: 'Employee ID already exists'
            });
        }

        const user = new User({
            name,
            email,
            passwordHash: password,
            role,
            organization: organization || ''
        });

        await user.save();

        const userRole = new UserRole({
            user: user._id,
            role
        });

        await userRole.save();

        const ADMIN_ID = "691afb633943df5e1d0b70c7";

        const employee = new Employee({
            user: user._id,
            basicInfo: {
                fullName: name,
                employeeId,
                designation,
                department,
                reportingManager: reportingManager || null,
                dateOfJoining: new Date(dateOfJoining),
                employmentType,
                workMode,
                workLocation,
                salary: salary || 0,
                employeeStatus: 'Active'
            },
            createdBy: ADMIN_ID,
            lastUpdatedBy: ADMIN_ID
        });

        await employee.save();

        await UserActivity.create({
            user: user._id,
            action: 'user_created',
            resourceType: 'user',
            details: {
                role,
                organization: organization || ''
            }
        });

        res.status(201).json({
            success: true,
            message: 'Employee created successfully',
            data: {
                user,
                employee
            }
        });

    } catch (error) {
        console.error('Create employee error:', error);

        res.status(500).json({
            success: false,
            message: 'Error creating employee',
            error: error.message
        });
    }
};


export const getActiveEmployeebyId = async (req, res) => {
  try {
    if (!req.params?.id || req.params?.id === "undefined") {
      return res.status(400).json({
        success: false,
        message: "Employee id is required",
      });
    }
    const employees = await Employee.find({ "basicInfo.employeeStatus": "Active", "_id": req.params?.id })
      .select("basicInfo.fullName basicInfo.employeeId basicInfo.designation basicInfo.department basicInfo.employeeStatus basicInfo.dateOfJoining",)
      .populate("user", "name email role");

    res.json({
      success: true,
      data: employees,
    });
  } catch (error) {
    console.error("Get all employees error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};