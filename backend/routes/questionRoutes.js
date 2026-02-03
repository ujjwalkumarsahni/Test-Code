import express from "express";
import { addQuestion, getExamQuestions } from "../controllers/questionController.js";

const router = express.Router();

// Add question to exam
router.post("/", addQuestion);

// Get all questions of an exam
router.get("/:examId", getExamQuestions);

export default router;
