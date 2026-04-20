import express from "express";
import cors from "cors";
import { env } from "./config/env.js";

const app = express();

app.use(cors({
  origin: env.frontendUrl,
  credentials: true,
}));

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    ok: true,
    message: "Backend funcionando correctamente",
  });
});

export default app;