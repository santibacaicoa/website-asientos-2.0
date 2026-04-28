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
   6. MENÚ DE PERFIL Y LOGOUT
   Función:
   - Abre/cierra el menú desplegable de perfil.
   - Permite cerrar sesión desde cualquier botón con clase logoutAction.
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

document.addEventListener("click", () => {
  closeProfileMenus();
});

document.querySelectorAll(".logoutAction").forEach((button) => {
  button.addEventListener("click", () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");

    window.location.href = "./login-form.html";
  });
});

const changePhotoBtn = document.getElementById("changePhotoBtn");
const photoInput = document.getElementById("photoInput");

changePhotoBtn.addEventListener("click", () => {
  photoInput.click();
});

photoInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = async function () {
    const base64 = reader.result;

    const email = localStorage.getItem("email");

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/update-photo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          foto: base64,
        }),
      });

      const data = await res.json();

      if (data.ok) {
        localStorage.setItem("foto", base64);
        updateUIPhoto(base64);
      }

    } catch (err) {
      console.error(err);
    }
  };

  reader.readAsDataURL(file);
});

function updateUIPhoto(foto) {
  const avatars = document.querySelectorAll(".user-avatar");

  avatars.forEach((img) => {
    img.src = foto;
  });
}

const foto = localStorage.getItem("foto");

if (foto) {
  updateUIPhoto(foto);
}

/* =========================================================
   CAMBIAR FOTO - ABRIR SELECTOR
   Función:
   - Cuando el usuario toca "Cambiar foto"
   - Se abre el selector de archivos
========================================================= */

const changePhotoBtn = document.getElementById("changePhotoBtn");
const photoInput = document.getElementById("photoInput");

changePhotoBtn?.addEventListener("click", () => {
  photoInput.click();
});

/* =========================================================
   CAMBIAR FOTO - LEER IMAGEN
   Función:
   - Detecta cuando el usuario selecciona una imagen
   - La convierte a base64
========================================================= */

photoInput?.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function () {
    const base64 = reader.result;

    // Guardamos en localStorage (por ahora)
    localStorage.setItem("userPhoto", base64);

    // Actualizamos UI
    updateUIPhoto(base64);
  };

  reader.readAsDataURL(file);
});

/* =========================================================
   ACTUALIZAR FOTO EN UI
   Función:
   - Reemplaza la imagen en todos los avatares
========================================================= */

function updateUIPhoto(photo) {
  const avatars = document.querySelectorAll(".user-avatar");

  avatars.forEach((img) => {
    img.src = photo;
  });
}

/* =========================================================
   CARGAR FOTO GUARDADA
   Función:
   - Si el usuario ya tiene foto guardada
   - Se muestra automáticamente al entrar
========================================================= */

const savedPhoto = localStorage.getItem("userPhoto");

if (savedPhoto) {
  updateUIPhoto(savedPhoto);
}