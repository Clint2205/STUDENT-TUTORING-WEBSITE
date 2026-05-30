import express from "express";
import multer from "multer";

import { protect, requireRole } from "../middleware/auth.middleware.js";

import {
  getStudentMe,
  getStudentResources,
  markResourcesSeen,
  dismissResource,
  submitResourceWork
} from "../controllers/studentController.js";

const router = express.Router();

// ---------------- multer setup ----------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/submissions"),

  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, "_");

    cb(null, `${Date.now()}-${safeName}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024
  }
});
// ---------------------------------------------

// Student-only
router.use(protect);
router.use(requireRole("student"));

// /api/student/me
router.get("/me", getStudentMe);

// /api/student/resources
router.get("/resources", getStudentResources);

// optional notifications baseline
router.post("/resources/seen", markResourcesSeen);

// dismiss
router.post("/resources/:id/dismiss", dismissResource);

// ✅ submit work
router.post(
  "/resources/:id/submit",
  upload.single("file"),
  submitResourceWork
);

export default router;