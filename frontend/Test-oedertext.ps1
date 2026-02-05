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

import express from 'express';
import {
  createSchool,
  getSchools,
  getSchool,
  updateSchool,
  deleteSchool,
  getSchoolStats,
  getSchoolTrainers
} from '../controllers/schoolController.js';

import { authenticate } from '../middleware/auth.js'
import { requireAdminOrHR } from '../middleware/profileCompletion.js'

const router = express.Router();

router.route('/')
  .get(authenticate, getSchools)
  .post(authenticate, requireAdminOrHR, createSchool);

router.route('/dashboard/stats').get(authenticate, requireAdminOrHR, getSchoolStats);

router.route('/:id')
  .get(authenticate, getSchool)
  .put(authenticate, requireAdminOrHR, updateSchool)
  .delete(authenticate, requireAdminOrHR, deleteSchool);

router.route('/:id/trainers').get(authenticate, getSchoolTrainers);

export default router;


http://localhost:5000/api/schools agar ham es par hit karte hai to ye data aata sare school aate hai 
{
    "success": true,
    "count": 6,
    "data": [
        {
            "logo": null,
            "_id": "69841b20ef6741cce661d96b",
            "name": "ABC School",
            "city": "Delhi",
            "address": "Street 1",
            "contactPersonName": "Ramesh Kumar",
            "mobile": "9876543210",
            "email": "abc@test.com",
            "status": "active",
            "trainersRequired": 2,
            "currentTrainers": [],
            "createdBy": "69841aa0aa7c57865ddc9364",
            "updatedBy": "69841aa0aa7c57865ddc9364",
            "createdAt": "2026-02-05T04:22:56.517Z",
            "updatedAt": "2026-02-05T04:22:56.517Z",
            "__v": 0,
            "trainersCount": 0,
            "trainerStatus": "critical",
            "trainerRequirementStatus": {
                "required": 2,
                "current": 0,
                "needed": 2
            }
        },
        {
            "logo": null,
            "_id": "69842889921c173273b57977",
            "name": "XYZ School",
            "city": "Delhi",
            "address": "Street 1",
            "contactPersonName": "Ramesh Kumar",
            "mobile": "9876543210",
            "email": "cyz@test.com",
            "status": "active",
            "trainersRequired": 2,
            "currentTrainers": [],
            "createdBy": "69841aa0aa7c57865ddc9364",
            "updatedBy": "69841aa0aa7c57865ddc9364",
            "createdAt": "2026-02-05T05:20:09.532Z",
            "updatedAt": "2026-02-05T05:20:09.532Z",
            "__v": 0,
            "trainersCount": 0,
            "trainerStatus": "critical",
            "trainerRequirementStatus": {
                "required": 2,
                "current": 0,
                "needed": 2
            }
        },
        {
            "logo": null,
            "_id": "69842897921c173273b5797e",
            "name": "tmk   School",
            "city": "Delhi",
            "address": "Street 1",
            "contactPersonName": "Ramesh Kumar",
            "mobile": "9876543210",
            "email": "tmk@test.com",
            "status": "active",
            "trainersRequired": 2,
            "currentTrainers": [],
            "createdBy": "69841aa0aa7c57865ddc9364",
            "updatedBy": "69841aa0aa7c57865ddc9364",
            "createdAt": "2026-02-05T05:20:23.821Z",
            "updatedAt": "2026-02-05T05:20:23.821Z",
            "__v": 0,
            "trainersCount": 0,
            "trainerStatus": "critical",
            "trainerRequirementStatus": {
                "required": 2,
                "current": 0,
                "needed": 2
            }
        },
        {
            "logo": null,
            "_id": "6984289b921c173273b57985",
            "name": "tmk   School",
            "city": "Delhi",
            "address": "Street 1",
            "contactPersonName": "Ramesh Kumar",
            "mobile": "9876543210",
            "email": "tmffk@test.com",
            "status": "active",
            "trainersRequired": 2,
            "currentTrainers": [],
            "createdBy": "69841aa0aa7c57865ddc9364",
            "updatedBy": "69841aa0aa7c57865ddc9364",
            "createdAt": "2026-02-05T05:20:27.593Z",
            "updatedAt": "2026-02-05T05:20:27.593Z",
            "__v": 0,
            "trainersCount": 0,
            "trainerStatus": "critical",
            "trainerRequirementStatus": {
                "required": 2,
                "current": 0,
                "needed": 2
            }
        },
        {
            "logo": null,
            "_id": "698428a0921c173273b5798c",
            "name": "tmk   School",
            "city": "Delhi",
            "address": "Street 1",
            "contactPersonName": "Ramesh Kumar",
            "mobile": "9876543210",
            "email": "tmddffk@test.com",
            "status": "active",
            "trainersRequired": 2,
            "currentTrainers": [],
            "createdBy": "69841aa0aa7c57865ddc9364",
            "updatedBy": "69841aa0aa7c57865ddc9364",
            "createdAt": "2026-02-05T05:20:32.292Z",
            "updatedAt": "2026-02-05T05:20:32.292Z",
            "__v": 0,
            "trainersCount": 0,
            "trainerStatus": "critical",
            "trainerRequirementStatus": {
                "required": 2,
                "current": 0,
                "needed": 2
            }
        },
        {
            "logo": null,
            "_id": "69842eb0921c173273b57b45",
            "name": "aaklna School",
            "city": "Delhi",
            "address": "Street 1",
            "contactPersonName": "Ramesh Kumar",
            "mobile": "9876543210",
            "email": "aaklan@test.com",
            "status": "active",
            "trainersRequired": 2,
            "currentTrainers": [],
            "createdBy": "69841aa0aa7c57865ddc9364",
            "updatedBy": "69841aa0aa7c57865ddc9364",
            "createdAt": "2026-02-05T05:46:24.547Z",
            "updatedAt": "2026-02-05T05:46:24.547Z",
            "__v": 0,
            "trainersCount": 0,
            "trainerStatus": "critical",
            "trainerRequirementStatus": {
                "required": 2,
                "current": 0,
                "needed": 2
            }
        }
    ]
}


ab hame bnani hai school ke liye Oeder Management es me 
Admin Side se Sabse pahle 
sare school ka dropdown hoga waha se School select karega ,Fir book type Select karega : ELP,LTE,CAC and CTF agar ek book type select kar ke sare detail bhar dega fir se dusra type bhi select kar sakta hai 

fir kit select karega : Wonder Kit: Combo pack hoga quantity, unit price enter karega fir auto calculate total price,Nexus Kit: Combo pack hoga quantity, unit price enter karega fir auto calculate total price,Individual Kit: agar Individual Kit select karega to ek input aayega jisme kit ka name likhega uska quantity, unit price and total price show hoga automatically calculate hoga aur agar aur kit add karna chahe to ek button hoga "Add More Kit" uspe click karne se firse ek input aayega jisme kit ka name likhega uska quantity, unit price and total price show hoga automatically calculate hoga
sabse nichhe ek Discount input hoga waha par discount type karega 




Early Learning Program (ELP)
    (- Pre-Nursery Program
        - Math O Mania Part-1
        - Math O Mania Part-2
        - Alpha O Mania Part-1
        - Alpha O Mania Part-2
        - Pyare Axar Part-1
        - Pyare Axar Part-2
        - Pyare Axar Part-3
        - Rhyme Book
        - Steamheartia) 
        combo pack ka quantity , unit price enter karega and total price show hoga automatically calculate hoga aur ek option ye bhi ho sakta hai ki sab alag alag book bhi le sakta hai for Example: ek input aayega jisme book ka name likhega uska quantity, unit price and total price show hoga automatically calculate hoga aur agar aur book add karna chahe to ek button hoga "Add More Book" uspe click karne se firse ek input aayega jisme book ka name likhega uska quantity, unit price and total price show hoga automatically calculate hoga
    (- LKG
        - Axar Masti Part-1
        - Axar Masti Part-2
        - Letter Land Heroes
        - Number Nuts Part-1
        - Number Nuts Part-2
        - Rhyme Book
        - SoundTopia
        - Thinky Tots Lab)
        combo pack ka quantity , unit price enter karega and total price show hoga automatically calculate hoga aur ek option ye bhi ho sakta hai ki sab alag alag book bhi le sakta hai for Example: ek input aayega jisme book ka name likhega uska quantity, unit price and total price show hoga automatically calculate hoga aur agar aur book add karna chahe to ek button hoga "Add More Book" uspe click karne se firse ek input aayega jisme book ka name likhega uska quantity, unit price and total price show hoga automatically calculate hoga
    (- UKG
        - Kahani Kadam Part-1
        - Kahani Kadam Part-2
        - Number Bots Part-1
        - Number Bots Part-2
        - PenPals Paradise Part-1
        - SoundSpark Part-1
        - Rhyme Bunny
        - Tiny Tinker Lab)
        combo pack ka quantity , unit price enter karega and total price show hoga automatically calculate hoga aur ek option ye bhi ho sakta hai ki sab alag alag book bhi le sakta hai for Example: ek input aayega jisme book ka name likhega uska quantity, unit price and total price show hoga automatically calculate hoga aur agar aur book add karna chahe to ek button hoga "Add More Book" uspe click karne se firse ek input aayega jisme book ka name likhega uska quantity, unit price and total price show hoga automatically calculate hoga
Little Tech Explorers (LTE)
        - Grade 1 
        - Grade 2
        - Grade 3
        - Grade 4
        - Grade 5 
        Ye Grade wise book hai combo pack nahi hai jaise Grade select karega to uske under ek hi book show hoga uska quantity, unit price enter karega and total price auto calculate hoga
        for Example : LTE Grade 1 select karne par ek hi book show hoga jiska name hoga "LTE Grade 1" fir uska quantity, unit price enter karega and total price auto calculate hoga fir aur add karne ka option hoga fir se Grade 2 select karne par ek hi book show hoga jiska name hoga "LTE Grade 2" fir uska quantity, unit price enter karega and total price auto calculate hoga esi tarah se sab Grade ke liye hoga
Coding & Computer (CAC)
        - Grade 1
        - Grade 2
        - Grade 3
        - Grade 4
        - Grade 5
        - Grade 6
        - Grade 7
        - Grade 8
        Ye Grade wise book hai combo pack nahi hai jaise Grade select karega to uske under ek hi book show hoga uska quantity, unit price enter karega and total price auto calculate hoga
        for Example : CAC Grade 1 select karne par ek hi book show hoga jiska name hoga "CAC Grade 1" fir uska quantity, unit price enter karega and total price auto calculate hoga fir aur add karne ka option hoga fir se Grade 2 select karne par ek hi book show hoga jiska name hoga "CAC Grade 2" fir uska quantity, unit price enter karega and total price auto calculate hoga esi tarah se sab Grade ke liye hoga
Creative Tech for Future (CTF)
        - Grade 6
        - Grade 7
        - Grade 8
        - Grade 9-12
        Ye Grade wise book hai combo pack nahi hai jaise Grade select karega to uske under ek hi book show hoga uska quantity, unit price enter karega and total price auto calculate hoga
        for Example : CTF Grade 6 select karne par ek hi book show hoga jiska name hoga "CTF Grade 6" fir uska quantity, unit price enter karega and total price auto calculate hoga fir aur add karne ka option hoga fir se Grade 7 select karne par ek hi book show hoga jiska name hoga "CTF Grade 7" fir uska quantity, unit price enter karega and total price auto calculate hoga esi tarah se sab Grade ke liye hoga


Wonder Kit : Combo Pack 
Nexus Kit  : Combo Pack
Individual Kit : Alag Alag Kit le sakta hai jaise ek input hoga jisme kit ka name likhega uska quantity, unit price and total price show hoga automatically calculate hoga aur agar aur kit add karna chahe to ek button hoga "Add More Kit" uspe click karne se firse ek input aayega jisme kit ka name likhega uska quantity, unit price and total price show hoga automatically calculate hoga


fir  sara ek sath total price calculate hoga fir us me se discount input hoga waha par enter karega auto subtract hoga total price se and then click Submit btn 

ab ek aur page hoga  jaha 4 btn hoga : Payment Status ,Slip Download,Edit Detail and Dispatch es me se kisi par bhi click kare to pop up hona chahiye 
-- Payment Status : Paid and unpaid 
-- Dispatch ke under : sabse pahle invoice number auto generate :School ke 4 first 4 letter /session year/unick id 1 2 3 es tarah,To Detail,From Detail,fir jo bhi detail jaise book kitna kisme ,kit kitna kis me ye sara ka payment and last me discount etna fir total etna 

-- Download Slip Btn 
-- Edit btn jaha se book and kit detail update kare ek baar dispatch ho jaye to edit nahi kar sakta 



