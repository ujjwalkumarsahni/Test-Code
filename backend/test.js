import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

export default connectDB;

import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

export default connectDB;

import mongoose from 'mongoose';

const schoolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'School name is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  contactPersonName: {
    type: String,
    required: [true, 'Contact person name is required'],
    trim: true
  },
  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    validate: {
      validator: function(v) {
        return /^\d{10}$/.test(v);
      },
      message: 'Mobile number must be 10 digits'
    }
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  trainersRequired: {
    type: Number,
    required: [true, 'Number of trainers required is needed'],
    min: [1, 'At least 1 trainer is required'],
    default: 1
  },
  currentTrainers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  }],
  logo: {
    url: String,
    public_id: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Virtual for current trainers count
schoolSchema.virtual('trainersCount').get(function() {
  return this.currentTrainers.length;
});

// Virtual for trainer status
schoolSchema.virtual('trainerStatus').get(function() {
  const count = this.currentTrainers.length;
  const required = this.trainersRequired;
  
  if (count >= required) return 'adequate';
  if (count > 0 && count < required) return 'shortage';
  return 'critical';
});

// Indexes
schoolSchema.index({ city: 1 });
schoolSchema.index({ status: 1 });
schoolSchema.index({ 'currentTrainers': 1 });

const School = mongoose.model('School', schoolSchema);
export default School;

import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' }
}, { _id: false });

const bankDetailsSchema = new mongoose.Schema({
    accountHolderName: String,
    bankName: String,
    accountNumber: String,
    ifscCode: String,
    branch: String
}, { _id: false });

const emergencyContactSchema = new mongoose.Schema({
    name: String,
    number: String,
    relation: String,
    address: String
}, { _id: false });

const trainingSchema = new mongoose.Schema({
    name: String,
    type: {
        type: String,
        enum: ['Internal', 'External', 'Workshop', 'Seminar']
    },
    date: Date,
    certificate: String,
    duration: String,
    completed: Boolean,
    organizer: String
}, { _id: false });

const finalSettlementSchema = new mongoose.Schema({
    amount: Number,
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Completed', 'Rejected'],
        default: 'Pending'
    },
    paidDate: Date,
    details: String,
    transactionId: String
}, { _id: false });

// Documents Schema with Cloudinary Public IDs
const documentsSchema = new mongoose.Schema({
    // Required Documents
    offerLetter: { type: String, default: null },
    offerLetterPublicId: { type: String, default: null },
    
    appointmentLetter: { type: String, default: null },
    appointmentLetterPublicId: { type: String, default: null }, // FIXED: Added 'type'
    
    resume: { type: String, default: null },
    resumePublicId: { type: String, default: null },
    
    passportPhoto: { type: String, default: null },
    passportPhotoPublicId: { type: String, default: null },
    
    panCard: { type: String, default: null },
    panCardPublicId: { type: String, default: null },
    
    aadhaarCard: { type: String, default: null },
    aadhaarCardPublicId: { type: String, default: null },
    
    addressProof: { type: String, default: null },
    addressProofPublicId: { type: String, default: null },

    // Arrays for multiple documents
    educationalCertificates: [{
        certificateName: String,
        fileUrl: String,
        public_id: String,
        uploadedAt: { type: Date, default: Date.now }
    }],

    idProofs: [{
        documentType: String,
        fileUrl: String,
        public_id: String,
        uploadedAt: { type: Date, default: Date.now }
    }],

    joiningDocuments: [{
        documentName: String,
        fileUrl: String,
        public_id: String,
        uploadedAt: { type: Date, default: Date.now }
    }],

    experienceLetters: [{
        companyName: String,
        fileUrl: String,
        public_id: String,
        uploadedAt: { type: Date, default: Date.now }
    }],

    relievingLetters: [{
        companyName: String,
        fileUrl: String,
        public_id: String,
        uploadedAt: { type: Date, default: Date.now }
    }],

    salarySlips: [{
        month: String,
        year: Number,
        fileUrl: String,
        public_id: String,
        uploadedAt: { type: Date, default: Date.now }
    }],

    incrementLetters: [{
        effectiveDate: Date,
        fileUrl: String,
        public_id: String,
        uploadedAt: { type: Date, default: Date.now }
    }],

    performanceReports: [{
        year: Number,
        fileUrl: String,
        public_id: String,
        uploadedAt: { type: Date, default: Date.now }
    }],

    appraisalLetters: [{
        year: Number,
        fileUrl: String,
        public_id: String,
        uploadedAt: { type: Date, default: Date.now }
    }],

    ndaAgreement: { type: String, default: null },
    ndaAgreementPublicId: { type: String, default: null },
    
    bondAgreement: { type: String, default: null },
    bondAgreementPublicId: { type: String, default: null },

    otherDocuments: [{
        documentName: String,
        fileUrl: String,
        public_id: String,
        uploadedAt: { type: Date, default: Date.now }
    }]
}, { _id: false });

const employeeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },

    basicInfo: {
        fullName: { type: String, required: true, trim: true },
        employeeId: { type: String, required: true, unique: true, trim: true },
        designation: { type: String, required: true, trim: true },
        department: { type: String, required: true, trim: true },
        reportingManager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        dateOfJoining: { type: Date, required: true },
        employmentType: {
            type: String,
            enum: ['Full-Time', 'Part-Time', 'Intern', 'Contract'],
            required: true
        },
        workMode: {
            type: String,
            enum: ['Onsite', 'Work-from-Home', 'Hybrid'],
            required: true
        },
        workLocation: { type: String, required: true, trim: true },
        employeeStatus: {
            type: String,
            enum: ['Active', 'On-Notice', 'Resigned', 'Terminated', 'Probation'],
            default: 'Active'
        },
        salary: { type: Number, default: 0 }
    },

    personalDetails: {
        dateOfBirth: Date,
        gender: {
            type: String,
            enum: ['Male', 'Female', 'Other', 'Prefer-not-to-say']
        },
        bloodGroup: {
            type: String,
            enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
        },
        contactNumber: String,
        alternateContactNumber: String,
        personalEmail: String,
        currentAddress: addressSchema,
        permanentAddress: addressSchema,
        emergencyContact: emergencyContactSchema,
        maritalStatus: {
            type: String,
            enum: ['Single', 'Married', 'Divorced', 'Widowed']
        },
        bankDetails: bankDetailsSchema,
        panNumber: {
            type: String,
            uppercase: true,
            match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN']
        },
        aadhaarNumber: {
            type: String,
            match: [/^\d{12}$/, 'Invalid Aadhaar']
        },
    },

    // FIX: Initialize documents with empty object
    documents: {
        type: documentsSchema,
        default: () => ({})
    },

    training: [trainingSchema],

    exitDetails: {
        noticePeriodStart: Date,
        noticePeriodEnd: Date,
        resignationDate: Date,
        finalSettlement: finalSettlementSchema,
        clearanceStatus: {
            type: String,
            enum: ['Pending', 'In Progress', 'Completed', 'Rejected'],
            default: 'Pending'
        },
        relievingDate: Date,
        experienceLetter: String,
        exitReason: String,
        feedback: String,
        exitInterview: String
    },

    completionStatus: {
        basicInfo: { type: Boolean, default: true },
        personalDetails: { type: Boolean, default: false },
        documents: {
            required: { type: Boolean, default: false },
            optional: { type: Object, default: {} }
        },
        training: { type: Boolean, default: true },
        overallPercentage: { type: Number, default: 25, min: 0, max: 100 }
    },

    verification: {
        isVerified: { type: Boolean, default: false },
        verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        verifiedAt: Date,
        comments: String,
        verificationLevel: {
            type: String,
            enum: ['Pending', 'In Progress', 'Verified', 'Rejected'],
            default: 'Pending'
        },
        rejectionReason: String
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lastProfileUpdate: Date

}, {
    timestamps: true
});

// FIXED: Calculate completion percentage with better null checks
employeeSchema.methods.calculateCompletion = function () {
    let percentage = 25; // Basic info always filled by HR

    // Personal Details (37.5%)
    const personalFields = [
        this.personalDetails?.dateOfBirth,
        this.personalDetails?.contactNumber,
        this.personalDetails?.personalEmail,
        this.personalDetails?.panNumber,
        this.personalDetails?.aadhaarNumber,
        this.personalDetails?.emergencyContact?.name,
        this.personalDetails?.emergencyContact?.number,
        this.personalDetails?.currentAddress?.street,
        this.personalDetails?.currentAddress?.city,
        this.personalDetails?.currentAddress?.pincode,
        this.personalDetails?.bankDetails?.accountHolderName,
        this.personalDetails?.bankDetails?.bankName,
        this.personalDetails?.bankDetails?.accountNumber,
        this.personalDetails?.bankDetails?.ifscCode,
        this.personalDetails?.bankDetails?.branch
    ];

    // FIX: Use filter instead of every for better handling
    const filledPersonalFields = personalFields.filter(field => 
        field !== null && field !== undefined && field !== ''
    ).length;
    
    const personalCompletion = (filledPersonalFields / personalFields.length) * 37.5;
    this.completionStatus.personalDetails = filledPersonalFields === personalFields.length;
    percentage += personalCompletion;

    // Required Documents (37.5%) - Better null checks
    const docFields = [
        this.documents?.offerLetter,
        this.documents?.appointmentLetter,
        this.documents?.resume,
        this.documents?.passportPhoto,
        this.documents?.panCard,
        this.documents?.aadhaarCard,
        this.documents?.addressProof
    ];

    const filledDocFields = docFields.filter(doc => 
        doc !== null && doc !== undefined && doc !== ''
    ).length;

    // Check array documents
    const hasEducationalCerts = this.documents?.educationalCertificates?.length > 0;
    const hasIdProofs = this.documents?.idProofs?.length > 0;

    const totalDocFields = docFields.length + 2; // +2 for arrays
    const filledTotalDocFields = filledDocFields + (hasEducationalCerts ? 1 : 0) + (hasIdProofs ? 1 : 0);

    const docCompletion = (filledTotalDocFields / totalDocFields) * 37.5;
    this.completionStatus.documents.required = filledTotalDocFields === totalDocFields;
    percentage += docCompletion;

    this.completionStatus.overallPercentage = Math.round(percentage);
    return this.completionStatus.overallPercentage;
};

// FIXED: Check if ready for verification with null checks
employeeSchema.methods.isReadyForVerification = function () {
    this.calculateCompletion();
    return this.completionStatus.overallPercentage === 100 &&
        this.completionStatus.personalDetails &&
        this.completionStatus.documents.required;
};

// FIXED: Pre-save middleware with error handling
employeeSchema.pre('save', function (next) {
    try {
        this.calculateCompletion();
        this.lastProfileUpdate = new Date();
        next();
    } catch (error) {
        console.error('Error in pre-save middleware:', error);
        next();
    }
});

// Indexes
employeeSchema.index({ 'basicInfo.department': 1 });
employeeSchema.index({ 'verification.isVerified': 1 });
employeeSchema.index({ 'completionStatus.overallPercentage': 1 });

export default mongoose.model('Employee', employeeSchema);

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
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
    enum: ['teacher', 'student', 'admin', 'hr', 'employee'],
    default: 'teacher'
  },
  organization: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  profile: {
    avatar: String || null,
    bio: String,
    subjects: [String],
    grades: [String]
  }
}, {
  timestamps: true
});

userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.passwordHash);
};

userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

// Virtual for user activities
userSchema.virtual('activities', {
  ref: 'UserActivity',
  localField: '_id',
  foreignField: 'user'
});

// Virtual for user roles
userSchema.virtual('roles', {
  ref: 'UserRole',
  localField: '_id',
  foreignField: 'user'
});

export default mongoose.model('User', userSchema);

import mongoose from 'mongoose';

const userRoleSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['teacher', 'student', 'admin', 'hr', 'employee'],
    required: true
  },
  permissions: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Permission',
    required: true
  },
  customPermissions: {
    // Override default permissions for specific user
    templates: {
      access: [String],
      restrictions: [String]
    },
    features: {
      enabled: [String],
      disabled: [String]
    },
    limits: {
      dailyAiGenerations: Number,
      maxContentItems: Number,
      maxStorageMB: Number
    }
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  expiresAt: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
userRoleSchema.index({ user: 1, isActive: 1 });
userRoleSchema.index({ role: 1, isActive: 1 });

export default mongoose.model('UserRole', userRoleSchema);


import asyncHandler from "express-async-handler";
import School from "../models/School.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../config/cloudinary.js";

// Create new school
export const createSchool = asyncHandler(async (req, res) => {
  const {
    name,
    city,
    address,
    contactPersonName,
    mobile,
    email,
    trainersRequired,
  } = req.body;

  // Check if school already exists
  const schoolExists = await School.findOne({ email });
  if (schoolExists) {
    res.status(400);
    throw new Error("School with this email already exists");
  }

  let logoData = null;

  // Upload logo if provided
  if (req.body.logoBase64) {
    try {
      logoData = await uploadToCloudinary(req.body.logoBase64);
    } catch (error) {
      res.status(400);
      throw new Error("Logo upload failed");
    }
  }

  const school = await School.create({
    name,
    city,
    address,
    contactPersonName,
    mobile,
    email,
    trainersRequired: trainersRequired || 1,
    logo: logoData,
    createdBy: req.user._id,
    updatedBy: req.user._id,
  });

  const populatedSchool = await School.findById(school._id)
    .populate("currentTrainers", "basicInfo.fullName basicInfo.employeeId")
    .populate("createdBy", "name email")
    .populate("updatedBy", "name email");

  res.status(201).json({
    success: true,
    data: populatedSchool,
  });
});

// Get all schools
export const getSchools = asyncHandler(async (req, res) => {
  const { status, city, search } = req.query;

  let query = {};

  if (status) query.status = status;
  if (city) query.city = new RegExp(city, "i");
  if (search) {
    query.$or = [
      { name: new RegExp(search, "i") },
      { email: new RegExp(search, "i") },
      { contactPersonName: new RegExp(search, "i") },
    ];
  }

  const schools = await School.find(query)
    .populate("currentTrainers", "basicInfo.fullName basicInfo.employeeId")
    .populate("createdBy", "name email")
    .populate("updatedBy", "name email")
    .sort({ createdAt: -1 });

  // Add virtuals to response
  const schoolsWithVirtuals = schools.map((school) => ({
    ...school.toObject(),
    trainersCount: school.currentTrainers.length,
    trainerStatus: school.trainerStatus,
    trainerRequirementStatus: {
      required: school.trainersRequired,
      current: school.currentTrainers.length,
      needed: Math.max(
        0,
        school.trainersRequired - school.currentTrainers.length,
      ),
    },
  }));

  res.json({
    success: true,
    count: schools.length,
    data: schoolsWithVirtuals,
  });
});

// Get single school
export const getSchool = asyncHandler(async (req, res) => {
  const { id } = req.params
  if (!id || id === "undefined") {
    return res.status(400).json({
      success: false,
      message: "Id not found",
    });
  }
  const school = await School.findById(req.params?.id)
    .populate({
      path: "currentTrainers",
      select: "basicInfo.fullName basicInfo.employeeId basicInfo.designation",
      populate: {
        path: "user",
        select: "name email",
      },
    })
    .populate("createdBy", "name email")
    .populate("updatedBy", "name email");

  if (!school) {
    return res.status(400).json({
      success: false,
      message: "School not found",
    });
  }

  const schoolData = {
    ...school.toObject(),
    trainersCount: school.currentTrainers.length,
    trainerStatus: school.trainerStatus,
    trainerRequirementStatus: {
      required: school.trainersRequired,
      current: school.currentTrainers.length,
      needed: Math.max(
        0,
        school.trainersRequired - school.currentTrainers.length,
      ),
    },
  };

  res.json({
    success: true,
    data: schoolData,
  });
});

// Update school
export const updateSchool = asyncHandler(async (req, res) => {
  const school = await School.findById(req.params.id);

  if (!school) {
    return res.status(400).json({
      success: false,
      message: "School not found",
    });
  }

  const { status } = req.body;

  if (school.status === "active" && status === "inactive") {
    // Check if school has active trainers
    if (school.currentTrainers.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot deactivate school with active trainers. Reassign trainers first.",
      });
    }
  }

  let logoData = school.logo;

  // If new logo provided
  if (req.body.logoBase64) {
    // Delete old logo if exists
    if (school.logo && school.logo.public_id) {
      await deleteFromCloudinary(school.logo.public_id);
    }

    // Upload new logo
    try {
      logoData = await uploadToCloudinary(req.body.logoBase64);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Logo upload failed",
      });
    }
  }

  // Update school
  const updatedSchool = await School.findByIdAndUpdate(
    req.params.id,
    {
      ...req.body,
      logo: logoData,
      updatedBy: req.user._id,
    },
    { new: true, runValidators: true },
  )
    .populate("currentTrainers", "basicInfo.fullName basicInfo.employeeId")
    .populate("createdBy", "name email")
    .populate("updatedBy", "name email");

  res.json({
    success: true,
    data: updatedSchool,
  });
});

// Delete school
export const deleteSchool = asyncHandler(async (req, res) => {
  const school = await School.findById(req.params.id);

  if (!school) {
    return res.status(400).json({
      success: false,
      message: "School not found",
    });
  }

  // Check if school has active trainers
  if (school.currentTrainers.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Cannot delete school with active trainers. Reassign trainers first.",
    });
  }

  // Delete logo from cloudinary
  if (school.logo && school.logo.public_id) {
    await deleteFromCloudinary(school.logo.public_id);
  }

  await school.deleteOne();

  res.json({
    success: true,
    message: "School deleted successfully",
  });
});

// Get school dashboard stats
export const getSchoolStats = asyncHandler(async (req, res) => {
  const totalSchools = await School.countDocuments();
  const activeSchools = await School.countDocuments({ status: "active" });
  const inactiveSchools = await School.countDocuments({ status: "inactive" });

  const schools = await School.find({ status: "active" });

  let totalTrainersRequired = 0;
  let totalCurrentTrainers = 0;

  schools.forEach((school) => {
    totalTrainersRequired += school.trainersRequired;
    totalCurrentTrainers += school.currentTrainers.length;
  });

  const shortage = Math.max(0, totalTrainersRequired - totalCurrentTrainers);

  // Schools with critical shortage
  const criticalSchools = schools.filter(
    (school) => school.currentTrainers.length === 0,
  ).length;

  // Schools with adequate trainers
  const adequateSchools = schools.filter(
    (school) => school.currentTrainers.length >= school.trainersRequired,
  ).length;

  // Schools with shortage
  const shortageSchools = schools.filter(
    (school) =>
      school.currentTrainers.length > 0 &&
      school.currentTrainers.length < school.trainersRequired,
  ).length;

  res.json({
    success: true,
    data: {
      totalSchools,
      activeSchools,
      inactiveSchools,
      trainers: {
        required: totalTrainersRequired,
        current: totalCurrentTrainers,
        shortage,
        adequacy:
          totalTrainersRequired > 0
            ? Math.round((totalCurrentTrainers / totalTrainersRequired) * 100)
            : 100,
      },
      schoolsStatus: {
        critical: criticalSchools,
        shortage: shortageSchools,
        adequate: adequateSchools,
      },
    },
  });
});

// Get school's trainers
export const getSchoolTrainers = asyncHandler(async (req, res) => {

  const { id } = req.params
  if (!id || id === "undefined") {
    return res.status(400).json({
      success: false,
      message: "Id not found",
    });
  }
  const school = await School.findById(req.params?.id).populate({
    path: "currentTrainers",
    select: "basicInfo.fullName basicInfo.employeeId basicInfo.designation",
    populate: {
      path: "user",
      select: "name email",
    },
  });

  if (!school) {
    return res.status(400).json({
      success: false,
      message: "School not found",
    });
  }

  res.json({
    success: true,
    data: {
      school: {
        _id: school._id,
        name: school.name,
        trainersRequired: school.trainersRequired,
        currentCount: school.currentTrainers.length,
        needed: Math.max(
          0,
          school.trainersRequired - school.currentTrainers.length,
        ),
      },
      trainers: school.currentTrainers,
    },
  });
});

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


        // Validate required fields
        if (!name || !email || !password || !employeeId || !designation || !department || !reportingManager || !dateOfJoining || !employmentType || !workMode || !workLocation || !salary) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Validate password strength
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        if (req.user.role !== 'admin' && role === 'admin') {
            return res.status(403).json({
                success: false,
                message: "Only admin can create admin account."
            });
        }
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Check if employee ID already exists
        const existingEmployee = await Employee.findOne({
            'basicInfo.employeeId': employeeId
        });
        if (existingEmployee) {
            return res.status(400).json({
                success: false,
                message: 'Employee ID already exists'
            });
        }


        // Create user account
        const user = new User({
            name,
            email,
            passwordHash: password,
            role: role,
            organization: organization || '',
        });

        await user.save();


        // Assign default permissions based on role
        const defaultPermissions = await Permission.findOne({ role });
        const userRole = new UserRole({
            user: user._id,
            role: role,
            permissions: defaultPermissions?._id || null
        });

        await userRole.save();

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
                employeeStatus: 'Active'
            },
            createdBy: req.user._id,
            lastUpdatedBy: req.user._id
        });

        await employee.save();

        // console.log(employee)
        // Send welcome email to employee
        await sendWelcomeEmail(email, name, employeeId, password);

        // Log registration activity
        await UserActivity.create({
            user: user._id,
            action: 'user_created',
            resourceType: 'user',
            details: {
                selfRegistration: true,
                role: role,
                organization: organization || ''
            },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });


        res.status(201).json({
            success: true,
            message: 'Employee created successfully',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                employee: {
                    employeeId: employee.basicInfo.employeeId,
                    designation: employee.basicInfo.designation,
                    department: employee.basicInfo.department
                }
            }
        });

    } catch (error) {
        console.error('Create employee error:', error);

        // Cleanup if error occurs
        if (req.body.email) {
            await User.findOneAndDelete({ email: req.body.email });
        }

        res.status(500).json({
            success: false,
            message: 'Error creating employee',
            error: error.message
        });
    }
};

// Get all employees for HR
export const getAllEmployees = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            department = '',
            status = ''
        } = req.query;

        const query = {};

        if (search) {
            query['$or'] = [
                { 'basicInfo.fullName': { $regex: search, $options: 'i' } },
                { 'basicInfo.employeeId': { $regex: search, $options: 'i' } },
                { 'basicInfo.designation': { $regex: search, $options: 'i' } }
            ];
        }

        if (department) {
            query['basicInfo.department'] = department;
        }

        if (status) {
            query['basicInfo.employeeStatus'] = status;
        }

        const employees = await Employee.find(query)
            .populate('user', 'name email role isActive lastLogin')
            .populate({ path: 'basicInfo.reportingManager', select: 'name email' })
            .populate('createdBy', 'name email')
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
                total
            }
        });
    } catch (error) {
        console.error('Get all employees error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getAllActiveEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({ "basicInfo.employeeStatus": "Active" })
      .select("basicInfo.fullName basicInfo.employeeId basicInfo.designation basicInfo.department basicInfo.employeeStatus",)
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

import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


// Direct upload helper
export const uploadToCloudinary = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: 'school-management',
      resource_type: 'auto'
    });
    return {
      url: result.secure_url,
      public_id: result.public_id
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('File upload failed');
  }
};

// Delete from cloudinary
export const deleteFromCloudinary = async (publicId) => {
  try {
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }
  } catch (error) {
    console.error('Cloudinary delete error:', error);
  }
};

export default cloudinary;



import mongoose from 'mongoose';

const schoolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'School name is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  contactPersonName: {
    type: String,
    required: [true, 'Contact person name is required'],
    trim: true
  },
  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    validate: {
      validator: function(v) {
        return /^\d{10}$/.test(v);
      },
      message: 'Mobile number must be 10 digits'
    }
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  trainersRequired: {
    type: Number,
    required: [true, 'Number of trainers required is needed'],
    min: [1, 'At least 1 trainer is required'],
    default: 1
  },
  currentTrainers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  }],
  logo: {
    url: String,
    public_id: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Virtual for current trainers count
schoolSchema.virtual('trainersCount').get(function() {
  return this.currentTrainers.length;
});

// Virtual for trainer status
schoolSchema.virtual('trainerStatus').get(function() {
  const count = this.currentTrainers.length;
  const required = this.trainersRequired;
  
  if (count >= required) return 'adequate';
  if (count > 0 && count < required) return 'shortage';
  return 'critical';
});

// Indexes
schoolSchema.index({ city: 1 });
schoolSchema.index({ status: 1 });
schoolSchema.index({ 'currentTrainers': 1 });

const School = mongoose.model('School', schoolSchema);
export default School;

import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' }
}, { _id: false });

const bankDetailsSchema = new mongoose.Schema({
    accountHolderName: String,
    bankName: String,
    accountNumber: String,
    ifscCode: String,
    branch: String
}, { _id: false });

const emergencyContactSchema = new mongoose.Schema({
    name: String,
    number: String,
    relation: String,
    address: String
}, { _id: false });

const trainingSchema = new mongoose.Schema({
    name: String,
    type: {
        type: String,
        enum: ['Internal', 'External', 'Workshop', 'Seminar']
    },
    date: Date,
    certificate: String,
    duration: String,
    completed: Boolean,
    organizer: String
}, { _id: false });

const finalSettlementSchema = new mongoose.Schema({
    amount: Number,
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Completed', 'Rejected'],
        default: 'Pending'
    },
    paidDate: Date,
    details: String,
    transactionId: String
}, { _id: false });

// Documents Schema with Cloudinary Public IDs
const documentsSchema = new mongoose.Schema({
    // Required Documents
    offerLetter: { type: String, default: null },
    offerLetterPublicId: { type: String, default: null },
    
    appointmentLetter: { type: String, default: null },
    appointmentLetterPublicId: { type: String, default: null }, // FIXED: Added 'type'
    
    resume: { type: String, default: null },
    resumePublicId: { type: String, default: null },
    
    passportPhoto: { type: String, default: null },
    passportPhotoPublicId: { type: String, default: null },
    
    panCard: { type: String, default: null },
    panCardPublicId: { type: String, default: null },
    
    aadhaarCard: { type: String, default: null },
    aadhaarCardPublicId: { type: String, default: null },
    
    addressProof: { type: String, default: null },
    addressProofPublicId: { type: String, default: null },

    // Arrays for multiple documents
    educationalCertificates: [{
        certificateName: String,
        fileUrl: String,
        public_id: String,
        uploadedAt: { type: Date, default: Date.now }
    }],

    idProofs: [{
        documentType: String,
        fileUrl: String,
        public_id: String,
        uploadedAt: { type: Date, default: Date.now }
    }],

    joiningDocuments: [{
        documentName: String,
        fileUrl: String,
        public_id: String,
        uploadedAt: { type: Date, default: Date.now }
    }],

    experienceLetters: [{
        companyName: String,
        fileUrl: String,
        public_id: String,
        uploadedAt: { type: Date, default: Date.now }
    }],

    relievingLetters: [{
        companyName: String,
        fileUrl: String,
        public_id: String,
        uploadedAt: { type: Date, default: Date.now }
    }],

    salarySlips: [{
        month: String,
        year: Number,
        fileUrl: String,
        public_id: String,
        uploadedAt: { type: Date, default: Date.now }
    }],

    incrementLetters: [{
        effectiveDate: Date,
        fileUrl: String,
        public_id: String,
        uploadedAt: { type: Date, default: Date.now }
    }],

    performanceReports: [{
        year: Number,
        fileUrl: String,
        public_id: String,
        uploadedAt: { type: Date, default: Date.now }
    }],

    appraisalLetters: [{
        year: Number,
        fileUrl: String,
        public_id: String,
        uploadedAt: { type: Date, default: Date.now }
    }],

    ndaAgreement: { type: String, default: null },
    ndaAgreementPublicId: { type: String, default: null },
    
    bondAgreement: { type: String, default: null },
    bondAgreementPublicId: { type: String, default: null },

    otherDocuments: [{
        documentName: String,
        fileUrl: String,
        public_id: String,
        uploadedAt: { type: Date, default: Date.now }
    }]
}, { _id: false });

const employeeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },

    basicInfo: {
        fullName: { type: String, required: true, trim: true },
        employeeId: { type: String, required: true, unique: true, trim: true },
        designation: { type: String, required: true, trim: true },
        department: { type: String, required: true, trim: true },
        reportingManager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        dateOfJoining: { type: Date, required: true },
        employmentType: {
            type: String,
            enum: ['Full-Time', 'Part-Time', 'Intern', 'Contract'],
            required: true
        },
        workMode: {
            type: String,
            enum: ['Onsite', 'Work-from-Home', 'Hybrid'],
            required: true
        },
        workLocation: { type: String, required: true, trim: true },
        employeeStatus: {
            type: String,
            enum: ['Active', 'On-Notice', 'Resigned', 'Terminated', 'Probation'],
            default: 'Active'
        },
        salary: { type: Number, default: 0 }
    },

    personalDetails: {
        dateOfBirth: Date,
        gender: {
            type: String,
            enum: ['Male', 'Female', 'Other', 'Prefer-not-to-say']
        },
        bloodGroup: {
            type: String,
            enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
        },
        contactNumber: String,
        alternateContactNumber: String,
        personalEmail: String,
        currentAddress: addressSchema,
        permanentAddress: addressSchema,
        emergencyContact: emergencyContactSchema,
        maritalStatus: {
            type: String,
            enum: ['Single', 'Married', 'Divorced', 'Widowed']
        },
        bankDetails: bankDetailsSchema,
        panNumber: {
            type: String,
            uppercase: true,
            match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN']
        },
        aadhaarNumber: {
            type: String,
            match: [/^\d{12}$/, 'Invalid Aadhaar']
        },
    },

    // FIX: Initialize documents with empty object
    documents: {
        type: documentsSchema,
        default: () => ({})
    },

    training: [trainingSchema],

    exitDetails: {
        noticePeriodStart: Date,
        noticePeriodEnd: Date,
        resignationDate: Date,
        finalSettlement: finalSettlementSchema,
        clearanceStatus: {
            type: String,
            enum: ['Pending', 'In Progress', 'Completed', 'Rejected'],
            default: 'Pending'
        },
        relievingDate: Date,
        experienceLetter: String,
        exitReason: String,
        feedback: String,
        exitInterview: String
    },

    completionStatus: {
        basicInfo: { type: Boolean, default: true },
        personalDetails: { type: Boolean, default: false },
        documents: {
            required: { type: Boolean, default: false },
            optional: { type: Object, default: {} }
        },
        training: { type: Boolean, default: true },
        overallPercentage: { type: Number, default: 25, min: 0, max: 100 }
    },

    verification: {
        isVerified: { type: Boolean, default: false },
        verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        verifiedAt: Date,
        comments: String,
        verificationLevel: {
            type: String,
            enum: ['Pending', 'In Progress', 'Verified', 'Rejected'],
            default: 'Pending'
        },
        rejectionReason: String
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lastProfileUpdate: Date

}, {
    timestamps: true
});

// FIXED: Calculate completion percentage with better null checks
employeeSchema.methods.calculateCompletion = function () {
    let percentage = 25; // Basic info always filled by HR

    // Personal Details (37.5%)
    const personalFields = [
        this.personalDetails?.dateOfBirth,
        this.personalDetails?.contactNumber,
        this.personalDetails?.personalEmail,
        this.personalDetails?.panNumber,
        this.personalDetails?.aadhaarNumber,
        this.personalDetails?.emergencyContact?.name,
        this.personalDetails?.emergencyContact?.number,
        this.personalDetails?.currentAddress?.street,
        this.personalDetails?.currentAddress?.city,
        this.personalDetails?.currentAddress?.pincode,
        this.personalDetails?.bankDetails?.accountHolderName,
        this.personalDetails?.bankDetails?.bankName,
        this.personalDetails?.bankDetails?.accountNumber,
        this.personalDetails?.bankDetails?.ifscCode,
        this.personalDetails?.bankDetails?.branch
    ];

    // FIX: Use filter instead of every for better handling
    const filledPersonalFields = personalFields.filter(field => 
        field !== null && field !== undefined && field !== ''
    ).length;
    
    const personalCompletion = (filledPersonalFields / personalFields.length) * 37.5;
    this.completionStatus.personalDetails = filledPersonalFields === personalFields.length;
    percentage += personalCompletion;

    // Required Documents (37.5%) - Better null checks
    const docFields = [
        this.documents?.offerLetter,
        this.documents?.appointmentLetter,
        this.documents?.resume,
        this.documents?.passportPhoto,
        this.documents?.panCard,
        this.documents?.aadhaarCard,
        this.documents?.addressProof
    ];

    const filledDocFields = docFields.filter(doc => 
        doc !== null && doc !== undefined && doc !== ''
    ).length;

    // Check array documents
    const hasEducationalCerts = this.documents?.educationalCertificates?.length > 0;
    const hasIdProofs = this.documents?.idProofs?.length > 0;

    const totalDocFields = docFields.length + 2; // +2 for arrays
    const filledTotalDocFields = filledDocFields + (hasEducationalCerts ? 1 : 0) + (hasIdProofs ? 1 : 0);

    const docCompletion = (filledTotalDocFields / totalDocFields) * 37.5;
    this.completionStatus.documents.required = filledTotalDocFields === totalDocFields;
    percentage += docCompletion;

    this.completionStatus.overallPercentage = Math.round(percentage);
    return this.completionStatus.overallPercentage;
};

// FIXED: Check if ready for verification with null checks
employeeSchema.methods.isReadyForVerification = function () {
    this.calculateCompletion();
    return this.completionStatus.overallPercentage === 100 &&
        this.completionStatus.personalDetails &&
        this.completionStatus.documents.required;
};

// FIXED: Pre-save middleware with error handling
employeeSchema.pre('save', function (next) {
    try {
        this.calculateCompletion();
        this.lastProfileUpdate = new Date();
        next();
    } catch (error) {
        console.error('Error in pre-save middleware:', error);
        next();
    }
});

// Indexes
employeeSchema.index({ 'basicInfo.department': 1 });
employeeSchema.index({ 'verification.isVerified': 1 });
employeeSchema.index({ 'completionStatus.overallPercentage': 1 });

export default mongoose.model('Employee', employeeSchema);

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
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
    enum: ['teacher', 'student', 'admin', 'hr', 'employee'],
    default: 'teacher'
  },
  organization: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  profile: {
    avatar: String || null,
    bio: String,
    subjects: [String],
    grades: [String]
  }
}, {
  timestamps: true
});

userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.passwordHash);
};

userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

// Virtual for user activities
userSchema.virtual('activities', {
  ref: 'UserActivity',
  localField: '_id',
  foreignField: 'user'
});

// Virtual for user roles
userSchema.virtual('roles', {
  ref: 'UserRole',
  localField: '_id',
  foreignField: 'user'
});

export default mongoose.model('User', userSchema);

import mongoose from 'mongoose';

const userRoleSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['teacher', 'student', 'admin', 'hr', 'employee'],
    required: true
  },
  permissions: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Permission',
    required: true
  },
  customPermissions: {
    // Override default permissions for specific user
    templates: {
      access: [String],
      restrictions: [String]
    },
    features: {
      enabled: [String],
      disabled: [String]
    },
    limits: {
      dailyAiGenerations: Number,
      maxContentItems: Number,
      maxStorageMB: Number
    }
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  expiresAt: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
userRoleSchema.index({ user: 1, isActive: 1 });
userRoleSchema.index({ role: 1, isActive: 1 });

export default mongoose.model('UserRole', userRoleSchema);


import asyncHandler from "express-async-handler";
import School from "../models/School.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../config/cloudinary.js";

// Create new school
export const createSchool = asyncHandler(async (req, res) => {
  const {
    name,
    city,
    address,
    contactPersonName,
    mobile,
    email,
    trainersRequired,
  } = req.body;

  // Check if school already exists
  const schoolExists = await School.findOne({ email });
  if (schoolExists) {
    res.status(400);
    throw new Error("School with this email already exists");
  }

  let logoData = null;

  // Upload logo if provided
  if (req.body.logoBase64) {
    try {
      logoData = await uploadToCloudinary(req.body.logoBase64);
    } catch (error) {
      res.status(400);
      throw new Error("Logo upload failed");
    }
  }

  const school = await School.create({
    name,
    city,
    address,
    contactPersonName,
    mobile,
    email,
    trainersRequired: trainersRequired || 1,
    logo: logoData,
    createdBy: req.user._id,
    updatedBy: req.user._id,
  });

  const populatedSchool = await School.findById(school._id)
    .populate("currentTrainers", "basicInfo.fullName basicInfo.employeeId")
    .populate("createdBy", "name email")
    .populate("updatedBy", "name email");

  res.status(201).json({
    success: true,
    data: populatedSchool,
  });
});

// Get all schools
export const getSchools = asyncHandler(async (req, res) => {
  const { status, city, search } = req.query;

  let query = {};

  if (status) query.status = status;
  if (city) query.city = new RegExp(city, "i");
  if (search) {
    query.$or = [
      { name: new RegExp(search, "i") },
      { email: new RegExp(search, "i") },
      { contactPersonName: new RegExp(search, "i") },
    ];
  }

  const schools = await School.find(query)
    .populate("currentTrainers", "basicInfo.fullName basicInfo.employeeId")
    .populate("createdBy", "name email")
    .populate("updatedBy", "name email")
    .sort({ createdAt: -1 });

  // Add virtuals to response
  const schoolsWithVirtuals = schools.map((school) => ({
    ...school.toObject(),
    trainersCount: school.currentTrainers.length,
    trainerStatus: school.trainerStatus,
    trainerRequirementStatus: {
      required: school.trainersRequired,
      current: school.currentTrainers.length,
      needed: Math.max(
        0,
        school.trainersRequired - school.currentTrainers.length,
      ),
    },
  }));

  res.json({
    success: true,
    count: schools.length,
    data: schoolsWithVirtuals,
  });
});

// Get single school
export const getSchool = asyncHandler(async (req, res) => {
  const { id } = req.params
  if (!id || id === "undefined") {
    return res.status(400).json({
      success: false,
      message: "Id not found",
    });
  }
  const school = await School.findById(req.params?.id)
    .populate({
      path: "currentTrainers",
      select: "basicInfo.fullName basicInfo.employeeId basicInfo.designation",
      populate: {
        path: "user",
        select: "name email",
      },
    })
    .populate("createdBy", "name email")
    .populate("updatedBy", "name email");

  if (!school) {
    return res.status(400).json({
      success: false,
      message: "School not found",
    });
  }

  const schoolData = {
    ...school.toObject(),
    trainersCount: school.currentTrainers.length,
    trainerStatus: school.trainerStatus,
    trainerRequirementStatus: {
      required: school.trainersRequired,
      current: school.currentTrainers.length,
      needed: Math.max(
        0,
        school.trainersRequired - school.currentTrainers.length,
      ),
    },
  };

  res.json({
    success: true,
    data: schoolData,
  });
});

// Update school
export const updateSchool = asyncHandler(async (req, res) => {
  const school = await School.findById(req.params.id);

  if (!school) {
    return res.status(400).json({
      success: false,
      message: "School not found",
    });
  }

  const { status } = req.body;

  if (school.status === "active" && status === "inactive") {
    // Check if school has active trainers
    if (school.currentTrainers.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot deactivate school with active trainers. Reassign trainers first.",
      });
    }
  }

  let logoData = school.logo;

  // If new logo provided
  if (req.body.logoBase64) {
    // Delete old logo if exists
    if (school.logo && school.logo.public_id) {
      await deleteFromCloudinary(school.logo.public_id);
    }

    // Upload new logo
    try {
      logoData = await uploadToCloudinary(req.body.logoBase64);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Logo upload failed",
      });
    }
  }

  // Update school
  const updatedSchool = await School.findByIdAndUpdate(
    req.params.id,
    {
      ...req.body,
      logo: logoData,
      updatedBy: req.user._id,
    },
    { new: true, runValidators: true },
  )
    .populate("currentTrainers", "basicInfo.fullName basicInfo.employeeId")
    .populate("createdBy", "name email")
    .populate("updatedBy", "name email");

  res.json({
    success: true,
    data: updatedSchool,
  });
});

// Delete school
export const deleteSchool = asyncHandler(async (req, res) => {
  const school = await School.findById(req.params.id);

  if (!school) {
    return res.status(400).json({
      success: false,
      message: "School not found",
    });
  }

  // Check if school has active trainers
  if (school.currentTrainers.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Cannot delete school with active trainers. Reassign trainers first.",
    });
  }

  // Delete logo from cloudinary
  if (school.logo && school.logo.public_id) {
    await deleteFromCloudinary(school.logo.public_id);
  }

  await school.deleteOne();

  res.json({
    success: true,
    message: "School deleted successfully",
  });
});

// Get school dashboard stats
export const getSchoolStats = asyncHandler(async (req, res) => {
  const totalSchools = await School.countDocuments();
  const activeSchools = await School.countDocuments({ status: "active" });
  const inactiveSchools = await School.countDocuments({ status: "inactive" });

  const schools = await School.find({ status: "active" });

  let totalTrainersRequired = 0;
  let totalCurrentTrainers = 0;

  schools.forEach((school) => {
    totalTrainersRequired += school.trainersRequired;
    totalCurrentTrainers += school.currentTrainers.length;
  });

  const shortage = Math.max(0, totalTrainersRequired - totalCurrentTrainers);

  // Schools with critical shortage
  const criticalSchools = schools.filter(
    (school) => school.currentTrainers.length === 0,
  ).length;

  // Schools with adequate trainers
  const adequateSchools = schools.filter(
    (school) => school.currentTrainers.length >= school.trainersRequired,
  ).length;

  // Schools with shortage
  const shortageSchools = schools.filter(
    (school) =>
      school.currentTrainers.length > 0 &&
      school.currentTrainers.length < school.trainersRequired,
  ).length;

  res.json({
    success: true,
    data: {
      totalSchools,
      activeSchools,
      inactiveSchools,
      trainers: {
        required: totalTrainersRequired,
        current: totalCurrentTrainers,
        shortage,
        adequacy:
          totalTrainersRequired > 0
            ? Math.round((totalCurrentTrainers / totalTrainersRequired) * 100)
            : 100,
      },
      schoolsStatus: {
        critical: criticalSchools,
        shortage: shortageSchools,
        adequate: adequateSchools,
      },
    },
  });
});

// Get school's trainers
export const getSchoolTrainers = asyncHandler(async (req, res) => {

  const { id } = req.params
  if (!id || id === "undefined") {
    return res.status(400).json({
      success: false,
      message: "Id not found",
    });
  }
  const school = await School.findById(req.params?.id).populate({
    path: "currentTrainers",
    select: "basicInfo.fullName basicInfo.employeeId basicInfo.designation",
    populate: {
      path: "user",
      select: "name email",
    },
  });

  if (!school) {
    return res.status(400).json({
      success: false,
      message: "School not found",
    });
  }

  res.json({
    success: true,
    data: {
      school: {
        _id: school._id,
        name: school.name,
        trainersRequired: school.trainersRequired,
        currentCount: school.currentTrainers.length,
        needed: Math.max(
          0,
          school.trainersRequired - school.currentTrainers.length,
        ),
      },
      trainers: school.currentTrainers,
    },
  });
});

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


        // Validate required fields
        if (!name || !email || !password || !employeeId || !designation || !department || !reportingManager || !dateOfJoining || !employmentType || !workMode || !workLocation || !salary) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Validate password strength
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        if (req.user.role !== 'admin' && role === 'admin') {
            return res.status(403).json({
                success: false,
                message: "Only admin can create admin account."
            });
        }
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Check if employee ID already exists
        const existingEmployee = await Employee.findOne({
            'basicInfo.employeeId': employeeId
        });
        if (existingEmployee) {
            return res.status(400).json({
                success: false,
                message: 'Employee ID already exists'
            });
        }


        // Create user account
        const user = new User({
            name,
            email,
            passwordHash: password,
            role: role,
            organization: organization || '',
        });

        await user.save();


        // Assign default permissions based on role
        const defaultPermissions = await Permission.findOne({ role });
        const userRole = new UserRole({
            user: user._id,
            role: role,
            permissions: defaultPermissions?._id || null
        });

        await userRole.save();

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
                employeeStatus: 'Active'
            },
            createdBy: req.user._id,
            lastUpdatedBy: req.user._id
        });

        await employee.save();

        // console.log(employee)
        // Send welcome email to employee
        await sendWelcomeEmail(email, name, employeeId, password);

        // Log registration activity
        await UserActivity.create({
            user: user._id,
            action: 'user_created',
            resourceType: 'user',
            details: {
                selfRegistration: true,
                role: role,
                organization: organization || ''
            },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });


        res.status(201).json({
            success: true,
            message: 'Employee created successfully',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                employee: {
                    employeeId: employee.basicInfo.employeeId,
                    designation: employee.basicInfo.designation,
                    department: employee.basicInfo.department
                }
            }
        });

    } catch (error) {
        console.error('Create employee error:', error);

        // Cleanup if error occurs
        if (req.body.email) {
            await User.findOneAndDelete({ email: req.body.email });
        }

        res.status(500).json({
            success: false,
            message: 'Error creating employee',
            error: error.message
        });
    }
};

// Get all employees for HR
export const getAllEmployees = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            department = '',
            status = ''
        } = req.query;

        const query = {};

        if (search) {
            query['$or'] = [
                { 'basicInfo.fullName': { $regex: search, $options: 'i' } },
                { 'basicInfo.employeeId': { $regex: search, $options: 'i' } },
                { 'basicInfo.designation': { $regex: search, $options: 'i' } }
            ];
        }

        if (department) {
            query['basicInfo.department'] = department;
        }

        if (status) {
            query['basicInfo.employeeStatus'] = status;
        }

        const employees = await Employee.find(query)
            .populate('user', 'name email role isActive lastLogin')
            .populate({ path: 'basicInfo.reportingManager', select: 'name email' })
            .populate('createdBy', 'name email')
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
                total
            }
        });
    } catch (error) {
        console.error('Get all employees error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getAllActiveEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({ "basicInfo.employeeStatus": "Active" })
      .select("basicInfo.fullName basicInfo.employeeId basicInfo.designation basicInfo.department basicInfo.employeeStatus",)
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

