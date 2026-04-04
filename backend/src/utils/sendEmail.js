// src/utils/sendEmail.js

import nodemailer from "nodemailer";

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  const user = process.env.YAHOO_USER;
  const pass = process.env.YAHOO_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error("Missing Yahoo SMTP credentials in environment variables");
  }

  transporter = nodemailer.createTransport({
    host: "smtp.mail.yahoo.com",
    port: 465,
    secure: true,
    auth: { user, pass }
  });

  return transporter;
}

export const sendEmail = async ({ to, subject, html }) => {
  const t = getTransporter();
  await t.sendMail({
    from: `"${process.env.APP_NAME || "Student Tutoring Platform"}" <${process.env.YAHOO_USER}>`,
    to,
    subject,
    html
  });
};
