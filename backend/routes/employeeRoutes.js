import express from "express";
import { bulkCreateStudents, createStudent, getEmployeeById, getEmployees } from "../controllers/employeeController.js";
import { protect } from "../middleware/auth.js";
import { allowRoles } from "../middleware/role.js";
import { schoolScope } from "../middleware/schoolScope.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

/* ================= CREATE STUDENT ================= */
router.post(
  "/student",
  protect,
  allowRoles("employee"),
  schoolScope,
  createStudent
);

router.post(
  "/student/bulk",
  protect,
  allowRoles("employee"),
  upload.single("file"),
  bulkCreateStudents
);

router.get(
  "/",
  protect,
  allowRoles("admin","employee"),
  getEmployees
);

router.get(
  "/:id",
  protect,
  allowRoles("admin","employee"),
  getEmployeeById
);


export default router;
