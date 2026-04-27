import { apiFetch } from "../api/client.js";

const registerStep1Form = document.getElementById("registerStep1Form");

registerStep1Form?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("registerEmail")?.value.trim();
  const password = document.getElementById("registerPassword")?.value;
  const passwordRepeat = document.getElementById("registerPasswordRepeat")?.value;

  if (!email || !password || !passwordRepeat) {
    alert("Completá todos los campos.");
    return;
  }

  if (password.length < 6) {
    alert("La contraseña debe tener al menos 6 caracteres.");
    return;
  }

  if (password !== passwordRepeat) {
    alert("Las contraseñas no coinciden.");
    return;
  }

  try {
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

    alert("Te enviamos un código de 4 dígitos al mail.");

    window.location.href = "./register-step-2.html";
  } catch (error) {
    alert(error.message);
  }
});