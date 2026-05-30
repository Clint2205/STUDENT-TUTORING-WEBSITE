// backend/src/controllers/parentController.js
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Resource from "../models/Resource.js";
import { sendEmail } from "../utils/sendEmail.js";
import Session from "../models/Sessions.js";

function slugify(str = "") {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 40);
}

function generateTempPassword() {
  return `TB-${Math.random().toString(16).slice(2, 6)}-${Math.random().toString(16).slice(2, 6)}`;
}

// ✅ same tutor-matching logic concept as /api/auth/tutors/match
async function findMatchingTutorsBySubjects(subjects = []) {
  if (!subjects.length) return [];
  const norm = subjects.map(s => String(s).toLowerCase().trim()).filter(Boolean);

  return User.find({
    role: "tutor",
    isApproved: true,
    subjects: { $in: norm }
  }).select("_id name subjects");
}

/**
 * POST /api/parent/children
 * body: { name, age, subjects, tutorIds? }
 *
 * Creates a child "student" user linked to parentId.
 */
export async function createChild(req, res) {
  try {
    const parentId = req.user._id;
    const { name, age, subjects, tutorIds = [] } = req.body || {};

    if (!name || !Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({ message: "Child name and subjects are required." });
    }

    // normalize
    const normSubjects = subjects.map(s => String(s).toLowerCase().trim()).filter(Boolean);

    const cleanAge = age === "" || age === null || age === undefined ? null : Number(age);
    if (cleanAge !== null && (Number.isNaN(cleanAge) || cleanAge < 0 || cleanAge > 120)) {
      return res.status(400).json({ message: "Invalid age." });
    }

    // ✅ find matching tutors by subjects (same logic concept)
    const matchingTutors = await findMatchingTutorsBySubjects(normSubjects);
    const matchingTutorIdSet = new Set(matchingTutors.map(t => String(t._id)));

    // only accept tutorIds that match subjects
    const finalTutorIds =
      Array.isArray(tutorIds) && tutorIds.length
        ? tutorIds.filter(id => matchingTutorIdSet.has(String(id)))
        : [];

    // create child login (internal email)
    const tempPassword = generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const base = slugify(name) || "child";
    const unique = Date.now().toString(36);
    const loginId = `${base}.${unique}`;

    const childUser = await User.create({
      name,
      childName: name,
      age: cleanAge,

      loginId,
      email: req.body.email || null, // optional real email later,
      password: passwordHash,

      role: "student",
      isApproved: true,
      approvedAt: new Date(),

      parentId,
      isChildAccount: true,

      subjects: normSubjects,
      tutorIds: finalTutorIds,
      hiddenResourceIds: []
    });

    return res.status(201).json({
      message: "Child created successfully.",
      child: {
        _id: childUser._id,
        name: childUser.name,
        childName: childUser.childName,
        age: childUser.age,
        subjects: childUser.subjects,
        tutorIds: childUser.tutorIds
      },
      // show once so parent can save it
      studentLogin: {
        loginId,
        tempPassword
      }
    });
  } catch (err) {
    console.error("createChild error:", err);
    return res.status(500).json({ message: "Server error creating child." });
  }
}

/**
 * GET /api/parent/children
 * Returns only children owned by parent.
 */
export async function listChildren(req, res) {
  try {
    const parentId = req.user._id;

    const children = await User.find({
      role: "student",
      parentId,
      isChildAccount: true
    })
      .select("name childName age subjects tutorIds email isApproved createdAt")
      .populate("tutorIds", "name subjects")
      .sort({ createdAt: -1 });

    return res.json({ children });
  } catch (err) {
    console.error("listChildren error:", err);
    return res.status(500).json({ message: "Server error loading children." });
  }
}

/**
 * GET /api/parent/children/:childUserId/resources
 *
 * RULES:
 * createdBy in [...child.tutorIds, ...adminIds]
 * AND (assignedTo includes childUserId OR audienceRole in ['student','all'])
 * AND not in child.hiddenResourceIds
 */
export async function getChildResources(req, res) {
  try {
    const parentId = req.user._id;
    const { childUserId } = req.params;

    const child = await User.findOne({
      _id: childUserId,
      role: "student",
      parentId,
      isChildAccount: true
    }).lean();

    if (!child) return res.status(404).json({ message: "Child not found." });

    const admins = await User.find({ role: "admin", isApproved: true }).select("_id").lean();
    const adminIds = admins.map(a => a._id);

    const tutorIds = child.tutorIds || [];

    const query = {
  createdBy: { $in: [...tutorIds, ...adminIds] },
  assignedTo: child._id // ✅ ONLY assigned resources
};
    const resources = await Resource.find(query).sort({ createdAt: -1 }).lean();

    const hiddenSet = new Set((child.hiddenResourceIds || []).map(id => String(id)));
    const visible = resources.filter(r => !hiddenSet.has(String(r._id)));

    return res.json({
      child: { _id: child._id, name: child.childName || child.name },
      resources: visible
    });
  } catch (err) {
    console.error("getChildResources error:", err);
    return res.status(500).json({ message: "Server error loading child resources." });
  }
}
/**
 * GET /api/parent/progress/:childUserId
 * Parent can see child's learning progress
 */

export async function getChildProgress(req, res) {
  try {
    const parentId = req.user._id;
    const { childUserId } = req.params;

    // ✅ Verify child belongs to parent
    const child = await User.findOne({
      _id: childUserId,
      role: "student",
      parentId,
      isChildAccount: true
    });

    if (!child) {
      return res.status(404).json({
        message: "Child not found"
      });
    }

    // ✅ Find sessions for this child
    const sessions = await Session.find({
      studentId: childUserId
    })
      .populate("tutorId", "name")
      .populate("resourceId", "title")
      .sort({ createdAt: -1 });

    return res.json({
      child: {
        _id: child._id,
        name: child.childName || child.name
      },
      sessions
    });

  } catch (err) {
    console.error("getChildProgress error:", err);

    return res.status(500).json({
      message: "Server error loading progress"
    });
  }
}


/**
 * POST /api/parent/children/:childUserId/hide/:resourceId
 * Push resourceId into child's hiddenResourceIds
 */
export async function hideChildResource(req, res) {
  try {
    const parentId = req.user._id;
    const { childUserId, resourceId } = req.params;

    const child = await User.findOne({
      _id: childUserId,
      role: "student",
      parentId,
      isChildAccount: true
    });

    if (!child) return res.status(404).json({ message: "Child not found." });

    const exists = (child.hiddenResourceIds || []).some(id => String(id) === String(resourceId));
    if (!exists) {
      child.hiddenResourceIds.push(resourceId);
      await child.save();
    }

    return res.json({ message: "Resource hidden for this child." });
  } catch (err) {
    console.error("hideChildResource error:", err);
    return res.status(500).json({ message: "Server error hiding resource." });
  }
}

export async function resetChildPassword(req, res) {
  try {
    const { childId } = req.body;

    const child = await User.findById(childId);

    const tempPassword = generateTempPassword();

    if (!child || child.role !== "student") {
      return res.status(404).json({ message: "Child not found" });
    }
    if (child.email) {
      await sendEmail({
        to: child.email,
        subject: "TutorBridge Password Reset",
        html: `
      <h3>Password Reset</h3>
      <p>Your login ID: <b>${child.loginId}</b></p>
      <p>New temporary password: <b>${tempPassword}</b></p>
    `
      });
    }
    
    const hashed = await bcrypt.hash(tempPassword, 10);

    child.password = hashed;
    child.isFirstLogin = true;
    child.passwordResetRequired = true;

    await child.save();

    return res.json({
      tempPassword,
      loginId: child.loginId
    });


  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}