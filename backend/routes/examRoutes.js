import express from "express";
import { createExam } from "../controllers/examController.js";

const router = express.Router();

// Create Exam
router.post("/", createExam);

export default router;
