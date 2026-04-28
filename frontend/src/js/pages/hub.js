/* =========================================================
   HUB.JS
   Función general:
   - Protege el hub.
   - Si no hay token, manda al login.
   - Muestra nombre del usuario logueado.
   - Actualiza fecha y hora.
   - Maneja menú de perfil.
   - Permite cerrar sesión.
   - Mantiene foto local temporal sin tocar backend.
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
   - Ejemplo: "Hola, Santiago!"
========================================================= */

const userFirstNameElement = document.getElementById("userFirstName");

if (userFirstNameElement) {
  userFirstNameElement.textContent = user?.nombre || "Usuario";
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
   6. MENÚ DE PERFIL
   Función:
   - Abre/cierra el menú desplegable de perfil.
   - Se puede abrir desde desktop, mobile header o bottom nav.
========================================================= */

const profileMenuButtonDesktop = document.getElementById("profileMenuButtonDesktop");
const profileMenuButtonMobile = document.getElementById("profileMenuButtonMobile");
const profileMenuButtonBottom = document.getElementById("profileMenuButtonBottom");

const profileDropdownDesktop = document.getElementById("profileDropdownDesktop");
const profileDropdownMobile = document.getElementById("profileDropdownMobile");

function closeProfileMenus() {
  profileDropdownDesktop?.classList.remove("is-open");
  profileDropdownMobile?.classList.remove("is-open");
}

function toggleDropdown(dropdown) {
  if (!dropdown) return;

  const isOpen = dropdown.classList.contains("is-open");

  closeProfileMenus();

  if (!isOpen) {
    dropdown.classList.add("is-open");
  }
}

profileMenuButtonDesktop?.addEventListener("click", (event) => {
  event.stopPropagation();
  toggleDropdown(profileDropdownDesktop);
});

profileMenuButtonMobile?.addEventListener("click", (event) => {
  event.stopPropagation();
  toggleDropdown(profileDropdownMobile);
});

profileMenuButtonBottom?.addEventListener("click", (event) => {
  event.stopPropagation();
  toggleDropdown(profileDropdownMobile);
});

profileDropdownDesktop?.addEventListener("click", (event) => {
  event.stopPropagation();
});

profileDropdownMobile?.addEventListener("click", (event) => {
  event.stopPropagation();
});

document.addEventListener("click", () => {
  closeProfileMenus();
});

/* =========================================================
   7. LOGOUT
   Función:
   - Borra token y usuario del navegador.
   - Vuelve al login.
========================================================= */

document.querySelectorAll(".logoutAction").forEach((button) => {
  button.addEventListener("click", () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    localStorage.removeItem("userPhoto");

    window.location.href = "./login-form.html";
  });
});

/* =========================================================
   8. FOTO DE PERFIL LOCAL
   Función:
   - Permite cambiar foto solo en este navegador.
   - No toca backend todavía.
   - Evita romper deploy mientras estabilizamos.
========================================================= */

const changePhotoBtn = document.getElementById("changePhotoBtn");
const photoInput = document.getElementById("photoInput");

function updateUIPhoto(photo) {
  const avatars = document.querySelectorAll(".user-avatar");

  avatars.forEach((img) => {
    img.src = photo;
  });
}

changePhotoBtn?.addEventListener("click", () => {
  closeProfileMenus();
  photoInput?.click();
});

photoInput?.addEventListener("change", (event) => {
  const file = event.target.files?.[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = function () {
    const base64 = reader.result;

    localStorage.setItem("userPhoto", base64);
    updateUIPhoto(base64);
  };

  reader.readAsDataURL(file);
});

/* =========================================================
   9. CARGAR FOTO GUARDADA
   Función:
   - Si el usuario ya eligió una foto local,
     se muestra automáticamente al entrar.
========================================================= */

const savedPhoto = localStorage.getItem("userPhoto");

if (savedPhoto) {
  updateUIPhoto(savedPhoto);
}