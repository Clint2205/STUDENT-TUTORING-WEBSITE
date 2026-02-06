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

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

export default mongoose.model("Resource", resourceSchema);
