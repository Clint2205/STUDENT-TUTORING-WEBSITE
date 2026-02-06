import User from "../models/User.js";
import { sendEmail } from "../utils/sendEmail.js";

// GET all unapproved users
export const getPendingUsers = async (req, res) => {
  const users = await User.find({
    isApproved: false,
    role: { $ne: "admin" }
  }).select("-password");

  res.json(users);
};

// APPROVE user
export const approveUser = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.isApproved = true;
  user.approvedAt = new Date();
  await user.save();

  // 📧 SEND APPROVAL EMAIL
  await sendEmail({
    to: user.email,
    subject: "Your account has been approved 🎉",
    html: `
      <h2>Hello ${user.name},</h2>
      <p>Your <strong>${user.role}</strong> account has been approved.</p>
      <p>You can now log in securely.</p>
      <br/>
      <p>Regards,<br/>${process.env.APP_NAME}</p>
    `
  });

  res.json({ message: "User approved and notified" });
};

// REJECT user
export const rejectUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

await sendEmail({
    to: user.email,
    subject: "Account registration update",
    html: `
      <h2>Hello ${user.name},</h2>
      <p>Your registration request was not approved.</p>
      <p>If you believe this is a mistake, please contact support.</p>
    `
  });

  await user.deleteOne();
  res.json({ message: "User rejected & removed" });
};
