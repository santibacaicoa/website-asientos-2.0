import { apiFetch } from "../api/client.js";

const form = document.getElementById("registerStep2Form");
const resendTokenLink = document.getElementById("resendTokenLink");
const enterAfterRegisterButton = document.getElementById("enterAfterRegister");
const tokenMessage = document.getElementById("tokenMessage");

const pendingRegisterRaw = sessionStorage.getItem("pendingRegister");
const pendingRegister = pendingRegisterRaw ? JSON.parse(pendingRegisterRaw) : null;

if (!pendingRegister) {
  window.location.href = "./register-step-1.html";
}

function showTokenMessage(message, type = "error") {
  if (!tokenMessage) return;

  tokenMessage.textContent = message;
  tokenMessage.className = `auth-form__message auth-form__message--${type}`;
}

function setLoading(button, isLoading) {
  if (!button) return;

  button.disabled = isLoading;
  button.classList.toggle("is-loading", isLoading);
  button.textContent = isLoading ? "Validando..." : "Confirmar";
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const submitButton = form.querySelector("button[type='submit']");

  const nombre = document.getElementById("registerNombre")?.value.trim();
  const apellido = document.getElementById("registerApellido")?.value.trim();
  const token = document.getElementById("registerToken")?.value.trim();

  if (!nombre || !apellido || !token) {
    showTokenMessage("Completá nombre, apellido y token.");
    return;
  }

  if (!/^\d{4}$/.test(token)) {
    showTokenMessage("El token debe tener 4 dígitos.");
    return;
  }

  try {
    setLoading(submitButton, true);
    showTokenMessage("");

    const result = await apiFetch("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({
        email: pendingRegister.email,
        nombre,
        apellido,
        token,
      }),
    });

    sessionStorage.removeItem("pendingRegister");

    showTokenMessage(result.message || "Token válido. Cuenta creada correctamente.", "success");

    setTimeout(() => {
      window.location.href = "./login-form.html";
    }, 1200);
  } catch (error) {
    showTokenMessage(error.message || "Token no válido.");
  } finally {
    setLoading(submitButton, false);
  }
});

resendTokenLink?.addEventListener("click", (event) => {
  event.preventDefault();

  showTokenMessage(
    "Para reenviar el token, volvé al paso anterior y tocá Siguiente nuevamente."
  );
});

enterAfterRegisterButton?.addEventListener("click", () => {
  window.location.href = "./login-form.html";
});