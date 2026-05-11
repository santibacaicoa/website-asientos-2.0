import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import authRoutes from "./routes/auth.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import usersRoutes from "./routes/users.routes.js";

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      "https://website-asientos-2-0-frontend.onrender.com",
      "https://www.assientos-assurantweb.fun"
    ];

    // permitir requests sin origin (ej: Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("CORS no permitido"));
  },
  credentials: true
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.get("/api/health", (req, res) => {
  res.status(200).json({
    ok: true,
    message: "Backend funcionando correctamente",
  });
});

app.use("/api/auth", authRoutes);

app.use("/api/chat", chatRoutes);

app.use("/api/users", usersRoutes);

export default app;