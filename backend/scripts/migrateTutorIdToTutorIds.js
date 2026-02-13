import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../src/models/User.js";

dotenv.config();

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const students = await User.find({ role: "student", tutorId: { $ne: null } }).select("_id tutorId tutorIds");
  let updated = 0;

  for (const s of students) {
    const tutorId = s.tutorId;
    const tutorIds = Array.isArray(s.tutorIds) ? s.tutorIds.map(String) : [];

    if (tutorId && !tutorIds.includes(String(tutorId))) {
      s.tutorIds = [...(s.tutorIds || []), tutorId];
      s.tutorId = null; // remove old field use
      await s.save();
      updated++;
    }
  }

  console.log("Migrated:", updated);
  await mongoose.disconnect();
})();
