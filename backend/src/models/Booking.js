import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    tutorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // student OR parent can book
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    startTime: {
      type: Date,
      required: true
    },

    endTime: {
      type: Date,
      required: true
    },

    subject: {
      type: String,
      default: ""
    },

    notes: {
      type: String,
      default: ""
    },

    timezone: {
      type: String,
      default: "Europe/London"
    },

    lessonDuration: {
      type: Number,
      default: 1
    },

    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "completed",
        "cancelled"
      ],
      default: "pending"
    },

    meetingLink: {
      type: String,
      default: ""
    },

    paid: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model(
  "Booking",
  bookingSchema
);