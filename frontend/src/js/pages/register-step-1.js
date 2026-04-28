import { apiFetch } from "../api/client.js";

const registerStep1Form = document.getElementById("registerStep1Form");
const registerStep1Message = document.getElementById("registerStep1Message");

function showMessage(message, type = "error") {
  if (!registerStep1Message) return;

  registerStep1Message.textContent = message;
  registerStep1Message.className = `auth-form__message auth-form__message--${type}`;
}

function setLoading(button, isLoading) {
  if (!button) return;

  button.disabled = isLoading;
  button.classList.toggle("is-loading", isLoading);
  button.textContent = isLoading ? "Enviando..." : "Siguiente";
}

registerStep1Form?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const submitButton = registerStep1Form.querySelector("button[type='submit']");

  const email = document.getElementById("registerEmail")?.value.trim();
  const password = document.getElementById("registerPassword")?.value;
  const passwordRepeat = document.getElementById("registerPasswordRepeat")?.value;

  if (!email || !password || !passwordRepeat) {
    showMessage("Completá todos los campos.");
    return;
  }

  if (password.length < 6) {
    showMessage("La contraseña debe tener al menos 6 caracteres.");
    return;
  }

  if (password !== passwordRepeat) {
    showMessage("Las contraseñas no coinciden.");
    return;
  }

  try {
    setLoading(submitButton, true);
    showMessage("");

    await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
      }),
    });

    sessionStorage.setItem(
      "pendingRegister",
      JSON.stringify({
        email,
      })
    );

    showMessage("Te enviamos un código de 4 dígitos al mail.", "success");

    setTimeout(() => {
      window.location.href = "./register-step-2.html";
    }, 900);
  } catch (error) {
    showMessage(error.message || "No se pudo enviar el token.");
  } finally {
    setLoading(submitButton, false);
  }
});