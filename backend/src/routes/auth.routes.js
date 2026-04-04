// auth.routes.js - Routes for user authentication, including registration, login, and fetching the current user's profile.

import express from "express";
import { registerUser, loginUser } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js"
import { getMe } from "../controllers/auth.controller.js"
import { SUBJECT_OPTIONS } from "../controllers/auth.controller.js";
import { getMatchingTutors } from "../controllers/auth.controller.js";
import { changePassword } from "../controllers/auth.controller.js";
import { resetChildPassword } from "../controllers/parentController.js";


const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.get("/subjects", (req, res) => {
  res.json({ subjects: SUBJECT_OPTIONS });
});
router.get("/tutors/match", getMatchingTutors);
// password change after first login
router.post("/change-password", changePassword);

// parent reset child password
router.post("/parent/reset-child-password", protect, resetChildPassword);




export default router;
