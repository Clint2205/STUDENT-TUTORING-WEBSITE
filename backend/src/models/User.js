// backend/src/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
  type: String,
  required: false,
  unique: false,
  lowercase: true,
  sparse: true,
  default: null
},
    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["admin", "tutor", "parent", "student"],
      default: "student",
    },

    isApproved: { type: Boolean, default: false },
    approvedAt: { type: Date, default: null },

    // ✅ NEW: parent-managed child link
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    isChildAccount: { type: Boolean, default: false, index: true },

    // ✅ NEW: child profile
    childName: { type: String, trim: true, default: "" },
    age: { type: Number, default: null },
     hourlyRate: {
    type: Number,
    default: 20,
    min: 0
  },


  
    subjects: [{ type: String, trim: true, lowercase: true, index: true }],

    // ✅ tutorIds is ARRAY (no default null inside)
    tutorIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", index: true }],

    // ✅ parentTutorIds is ARRAY (for later)
    parentTutorIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", index: true }],

    lastSeenResourcesAt: { type: Date, default: null },

      // 🔐 AUTH UPGRADE (MVP + PRODUCTION HYBRID)

  loginId: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },

  isFirstLogin: {
    type: Boolean,
    default: false
  },

  passwordResetRequired: {
    type: Boolean,
    default: false
  },
  availability: [
  {
    day: String,

    startHour: String,

    endHour: String
  }
],

timezone: {
  type: String,
  default: "Europe/London"
},

    // ✅ hidden/dismissed resources
    hiddenResourceIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Resource" }],
    // hidden bookings and notifications
    hiddenBookings: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: []
    }],

    hiddenNotifications: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Notification",
      default: []
    }]
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
