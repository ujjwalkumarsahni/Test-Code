import express from "express";
import {
  createSchool,
  getSchools,
  getSchool
} from "../controllers/schoolController.js";

const router = express.Router();

// Create School
router.post("/", createSchool);

// Get All Schools
router.get("/", getSchools);

// Get Single School by ID
router.get("/:id", getSchool);

export default router;
