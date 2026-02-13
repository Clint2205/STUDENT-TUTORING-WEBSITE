// backend/src/controllers/studentController.js
import User from "../models/User.js";
import Resource from "../models/Resource.js";
import mongoose from "mongoose";

// GET /api/student/me
export const getStudentMe = async (req, res) => {
  try {
    const me = await User.findById(req.user._id)
      .select("_id name email role tutorIds lastSeenResourcesAt")
      .populate("tutorIds", "_id name email");

    return res.json(me);
  } catch (err) {
    console.error("getStudentMe error:", err);
    return res.status(500).json({ message: err.message });
  }
};

// GET /api/student/resources
export const getStudentResources = async (req, res) => {
  try {
    const studentId = req.user._id;

    const student = await User.findById(studentId)
      .select("_id tutorIds hiddenResourceIds")
      .lean();

    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    if (!student.tutorIds || student.tutorIds.length === 0) {
      return res.status(400).json({
        message: "No tutors assigned yet. Please contact your tutor/admin."
      });
    }

    const hiddenIds = (student.hiddenResourceIds || []).map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    const tutorIds = student.tutorIds.map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    // Allow admin “global” resources too
    const adminUsers = await User.find({ role: "admin" }).select("_id").lean();
    const adminIds = adminUsers.map((u) => u._id);

    const filter = {
      $and: [
        {
          $or: [
            { assignedTo: new mongoose.Types.ObjectId(studentId) },
            { audienceRole: { $in: ["student", "all"] } }
          ]
        },
        {
          createdBy: { $in: [...tutorIds, ...adminIds] }
        },
        { _id: { $nin: hiddenIds } }
      ]
    };

    const resources = await Resource.find(filter)
      .sort({ createdAt: -1 })
      .populate("createdBy", "_id name role")
      .lean();

    return res.json(resources);
  } catch (err) {
    console.error("getStudentResources error:", err);
    return res.status(500).json({ message: err.message });
  }
};

// POST /api/student/resources/seen
export const markResourcesSeen = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      lastSeenResourcesAt: new Date()
    });
    return res.json({ message: "OK" });
  } catch (err) {
    console.error("markResourcesSeen error:", err);
    return res.status(500).json({ message: err.message });
  }
};

// POST /api/student/resources/:id/dismiss
export const dismissResource = async (req, res) => {
  try {
    const resourceId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(resourceId)) {
      return res.status(400).json({ message: "Invalid resource id" });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { hiddenResourceIds: new mongoose.Types.ObjectId(resourceId) }
    });

    return res.json({ message: "Dismissed" });
  } catch (err) {
    console.error("dismissResource error:", err);
    return res.status(500).json({ message: err.message });
  }
};
