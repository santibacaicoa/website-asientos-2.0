import { apiFetch } from "../api/client.js";

const loginForm = document.getElementById("loginForm");

loginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("loginEmail")?.value.trim();
  const password = document.getElementById("loginPassword")?.value;

  try {
    const result = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
      }),
    });

    localStorage.setItem("authToken", result.token);
    localStorage.setItem("authUser", JSON.stringify(result.user));

    alert("Login exitoso");

    window.location.href = "./hub.html";
  } catch (error) {
    alert(error.message);
  }
});