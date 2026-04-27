import { apiFetch } from "./api/client.js";

const forgotPasswordForm = document.getElementById("forgotPasswordForm");
const forgotMessage = document.getElementById("forgotMessage");

function showMessage(message, type = "error") {
  if (!forgotMessage) return;

  forgotMessage.textContent = message;
  forgotMessage.className = `auth-form__message auth-form__message--${type}`;
}

function setLoading(button, isLoading) {
  if (!button) return;

  button.disabled = isLoading;
  button.classList.toggle("is-loading", isLoading);
  button.textContent = isLoading ? "Enviando..." : "Enviar";
}

forgotPasswordForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const submitButton = forgotPasswordForm.querySelector("button[type='submit']");
  const email = document.getElementById("forgotEmail")?.value.trim();

  if (!email) {
    showMessage("Ingresá tu email.");
    return;
  }

  try {
    setLoading(submitButton, true);
    showMessage("");

    const result = await apiFetch("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    sessionStorage.setItem("resetPasswordEmail", email);

    showMessage(result.message, "success");

    setTimeout(() => {
      window.location.href = "./reset-password.html";
    }, 900);
  } catch (error) {
    showMessage(error.message || "No se pudo enviar el token.");
  } finally {
    setLoading(submitButton, false);
  }
});