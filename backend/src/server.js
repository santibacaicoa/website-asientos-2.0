import app from "./app.js";
import { env } from "./config/env.js";
import { db } from "./config/db.js";

async function startServer() {
  try {
    await db.query("SELECT NOW()");
    console.log("Conexión a Neon OK");

    app.listen(env.port, () => {
      console.log(`Servidor corriendo en http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error("Error al iniciar el servidor:", error);
    process.exit(1);
  }
}

startServer();