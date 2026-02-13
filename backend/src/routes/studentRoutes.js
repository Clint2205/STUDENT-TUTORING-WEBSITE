// backend/src/routes/studentRoutes.js
import express from "express";
import { protect, requireRole } from "../middleware/auth.middleware.js";
import {
  getStudentMe,
  getStudentResources,
  markResourcesSeen,
  dismissResource
} from "../controllers/studentController.js";

const router = express.Router();

// Student-only
router.use(protect);
router.use(requireRole("student"));

// /api/student/me
router.get("/me", getStudentMe);

// /api/student/resources
router.get("/resources", getStudentResources);

// optional notifications baseline
router.post("/resources/seen", markResourcesSeen);

// ✅ FIX: must include :id to match frontend call
router.post("/resources/:id/dismiss", dismissResource);

export default router;
