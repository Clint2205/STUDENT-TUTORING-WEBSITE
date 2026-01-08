// backend/src/routes/adminCheck.js
import express from "express";
import User from "../models/User.js";

const router = express.Router();

// GET /api/admin/check
router.get("/check", async (req, res) => {
  try {
    const adminExists = await User.exists({ role: "admin" });
    res.json({ adminExists: !!adminExists });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
