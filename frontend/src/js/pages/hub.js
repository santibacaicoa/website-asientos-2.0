/* =========================================================
   HUB.JS
   Función general:
   - Protege el hub.
   - Si no hay token, manda al login.
   - Muestra nombre del usuario logueado.
   - Actualiza fecha y hora.
   - Maneja menú de perfil.
   - Permite cerrar sesión.
   - Carga y guarda foto de perfil desde backend/Neon.
========================================================= */

/* =========================================================
   0. CONFIG
========================================================= */

const BACKEND_URL = "https://website-asientos-2-0-backend.onrender.com";
const DEFAULT_AVATAR = "./assets/images/ui/avatar-default.png";

/* =========================================================
   1. VERIFICAR SESIÓN
========================================================= */

const token = localStorage.getItem("authToken");

if (!token) {
  window.location.href = "./login-form.html";
}

/* =========================================================
   2. LEER DATOS DEL USUARIO
========================================================= */

const userRaw = localStorage.getItem("authUser");
let user = userRaw ? JSON.parse(userRaw) : null;

/* =========================================================
   3. MOSTRAR NOMBRE
========================================================= */

const userFirstNameElement = document.getElementById("userFirstName");

function updateUserName(currentUser) {
  if (userFirstNameElement) {
    userFirstNameElement.textContent = currentUser?.nombre || "Usuario";
  }
}

updateUserName(user);

/* =========================================================
   4. ACTUALIZAR AVATAR
========================================================= */

function updateUIPhoto(photo) {
  const avatars = document.querySelectorAll(".user-avatar");

  avatars.forEach((img) => {
    img.src = photo || DEFAULT_AVATAR;
  });
}

updateUIPhoto(user?.foto);

/* =========================================================
   5. CARGAR PERFIL DESDE BACKEND
   Función:
   - Al entrar al hub, pide el usuario actualizado.
   - Si tiene foto en Neon, la muestra.
========================================================= */

async function loadUserProfile() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!data.ok || !data.user) return;

    user = data.user;

    localStorage.setItem("authUser", JSON.stringify(user));

    updateUserName(user);
    updateUIPhoto(user.foto);
  } catch (error) {
    console.error("Error cargando perfil:", error);
  }
}

loadUserProfile();

/* =========================================================
   6. FECHA Y HORA
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
   7. MÉTRICAS PLACEHOLDER
========================================================= */

const totalSeats = document.getElementById("totalSeats");
const occupiedToday = document.getElementById("occupiedToday");
const availableToday = document.getElementById("availableToday");

if (totalSeats) totalSeats.textContent = "0";
if (occupiedToday) occupiedToday.textContent = "0";
if (availableToday) availableToday.textContent = "0";

/* =========================================================
   8. MENÚ DE PERFIL
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
   9. LOGOUT
========================================================= */

document.querySelectorAll(".logoutAction").forEach((button) => {
  button.addEventListener("click", () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");

    window.location.href = "./login-form.html";
  });
});

/* =========================================================
   10. CAMBIAR FOTO DE PERFIL
   Función:
   - Abre selector de imagen.
   - Convierte imagen a base64.
   - La manda al backend.
   - Backend la guarda en Neon.
   - Actualiza localStorage y UI.
========================================================= */

const changePhotoBtn = document.getElementById("changePhotoBtn");
const photoInput = document.getElementById("photoInput");

changePhotoBtn?.addEventListener("click", () => {
  closeProfileMenus();
  photoInput?.click();
});

photoInput?.addEventListener("change", (event) => {
  const file = event.target.files?.[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = async function () {
    const base64 = reader.result;

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/profile/photo`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          foto: base64,
        }),
      });

      const data = await res.json();

      if (!data.ok || !data.user) {
        console.error("Error actualizando foto:", data.message);
        return;
      }

      user = data.user;

      localStorage.setItem("authUser", JSON.stringify(user));
      updateUIPhoto(user.foto);
    } catch (error) {
      console.error("Error subiendo foto:", error);
    }
  };

  reader.readAsDataURL(file);
});