import express from "express";
import { registerStudent } from "../controllers/studentController.js";

const router = express.Router();

// Register Student
router.post("/", registerStudent);

export default router;
