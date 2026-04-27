import { apiFetch } from "../api/client.js";

const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

function showMessage(message, type = "error") {
  if (!loginMessage) return;

  loginMessage.textContent = message;
  loginMessage.className = `auth-form__message auth-form__message--${type}`;
}

function setLoading(button, isLoading) {
  if (!button) return;

  button.disabled = isLoading;
  button.classList.toggle("is-loading", isLoading);
  button.textContent = isLoading ? "Entrando..." : "Entrar";
}

loginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const submitButton = loginForm.querySelector("button[type='submit']");
  const email = document.getElementById("loginEmail")?.value.trim();
  const password = document.getElementById("loginPassword")?.value;

  if (!email || !password) {
    showMessage("Completá email y contraseña.");
    return;
  }

  try {
    setLoading(submitButton, true);
    showMessage("");

    const result = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    localStorage.setItem("authToken", result.token);
    localStorage.setItem("authUser", JSON.stringify(result.user));

    showMessage("Login exitoso. Redirigiendo...", "success");

    setTimeout(() => {
      window.location.href = "../hub.html";
    }, 700);
  } catch (error) {
    showMessage(error.message || "No se pudo iniciar sesión.");
  } finally {
    setLoading(submitButton, false);
  }
});