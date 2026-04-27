import { apiFetch } from "./api/client.js";

const resetPasswordForm = document.getElementById("resetPasswordForm");
const resetMessage = document.getElementById("resetMessage");

const savedEmail = sessionStorage.getItem("resetPasswordEmail");
const resetEmailInput = document.getElementById("resetEmail");

if (savedEmail && resetEmailInput) {
  resetEmailInput.value = savedEmail;
}

function showMessage(message, type = "error") {
  if (!resetMessage) return;

  resetMessage.textContent = message;
  resetMessage.className = `auth-form__message auth-form__message--${type}`;
}

function setLoading(button, isLoading) {
  if (!button) return;

  button.disabled = isLoading;
  button.classList.toggle("is-loading", isLoading);
  button.textContent = isLoading ? "Cambiando..." : "Cambiar";
}

resetPasswordForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const submitButton = resetPasswordForm.querySelector("button[type='submit']");
  const email = document.getElementById("resetEmail")?.value.trim();
  const token = document.getElementById("resetToken")?.value.trim();
  const password = document.getElementById("resetPassword")?.value;

  if (!email || !token || !password) {
    showMessage("Completá todos los campos.");
    return;
  }

  if (password.length < 6) {
    showMessage("La contraseña debe tener al menos 6 caracteres.");
    return;
  }

  try {
    setLoading(submitButton, true);
    showMessage("");

    const result = await apiFetch("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, token, password }),
    });

    sessionStorage.removeItem("resetPasswordEmail");

    showMessage(result.message, "success");

    setTimeout(() => {
      window.location.href = "./login-form.html";
    }, 1000);
  } catch (error) {
    showMessage(error.message || "No se pudo cambiar la contraseña.");
  } finally {
    setLoading(submitButton, false);
  }
});