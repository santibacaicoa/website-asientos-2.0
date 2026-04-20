import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT) || 10000,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  emailUser: process.env.EMAIL_USER,
  emailPass: process.env.EMAIL_PASS,
  frontendUrl: process.env.FRONTEND_URL,
};