// adminRoutes.js - Routes for admin-specific actions, such as managing user approvals and resources.

import express from "express";
import {
  getPendingUsers,
  getApprovedUsers,
  approveUser,
  rejectUser,
  getResources,
  createResource,
  deleteResource,
  getTutorPayments,
  markTutorPaid,
  getPaymentHistory
} from "../controllers/adminController.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";

import { upload } from "../middleware/upload.middleware.js";
import { createResourceWithUpload } from "../controllers/adminController.js";


const router = express.Router();

router.get("/users/approved", protect, adminOnly, getApprovedUsers);
router.get("/users/pending", protect, adminOnly, getPendingUsers);
router.put("/users/:id/approve", protect, adminOnly, approveUser);
router.delete("/users/:id/reject", protect, adminOnly, rejectUser);
router.get("/resources", protect, adminOnly, getResources);
router.post("/resources", protect, adminOnly, createResource);
router.delete("/resources/:id", protect, adminOnly, deleteResource);
router.post("/resources/upload",protect,adminOnly,upload.single("file"),createResourceWithUpload);
router.get("/tutor-payments", protect, adminOnly, getTutorPayments);
router.put("/tutor-payments/:id/mark-paid", protect, adminOnly, markTutorPaid);
router.put(
  "/tutor-payments/:id/mark-paid",
  protect,
  adminOnly,
  markTutorPaid
);

router.get(
  "/payment-history",
  protect,
  adminOnly,
  getPaymentHistory
);

export default router;
