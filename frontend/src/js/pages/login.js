import { apiFetch } from "../api/client.js";

async function testBackendConnection() {
  try {
    const data = await apiFetch("/health");
    console.log("Backend conectado:", data);
  } catch (error) {
    console.error("No se pudo conectar con el backend:", error.message);
  }
}

testBackendConnection();