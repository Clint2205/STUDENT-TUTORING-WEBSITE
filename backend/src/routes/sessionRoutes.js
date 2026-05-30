// routes/sessionRoutes.js

import express from "express";
import Session from "../models/Sessions.js";
import { protect } from "../middleware/auth.middleware.js";
import {
  updateSessionProgress
} from "../controllers/sessionController.js";

const router = express.Router();




router.put("/:id/progress", protect, updateSessionProgress);
// ✅ GET all sessions for logged-in tutor
router.get("/tutor/sessions", protect, async (req, res) => {
  try {
    const sessions = await Session.find({ tutorId: req.user._id })
      .populate("studentId", "name email")
      .populate("resourceId", "title type")
      .sort({ createdAt: -1 });

    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete(
  "/:id/progress",
  protect,
  async (req, res) => {

    try {

      const session =
        await Session.findById(req.params.id);

      if (!session) {
        return res.status(404).json({
          message: "Session not found"
        });
      }

      // reset progress
      session.progress = {
        completionStatus: "not_completed",
        understandingLevel: 3,
        tutorNotes: "",
        skills: []
      };

      await session.save();

      res.json({
        message: "Progress deleted"
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({
        message: "Server error"
      });

    }

  }
);



// ✅ REQUIRED
export default router;