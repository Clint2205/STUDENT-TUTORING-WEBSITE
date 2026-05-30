import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    tutorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    amount: {
      type: Number,
      required: true
    },

    sessions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Session"
      }
    ],

    paidAt: {
      type: Date,
      default: Date.now
    },

    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);