import nodemailer from "nodemailer";
import { env } from "./env.js";

if (!env.emailUser || !env.emailPass) {
  console.warn("Faltan EMAIL_USER/EMAIL_PASS o SMTP_USER/SMTP_PASS en Render.");
}

export const mailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.emailUser,
    pass: env.emailPass,
  },
});