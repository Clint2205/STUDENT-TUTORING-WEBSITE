// models/Notification.js

import mongoose from "mongoose"

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    title: String,

    message: String,

    type: {
      type: String,
      default: "booking"
    },

    read: {
      type: Boolean,
      default: false
    },

    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking"
    }
  },
  { timestamps: true }
)

export default mongoose.model(
  "Notification",
  notificationSchema
)