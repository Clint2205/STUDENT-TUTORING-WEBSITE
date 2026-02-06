import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["admin", "tutor", "parent", "student"],
      default: "student",
    },
     isApproved: { type: Boolean, default: false }, //  only admin-approved users can login
     approvedAt: {
    type: Date,
    default: null
  }

  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);


