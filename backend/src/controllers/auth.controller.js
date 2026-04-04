// backend/src/controllers/auth.controller.js
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import generateToken from "../utils/generateToken.js";

// ✅ Central subject list (backend authoritative list)
export const SUBJECT_OPTIONS = [
  "maths",
  "english",
  "literature",
  "general science",
  "biology",
  "chemistry",
  "physics",
  "computer science",
  "history",
  "geography",
  "global perspective for ks3"
];

// -------------------- helpers --------------------
const normalizeSubjects = (subjects) => {
  if (!subjects) return [];
  const arr = Array.isArray(subjects) ? subjects : [subjects];

  const cleaned = arr
    .map((s) => String(s).trim().toLowerCase())
    .filter(Boolean);

  const unique = [...new Set(cleaned)];

  for (const s of unique) {
    if (!SUBJECT_OPTIONS.includes(s)) {
      throw new Error(`Invalid subject: ${s}`);
    }
  }
  return unique;
};

// ✅ Step 8 helper
const normalizeTutorIds = (tutorIds) => {
  if (!tutorIds) return [];
  const arr = Array.isArray(tutorIds) ? tutorIds : [tutorIds];
  return [...new Set(arr.map(String).filter(Boolean))];
};

// Pick ONE tutor (fallback):
// - approved tutors only
// - match subjects if possible
// - choose tutor with fewest assigned students (by tutorIds array)
const pickTutorForSubjects = async (subjects) => {
  const subjectList = normalizeSubjects(subjects);
  if (!subjectList.length) return null;

  let tutors = await User.find({
    role: "tutor",
    isApproved: true,
    subjects: { $in: subjectList }
  }).select("_id").lean();

  // fallback to any approved tutor
  if (!tutors.length) {
    tutors = await User.find({
      role: "tutor",
      isApproved: true
    }).select("_id").lean();
  }

  if (!tutors.length) return null;

  const tutorObjectIds = tutors.map((t) => t._id);

  // count load (students that have tutor inside tutorIds array)
  const counts = await User.aggregate([
    { $match: { role: "student", tutorIds: { $in: tutorObjectIds } } },
    { $unwind: "$tutorIds" },
    { $match: { tutorIds: { $in: tutorObjectIds } } },
    { $group: { _id: "$tutorIds", count: { $sum: 1 } } }
  ]);

  const countMap = new Map(counts.map((c) => [String(c._id), c.count]));

  let best = tutorObjectIds[0];
  let bestCount = countMap.get(String(best)) ?? 0;

  for (const id of tutorObjectIds) {
    const c = countMap.get(String(id)) ?? 0;
    if (c < bestCount) {
      best = id;
      bestCount = c;
    }
  }

  return best; // ObjectId
};

// -------------------- controllers --------------------

/**
 * @route POST /api/auth/register
 */
export const registerUser = async (req, res) => {
  try {

    console.log("REGISTER BODY:", req.body);
    const name = req.body.name;
const email = req.body.email || req.body.Email || req.body.userEmail;
const password = req.body.password;
const role = req.body.role;
const tutorIds = req.body.tutorIds;

    if (!name?.trim()) return res.status(400).json({ message: "Name is required" });
    if (!email?.trim()) return res.status(400).json({ message: "Email is required" });
    if (!password) return res.status(400).json({ message: "Password is required" });
    if (!role) return res.status(400).json({ message: "Role is required" });

    // ✅ subjects from dropdown
    let subjects = [];
    try {
      subjects = normalizeSubjects(req.body.subjects);
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }

    const lowerEmail = email.toLowerCase();

    // Check if email exists
    const userExists = await User.findOne({ email: lowerEmail });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    // Prevent more than one admin
    if (role === "admin") {
      const existingAdmin = await User.findOne({ role: "admin" });
      if (existingAdmin) {
        return res.status(400).json({ message: "An admin already exists" });
      }
    }

    // Require subjects for these roles
    if ((role === "tutor" || role === "student" || role === "parent") && subjects.length === 0) {
      return res.status(400).json({ message: "Please select at least one subject." });
    }

    const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));

    const userDoc = {
      name: name.trim(),
      email: lowerEmail,
      password: hashedPassword,
      role,
      subjects,
      isApproved: role === "admin",
      approvedAt: role === "admin" ? new Date() : null
    };

    // ✅ Step 8: accept selected tutorIds + validate (students only for now)
    let chosenTutorIds = normalizeTutorIds(tutorIds);

    if (role === "student" && chosenTutorIds.length) {
      // validate tutor ids are real ObjectIds
      const objectIds = chosenTutorIds
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));

      if (!objectIds.length) {
        return res.status(400).json({ message: "Invalid tutor selection." });
      }

      // validate: approved tutors, role tutor, subjects match student's subjects
      const validTutors = await User.find({
        _id: { $in: objectIds },
        role: "tutor",
        isApproved: true,
        subjects: { $in: subjects }
      }).select("_id").lean();

      chosenTutorIds = validTutors.map((t) => t._id);

      if (!chosenTutorIds.length) {
        return res
          .status(400)
          .json({ message: "Selected tutor(s) do not match your subject(s)." });
      }

      userDoc.tutorIds = chosenTutorIds; // already ObjectIds
    }

    // ✅ fallback auto-pick if student did not choose tutors
    if (role === "student" && (!userDoc.tutorIds || userDoc.tutorIds.length === 0)) {
      const autoTutor = await pickTutorForSubjects(subjects);
      userDoc.tutorIds = autoTutor ? [autoTutor] : [];
    }

    // (Optional) parent later - keep empty for now so it doesn't break
    // if (role === "parent") { ... parentTutorIds ... }

    const user = await User.create(userDoc);

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      subjects: user.subjects || [],
      tutorIds: user.tutorIds || [],
      token: generateToken(user._id)
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * @route POST /api/auth/login
 */
export const loginUser = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const user = await User.findOne({
      $or: [
        { email: identifier?.toLowerCase() },
        { loginId: identifier }
      ]
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 🔐 FORCE FIRST LOGIN PASSWORD CHANGE
    if (user.isFirstLogin) {
      return res.json({
        forcePasswordChange: true,
        userId: user._id
      });
    }

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      loginId: user.loginId,
      role: user.role,
      token: generateToken(user._id)
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;

    const hashed = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(userId, {
      password: hashed,
      isFirstLogin: false,
      passwordResetRequired: false
    });

    return res.json({ message: "Password updated successfully" });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getMe = async (req, res) => {
  return res.json(req.user);
};

// ✅ used by Step 9 frontend watcher
export const getMatchingTutors = async (req, res) => {
  try {
    const raw = String(req.query.subjects || "");
    const subjects = normalizeSubjects(raw.split(","));

    if (!subjects.length) return res.json({ tutors: [] });

    const tutors = await User.find({
      role: "tutor",
      isApproved: true,
      subjects: { $in: subjects }
    })
      .select("_id name subjects")
      .sort({ name: 1 })
      .lean();

    return res.json({ tutors });
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
};
