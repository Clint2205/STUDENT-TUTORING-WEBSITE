import express from "express";
import { protect, restrictTo } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/admin", protect, restrictTo("admin"), (req, res) => {
  res.json({ message: "Welcome admin!" });
});

router.get("/tutor", protect, restrictTo("tutor"), (req, res) => {
  res.json({ message: "Welcome tutor!" });
});

export default router;
