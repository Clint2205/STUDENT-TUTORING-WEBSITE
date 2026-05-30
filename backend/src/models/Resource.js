// src/models/Resource.js

import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["meeting", "reminder", "assignment", "study", "fun", "lesson-plan", "youtube", "tutorial"],
      required: true
    },
    url: { type: String, trim: true, default: "" },
    notes: { type: String, trim: true, default: "" },

    file: {
      originalName: { type: String, default: "" },
      filename: { type: String, default: "" },
      url: { type: String, default: "" }, // "/uploads/resources/<filename>"
      mimetype: { type: String, default: "" },
      size: { type: Number, default: 0 }
    },

    // Who should see it (role group)
    audienceRole: {
      type: String,
      enum: ["all", "student", "parent", "tutor"],
      default: "all"
    },

    //  Optional: target specific users (if empty => everyone in audienceRole)
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // 📘 Student progress tracking
progress: [
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    completionStatus: {
      type: String,
      enum: ["completed", "not_completed"],
      default: "not_completed"
    },

    understandingLevel: {
      type: Number,
      min: 1,
      max: 5,
      default: 3
    },

    tutorNotes: {
      type: String,
      default: ""
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    updatedAt: {
      type: Date,
      default: Date.now
    }
  }
],
// 📝 Student submissions
submissions: [
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    message: {
      type: String,
      default: ""
    },

    file: {
      originalName: String,
      filename: String,
      url: String,
      mimetype: String,
      size: Number
    },

    submittedAt: {
      type: Date,
      default: Date.now
    },

    feedback: {
      type: String,
      default: ""
    },

    grade: {
      type: String,
      default: ""
    }
  }
],

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

export default mongoose.model("Resource", resourceSchema);
