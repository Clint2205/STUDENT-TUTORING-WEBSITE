import express from "express";
import {
  getPendingUsers,
  approveUser,
  rejectUser
} from "../controllers/adminController.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/users/pending", protect, adminOnly, getPendingUsers);
router.put("/users/:id/approve", protect, adminOnly, approveUser);
router.delete("/users/:id/reject", protect, adminOnly, rejectUser);

export default router;
