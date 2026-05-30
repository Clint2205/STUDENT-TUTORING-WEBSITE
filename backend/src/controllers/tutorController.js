// src/controllers/tutorController.js

import User from "../models/User.js"
import Resource from "../models/Resource.js"
import Session from "../models/Sessions.js"

// GET /api/tutor/students
export const getMyStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student", tutorIds: req.user._id })
      .select("_id name email")
      .sort({ name: 1 })

    return res.json(students)
  } catch (err) {
    console.error("getMyStudents error:", err)
    return res.status(500).json({ message: err.message })
  }
}

// GET /api/tutor/resources
export const getMyResources = async (req, res) => {
  try {
    const myStudents = await User.find({ role: "student", tutorIds: req.user._id }).select("_id");
    const myStudentIds = myStudents.map(s => s._id);

    const adminUsers = await User.find({ role: "admin" }).select("_id").lean();
    const adminIds = adminUsers.map(u => u._id);

    const resources = await Resource.find({
      $or: [
        // tutor's own resources
        { createdBy: req.user._id },

        // admin global resources (optional)
        { createdBy: { $in: adminIds }, audienceRole: "all" },

        // resources assigned to tutor's students (only tutor/admin should be creating those)
        { assignedTo: { $in: myStudentIds }, createdBy: { $in: [req.user._id, ...adminIds] } }
      ]
    })
      .sort({ createdAt: -1 })
      .populate("createdBy", "_id name role")
      .populate("submissions.studentId", "_id name")
      .lean();

    return res.json(resources);
  } catch (err) {
    console.error("getMyResources error:", err);
    return res.status(500).json({ message: err.message });
  }
};


// POST /api/tutor/resources
export const createTutorResource = async (req, res) => {
  try {
    // ✅ Match Resource.js schema: title (required), type (required), url (optional)
    const { title, type, url, audienceRole, assignedTo = [] } = req.body

    // ✅ Prevent Mongoose 500s (send 400 instead)
    if (!title?.trim()) {
      return res.status(400).json({ message: "Title is required." })
    }
    if (!type) {
      return res.status(400).json({ message: "Type is required." })
    }

    

    // ✅ validate assignedTo are *their* students
    const count = await User.countDocuments({
      _id: { $in: assignedTo },
      role: "student",
      tutorIds: req.user._id
    })

    if (assignedTo.length && count !== assignedTo.length) {
      return res.status(400).json({ message: "Some assigned students are not yours." })
    }

    const resource = await Resource.create({
      title: title.trim(),
      type,                    // ✅ REQUIRED BY SCHEMA
      url: url?.trim() || "",  // ✅ schema field is `url`
      audienceRole,
      assignedTo,
      createdBy: req.user._id
    })

    return res.status(201).json(resource)
  } catch (err) {
    console.error("createTutorResource error:", err)
    return res.status(500).json({ message: err.message })
  }
}

// POST /api/tutor/resources/upload  (multipart/form-data)
export const uploadTutorResource = async (req, res) => {
  try {
    const { title, type, url, audienceRole, assignedTo = [] } = req.body

    if (!title?.trim()) return res.status(400).json({ message: "Title is required." })
    if (!type) return res.status(400).json({ message: "Type is required." })
    if (!req.file) return res.status(400).json({ message: "File is required." })

    // assignedTo arrives as string or array depending on form-data usage
    const assignedArray =
      typeof assignedTo === "string"
        ? assignedTo.split(",").filter(Boolean)
        : assignedTo

    // validate assignedTo are *their* students
    const count = await User.countDocuments({
      _id: { $in: assignedArray },
      role: "student",
      tutorIds: req.user._id
    })

    if (assignedArray.length && count !== assignedArray.length) {
      return res.status(400).json({ message: "Some assigned students are not yours." })
    }

    const resource = await Resource.create({
      title: title.trim(),
      type,
      url: url?.trim() || "",
      audienceRole,
      assignedTo: assignedArray,
      createdBy: req.user._id,
      file: {
        originalName: req.file.originalname,
        filename: req.file.filename,
        url: `/uploads/resources/${req.file.filename}`,
        mimetype: req.file.mimetype,
        size: req.file.size
      }
    })

    return res.status(201).json(resource)
  } catch (err) {
    console.error("uploadTutorResource error:", err)
    return res.status(500).json({ message: err.message })
  }
}


// DELETE /api/tutor/resources/:id
export const deleteTutorResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
    if (!resource) return res.status(404).json({ message: "Not found" })

    // Tutors can only delete resources they created
    if (String(resource.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ message: "Forbidden" })
    }

    await resource.deleteOne()
    return res.json({ message: "Deleted" })
  } catch (err) {
    console.error("deleteTutorResource error:", err)
    return res.status(500).json({ message: err.message })
  }
}
// POST /api/tutor/sessions
export const createSession = async (req, res) => {
  try {
    const { studentId, duration, notes, resourceId } = req.body;

    if (!studentId || !duration) {
      return res.status(400).json({
        message: "studentId and duration are required."
      });
    }

    if (duration <= 0) {
      return res.status(400).json({
        message: "Duration must be greater than 0."
      });
    }

    // ✅ Ensure student belongs to this tutor
    const student = await User.findOne({
      _id: studentId,
      role: "student",
      tutorIds: req.user._id
    });

    if (!student) {
      return res.status(403).json({
        message: "You can only log sessions for your own students."
      });
    }

    // ✅ Get tutor hourly rate (add this field to User later if not present)
    const tutor = await User.findById(req.user._id);
    const hourlyRate = tutor.hourlyRate || 20; // fallback

    const totalAmount = duration * hourlyRate;

    const session = await Session.create({
      tutorId: req.user._id,
      studentId,
      duration,
      hourlyRate,
      totalAmount,
      notes,
      resourceId
    });

    return res.status(201).json(session);
  } catch (err) {
    console.error("createSession error:", err);
    return res.status(500).json({ message: err.message });
  }
};
// GET /api/tutor/dashboard
export const tutorDashboard = async (req, res) => {
  try {
    const tutorId = req.user._id;

    const stats = await Session.aggregate([
      { $match: { tutorId } },
      {
        $group: {
          _id: null,
          totalHours: { $sum: "$duration" },
          totalEarnings: { $sum: "$totalAmount" },
          totalSessions: { $sum: 1 }
        }
      }
    ]);

    const students = await User.countDocuments({
      role: "student",
      tutorIds: tutorId
    });

    return res.json({
      ...(stats[0] || {
        totalHours: 0,
        totalEarnings: 0,
        totalSessions: 0
      }),
      totalStudents: students
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
  
};

// PUT /api/tutor/rate
export const updateHourlyRate = async (req, res) => {
  try {

    console.log("BODY:", req.body);
    const { hourlyRate } = req.body;

    if (hourlyRate === undefined || hourlyRate < 0) {
      return res.status(400).json({ message: "Invalid hourly rate" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { hourlyRate },
      { new: true }
    );

    res.json({
      message: "Hourly rate updated",
      hourlyRate: user.hourlyRate
    });
    console.log("UPDATED USER:", user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/tutor/resources/:id/progress
export const updateResourceProgress = async (req, res) => {
  try {
    const { studentId, completionStatus, understandingLevel, tutorNotes } = req.body;

    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        message: "Resource not found"
      });
    }

    // ensure student belongs to tutor
    const student = await User.findOne({
      _id: studentId,
      tutorIds: req.user._id
    });

    if (!student) {
      return res.status(403).json({
        message: "Student not assigned to you"
      });
    }

    // check existing progress
    const existingProgress = resource.progress.find(
      p => String(p.studentId) === String(studentId)
    );

    if (existingProgress) {
      existingProgress.completionStatus = completionStatus;
      existingProgress.understandingLevel = understandingLevel;
      existingProgress.tutorNotes = tutorNotes;
      existingProgress.updatedBy = req.user._id;
      existingProgress.updatedAt = new Date();
    } else {
      resource.progress.push({
        studentId,
        completionStatus,
        understandingLevel,
        tutorNotes,
        updatedBy: req.user._id
      });
    }

    await resource.save();

    res.json({
      message: "Progress updated successfully",
      resource
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Failed to update progress"
    });
  }
};