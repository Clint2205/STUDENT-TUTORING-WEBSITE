// src/controllers/tutorController.js

import User from "../models/User.js"
import Resource from "../models/Resource.js"

// GET /api/tutor/students
export const getMyStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student", tutorId: req.user._id })
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
    const myStudents = await User.find({ role: "student", tutorId: req.user._id }).select("_id")
    const myStudentIds = myStudents.map((s) => s._id)

    const resources = await Resource.find({
      $or: [
        { createdBy: req.user._id },
        { assignedTo: { $in: myStudentIds } },
        { audienceRole: "all" }
      ]
    }).sort({ createdAt: -1 })

    return res.json(resources)
  } catch (err) {
    console.error("getMyResources error:", err)
    return res.status(500).json({ message: err.message })
  }
}

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
      tutorId: req.user._id
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
      tutorId: req.user._id
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
