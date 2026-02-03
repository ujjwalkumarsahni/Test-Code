import express from "express";
import {
  createEmployee,
  getActiveEmployeebyId
} from "../controllers/employeeController.js";

const router = express.Router();

/**
 * @route   POST /api/employees
 * @desc    Create employee
 * @access  Private (auth middleware agar laga ho)
 */
router.post("/", createEmployee);

/**
 * @route   GET /api/employees/:id
 * @desc    Get active employee by id
 * @access  Private
 */
router.get("/:id", getActiveEmployeebyId);

export default router;
