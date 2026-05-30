// backend/src/models/Sessions.js

import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    tutorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    resourceId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Resource"
},

    // ⏱️ Duration in hours (e.g. 1, 1.5, 2)
    duration: {
      type: Number,
      required: true,
      min: 0.25
    },

    // 💰 Snapshot of tutor rate at time of session
    hourlyRate: {
      type: Number,
      required: true,
      default: 20,
      min: 0
    },

    // 💰 Total for this session (duration * rate)
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },

    // 📊 Payment workflow
    status: {
      type: String,
      enum: ["pending", "approved", "paid"],
      default: "pending"
    },

    // 📅 When the lesson happened
    sessionDate: {
      type: Date,
      default: Date.now
    },
    paid: {
  type: Boolean,
  default: false
},
paidAt: {
  type: Date
},

// 🎓 LEARNING PROGRESSION (NEW FEATURE)
progress: {
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

  skills: [
    {
      subject: String,
      improvement: {
        type: Number,
        default: 0 // % change or score delta
      }
    }
  ]
},

    // 📝 Optional notes
    notes: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true // adds createdAt + updatedAt
  },
  
);

export default mongoose.model("Session", sessionSchema);