import User from "../models/User.js";
import { sendEmail } from "../utils/sendEmail.js";
import Resource from "../models/Resource.js";

// GET all unapproved users
export const getPendingUsers = async (req, res) => {
  const users = await User.find({
    isApproved: false,
    role: { $ne: "admin" }
  }).select("-password");

  res.json(users);
};

// APPROVE user
export const approveUser = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.isApproved = true;
  user.approvedAt = new Date();
  await user.save();

  // 📧 SEND APPROVAL EMAIL
  await sendEmail({
    to: user.email,
    subject: "Your account has been approved 🎉",
    html: `
      <h2>Hello ${user.name},</h2>
      <p>Your <strong>${user.role}</strong> account has been approved.</p>
      <p>You can now log in securely.</p>
      <br/>
      <p>Regards,<br/>${process.env.APP_NAME}</p>
    `
  });


  res.json({ message: "User approved and notified" });
};

// GET all approved users (for Users tab)
export const getApprovedUsers = async (req, res) => {
  try {
    const users = await User.find({
      isApproved: true
    })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }

  
};

// REJECT user
export const rejectUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

await sendEmail({
    to: user.email,
    subject: "Account registration update",
    html: `
      <h2>Hello ${user.name},</h2>
      <p>Your registration request was not approved.</p>
      <p>If you believe this is a mistake, please contact support.</p>
    `
  });

  await user.deleteOne();
  res.json({ message: "User rejected & removed" });
};

// GET /api/admin/resources
export const getResources = async (req, res) => {
  try {
   const resources = await Resource.find()
  .populate("assignedTo", "name email role")
  .sort({ createdAt: -1 });

    res.json(resources);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/admin/resources
export const createResource = async (req, res) => {
  try {
    const { title, type, url, notes, audienceRole, assignedTo } = req.body;


    const resource = await Resource.create({
    title,
    type,
    url: url || "",
    notes: notes || "",
    audienceRole: audienceRole || "all",
    assignedTo: Array.isArray(assignedTo) ? assignedTo : [],
    createdBy: req.user._id
  });


    const populated = await Resource.findById(resource._id).populate("assignedTo", "name email role");
    res.status(201).json(populated);

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/admin/resources/:id
export const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: "Resource not found" });

    await resource.deleteOne();
    res.json({ message: "Resource deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/admin/resources/upload (multipart/form-data)
export const createResourceWithUpload = async (req, res) => {
  try {
    const { title, type, url, notes, audienceRole, assignedTo } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // assignedTo arrives as JSON string from FormData
    let parsedAssignedTo = [];
    if (assignedTo) {
      try {
        const parsed = JSON.parse(assignedTo);
        if (Array.isArray(parsed)) parsedAssignedTo = parsed;
      } catch {}
    }

    const resource = await Resource.create({
      title,
      type,
      url: url || "",
      notes: notes || "",
      audienceRole: audienceRole || "all",
      assignedTo: parsedAssignedTo,
      createdBy: req.user._id,

      file: {
        originalName: req.file.originalname,
        filename: req.file.filename,
        url: `/uploads/resources/${req.file.filename}`,
        mimetype: req.file.mimetype,
        size: req.file.size
      }
    });

    const populated = await Resource.findById(resource._id).populate(
      "assignedTo",
      "name email role"
    );

    res.status(201).json(populated);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};
