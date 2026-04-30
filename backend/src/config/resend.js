import { Resend } from "resend";
import { env } from "./env.js";

if (!env.resendApiKey) {
  console.warn("Falta RESEND_API_KEY en Render.");
}

export const resend = new Resend(env.resendApiKey);