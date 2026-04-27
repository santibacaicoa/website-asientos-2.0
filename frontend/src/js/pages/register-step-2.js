import { apiFetch } from "../api/client.js";

const form = document.getElementById("registerStep2Form");
const resendTokenLink = document.getElementById("resendTokenLink");
const enterAfterRegisterButton = document.getElementById("enterAfterRegister");

const pendingRegisterRaw = sessionStorage.getItem("pendingRegister");
const pendingRegister = pendingRegisterRaw ? JSON.parse(pendingRegisterRaw) : null;

if (!pendingRegister) {
  alert("Primero completá email y contraseña.");
  window.location.href = "./register-step-1.html";
}

function showTokenMessage(message, ok = false) {
  let messageEl = document.getElementById("tokenMessage");

  if (!messageEl && form) {
    messageEl = document.createElement("p");
    messageEl.id = "tokenMessage";
    messageEl.className = "auth-form__message";

    const actions = form.querySelector(".auth-form__actions");
    if (actions) {
      form.insertBefore(messageEl, actions);
    } else {
      form.appendChild(messageEl);
    }
  }

  if (!messageEl) return;

  messageEl.textContent = message;
  messageEl.className = `auth-form__message ${
    ok ? "auth-form__message--success" : "auth-form__message--error"
  }`;
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();

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

    showTokenMessage(result.message || "Token válido.", true);

    setTimeout(() => {
      window.location.href = "./login-form.html";
    }, 1200);
  } catch (error) {
    showTokenMessage(error.message || "Token no válido.");
  }
});

resendTokenLink?.addEventListener("click", async (event) => {
  event.preventDefault();

  try {
    await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: pendingRegister.email,
        password: "NO_PASSWORD_RESEND",
      }),
    });

    showTokenMessage("Token reenviado al mail.", true);
  } catch (error) {
    showTokenMessage(
      "Para reenviar el token, volvé al paso anterior y tocá Siguiente nuevamente."
    );
  }
});

enterAfterRegisterButton?.addEventListener("click", () => {
  window.location.href = "./login-form.html";
});