// routes/tutorroutes.js
import express from "express"
import multer from "multer"

import { protect, requireRole } from "../middleware/auth.middleware.js"
import {
  getMyStudents,
  getMyResources,
  createTutorResource,
  deleteTutorResource,
  uploadTutorResource // ✅ add this
} from "../controllers/tutorController.js"

const router = express.Router()

router.use(protect)
router.use(requireRole("tutor"))

// ---------------- multer setup ----------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/resources"),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, "_")
    cb(null, `${Date.now()}-${safeName}`)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB
})
// ---------------------------------------------

router.get("/students", getMyStudents)
router.get("/resources", getMyResources)
router.post("/resources", createTutorResource)
router.delete("/resources/:id", deleteTutorResource)

// ✅ File upload endpoint
router.post("/resources/upload", upload.single("file"), uploadTutorResource)

export default router
