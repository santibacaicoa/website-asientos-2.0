/* =========================================================
   HUB.JS
   Función:
   - Protege el hub.
   - Si no hay token, manda al login.
   - Muestra nombre del usuario logueado.
   - Actualiza fecha y hora.
   - Permite cerrar sesión.
========================================================= */

/* =========================================================
   1. VERIFICAR SESIÓN
   Función:
   - Buscar el token guardado al hacer login.
   - Si no existe, el usuario no está logueado.
========================================================= */

const token = localStorage.getItem("authToken");

if (!token) {
  window.location.href = "./login-form.html";
}

/* =========================================================
   2. LEER DATOS DEL USUARIO
   Función:
   - Recupera los datos básicos guardados en login.
========================================================= */

const userRaw = localStorage.getItem("authUser");
const user = userRaw ? JSON.parse(userRaw) : null;

/* =========================================================
   3. MOSTRAR NOMBRE
   Función:
   - Muestra solo el nombre en el saludo.
   - Ejemplo: "Hola, Mario!"
========================================================= */

const userFirstNameElement = document.getElementById("userFirstName");

if (user && userFirstNameElement) {
  userFirstNameElement.textContent = user.nombre || "Usuario";
}

/* =========================================================
   4. FECHA Y HORA
   Función:
   - Muestra fecha/hora en mobile.
   - Muestra fecha en desktop.
========================================================= */

const currentDateTimeMobile = document.getElementById("currentDateTimeMobile");
const currentDateTimeDesktop = document.getElementById("currentDateTimeDesktop");

function formatMobileDateTime(date) {
  const datePart = new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "2-digit",
    month: "short",
  }).format(date);

  const timePart = new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

  return `${datePart} / ${timePart}`;
}

function formatDesktopDate(date) {
  return new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function updateDateTime() {
  const now = new Date();

  if (currentDateTimeMobile) {
    currentDateTimeMobile.textContent = formatMobileDateTime(now);
  }

  if (currentDateTimeDesktop) {
    currentDateTimeDesktop.textContent = formatDesktopDate(now);
  }
}

updateDateTime();
setInterval(updateDateTime, 60 * 1000);

/* =========================================================
   5. MÉTRICAS PLACEHOLDER
   Función:
   - Por ahora quedan en 0.
   - Luego se conectarán al sistema de reservas.
========================================================= */

const totalSeats = document.getElementById("totalSeats");
const occupiedToday = document.getElementById("occupiedToday");
const availableToday = document.getElementById("availableToday");

if (totalSeats) totalSeats.textContent = "0";
if (occupiedToday) occupiedToday.textContent = "0";
if (availableToday) availableToday.textContent = "0";

/* =========================================================
   6. LOGOUT
   Función:
   - Borra token y usuario del navegador.
   - Vuelve al login.
========================================================= */

const logoutButton = document.getElementById("logoutButton");

logoutButton?.addEventListener("click", () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("authUser");

  window.location.href = "./login-form.html";
});