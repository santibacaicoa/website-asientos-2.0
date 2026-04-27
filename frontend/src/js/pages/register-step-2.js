import { apiFetch } from "../api/client.js";

const registerStep2Form = document.getElementById("registerStep2Form");
const resendTokenLink = document.getElementById("resendTokenLink");
const enterAfterRegisterButton = document.getElementById("enterAfterRegister");

const pendingRegisterRaw = sessionStorage.getItem("pendingRegister");
const pendingRegister = pendingRegisterRaw ? JSON.parse(pendingRegisterRaw) : null;

if (!pendingRegister) {
  alert("Primero completá email y contraseña.");
  window.location.href = "./register-step-1.html";
}

let tokenWasSent = false;

async function sendRegisterToken() {
  const nombre = document.getElementById("registerNombre")?.value.trim();
  const apellido = document.getElementById("registerApellido")?.value.trim();

  if (!nombre || !apellido) {
    alert("Completá nombre y apellido antes de pedir el token.");
    return;
  }

  try {
    await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: pendingRegister.email,
        password: pendingRegister.password,
        nombre,
        apellido,
      }),
    });

    tokenWasSent = true;
    alert("Token enviado al mail.");
  } catch (error) {
    alert(error.message);
  }
}

registerStep2Form?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const nombre = document.getElementById("registerNombre")?.value.trim();
  const apellido = document.getElementById("registerApellido")?.value.trim();
  const token = document.getElementById("registerToken")?.value.trim();

  if (!nombre || !apellido) {
    alert("Completá nombre y apellido.");
    return;
  }

  if (!tokenWasSent) {
    await sendRegisterToken();
    return;
  }

  if (!token) {
    alert("Ingresá el token.");
    return;
  }

  try {
    const result = await apiFetch("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({
        email: pendingRegister.email,
        token,
      }),
    });

    sessionStorage.removeItem("pendingRegister");

    alert(result.message || "Cuenta verificada correctamente.");

    window.location.href = "./login-form.html";
  } catch (error) {
    alert(error.message);
  }
});

resendTokenLink?.addEventListener("click", async (event) => {
  event.preventDefault();
  await sendRegisterToken();
});

enterAfterRegisterButton?.addEventListener("click", () => {
  window.location.href = "./login-form.html";
});