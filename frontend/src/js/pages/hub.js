/* =========================================================
   HUB.JS
   Función:
   - Verifica si el usuario está logueado
   - Si no lo está → lo manda al login
   - Si lo está → muestra su nombre
========================================================= */

/* =========================================================
   1. VERIFICAR TOKEN
========================================================= */

const token = localStorage.getItem("authToken");

if (!token) {
  window.location.href = "./login-form.html";
}

/* =========================================================
   2. CARGAR DATOS DEL USUARIO
========================================================= */

const userRaw = localStorage.getItem("authUser");
const user = userRaw ? JSON.parse(userRaw) : null;

/* =========================================================
   3. MOSTRAR NOMBRE EN EL HUB
========================================================= */

const userNameElement = document.getElementById("userName");

if (user && userNameElement) {
  userNameElement.textContent = `${user.nombre} ${user.apellido}`;
}

/* =========================================================
   4. LOGOUT
========================================================= */

const logoutButton = document.getElementById("logoutButton");

logoutButton?.addEventListener("click", () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("authUser");

  window.location.href = "./login-form.html";
});