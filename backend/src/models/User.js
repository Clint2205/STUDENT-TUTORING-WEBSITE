// backend/src/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["admin", "tutor", "parent", "student"],
      default: "student",
    },

    isApproved: { type: Boolean, default: false },
    approvedAt: { type: Date, default: null },

    subjects: [{ type: String, trim: true, lowercase: true, index: true }],

    // ✅ tutorIds is ARRAY (no default null inside)
    tutorIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", index: true }],

    // ✅ parentTutorIds is ARRAY (for later)
    parentTutorIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", index: true }],

    lastSeenResourcesAt: { type: Date, default: null },

    // ✅ hidden/dismissed resources
    hiddenResourceIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Resource" }],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
