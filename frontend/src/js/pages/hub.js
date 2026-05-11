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
    img.classList.add("is-updating");

    setTimeout(() => {
      img.src = photo || DEFAULT_AVATAR;

      img.onload = () => {
        img.classList.remove("is-updating");
      };
    }, 120);
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
   10. CAMBIAR FOTO DE PERFIL - RECORTE CON PREVIEW
   Función:
   - Abre selector de imagen.
   - Muestra modal con preview circular.
   - Permite ajustar zoom.
   - Recorta la imagen en canvas.
   - La manda al backend.
   - Backend la guarda en Neon.
   - Actualiza localStorage y UI.
========================================================= */

const changePhotoButtons = document.querySelectorAll(".changePhotoBtn");
const photoInput = document.getElementById("photoInput");

const photoCropModal = document.getElementById("photoCropModal");
const photoCropCanvas = document.getElementById("photoCropCanvas");
const photoCropZoom = document.getElementById("photoCropZoom");
const photoCropClose = document.getElementById("photoCropClose");
const photoCropCancel = document.getElementById("photoCropCancel");
const photoCropSave = document.getElementById("photoCropSave");

const photoCropCtx = photoCropCanvas?.getContext("2d");

let selectedPhotoImage = null;
let selectedPhotoFile = null;

let selectedPhotoZoom = 1;

let selectedPhotoOffsetX = 0;
let selectedPhotoOffsetY = 0;

let isDraggingPhoto = false;

let dragStartX = 0;
let dragStartY = 0;

function openPhotoCropModal() {
  if (!photoCropModal) return;

  photoCropModal.classList.add("is-open");
  photoCropModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closePhotoCropModal() {
  if (!photoCropModal) return;

  photoCropModal.classList.remove("is-open");
  photoCropModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";

  selectedPhotoImage = null;
  selectedPhotoFile = null;
  selectedPhotoZoom = 1;
  selectedPhotoOffsetX = 0;
selectedPhotoOffsetY = 0;

  if (photoCropZoom) {
    photoCropZoom.value = "1";
  }

  if (photoInput) {
    photoInput.value = "";
  }

  if (photoCropCtx && photoCropCanvas) {
    photoCropCtx.clearRect(0, 0, photoCropCanvas.width, photoCropCanvas.height);
  }
}

function drawPhotoPreview() {
  if (!photoCropCtx || !photoCropCanvas || !selectedPhotoImage) return;

  const canvasSize = photoCropCanvas.width;

  const imageWidth = selectedPhotoImage.naturalWidth;
  const imageHeight = selectedPhotoImage.naturalHeight;

  photoCropCtx.clearRect(0, 0, canvasSize, canvasSize);

  photoCropCtx.save();

  photoCropCtx.beginPath();
  photoCropCtx.arc(
    canvasSize / 2,
    canvasSize / 2,
    canvasSize / 2,
    0,
    Math.PI * 2
  );
  photoCropCtx.clip();

  const baseScale = Math.max(canvasSize / imageWidth, canvasSize / imageHeight);
  const finalScale = baseScale * selectedPhotoZoom;

  const drawWidth = imageWidth * finalScale;
  const drawHeight = imageHeight * finalScale;

  const maxOffsetX = Math.max(0, (drawWidth - canvasSize) / 2);
  const maxOffsetY = Math.max(0, (drawHeight - canvasSize) / 2);

  selectedPhotoOffsetX = Math.min(
    maxOffsetX,
    Math.max(-maxOffsetX, selectedPhotoOffsetX)
  );

  selectedPhotoOffsetY = Math.min(
    maxOffsetY,
    Math.max(-maxOffsetY, selectedPhotoOffsetY)
  );

  const drawX = (canvasSize - drawWidth) / 2 + selectedPhotoOffsetX;
  const drawY = (canvasSize - drawHeight) / 2 + selectedPhotoOffsetY;

  photoCropCtx.drawImage(
    selectedPhotoImage,
    drawX,
    drawY,
    drawWidth,
    drawHeight
  );

  photoCropCtx.restore();
}

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const reader = new FileReader();

    reader.onload = () => {
      image.src = reader.result;
    };

    image.onload = () => {
      resolve(image);
    };

    reader.onerror = reject;
    image.onerror = reject;

    reader.readAsDataURL(file);
  });
}

function getCroppedPhotoBase64(quality = 0.78) {
  if (!photoCropCanvas) return null;

  const outputCanvas = document.createElement("canvas");
  const outputSize = 480;

  outputCanvas.width = outputSize;
  outputCanvas.height = outputSize;

  const outputCtx = outputCanvas.getContext("2d");

  outputCtx.drawImage(photoCropCanvas, 0, 0, outputSize, outputSize);

  return outputCanvas.toDataURL("image/jpeg", quality);
}

async function uploadProfilePhoto(base64Photo) {
  const res = await fetch(`${BACKEND_URL}/api/auth/profile/photo`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      foto: base64Photo,
    }),
  });

  const text = await res.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    console.error("Respuesta no JSON del backend:", text);
    return null;
  }

  return data;
}

changePhotoButtons.forEach((button) => {
  button.addEventListener("click", () => {
    closeProfileMenus();
    photoInput?.click();
  });
});

photoInput?.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    console.error("El archivo seleccionado no es una imagen.");
    photoInput.value = "";
    return;
  }

  try {
    selectedPhotoFile = file;
    selectedPhotoImage = await loadImageFromFile(file);
    selectedPhotoZoom = 1;
    selectedPhotoOffsetX = 0;
selectedPhotoOffsetY = 0;

    if (photoCropZoom) {
      photoCropZoom.value = "1";
    }

    drawPhotoPreview();
    openPhotoCropModal();
  } catch (error) {
    console.error("Error cargando imagen:", error);
    photoInput.value = "";
  }
});

photoCropZoom?.addEventListener("input", () => {
  selectedPhotoZoom = Number(photoCropZoom.value);
  drawPhotoPreview();
});

/* =========================================================
   DRAG FOTO PERFIL
   Función:
   - Permite mover la imagen con mouse o touch.
========================================================= */

function startPhotoDrag(clientX, clientY) {
  isDraggingPhoto = true;

  dragStartX = clientX - selectedPhotoOffsetX;
  dragStartY = clientY - selectedPhotoOffsetY;
}

function movePhotoDrag(clientX, clientY) {
  if (!isDraggingPhoto) return;

  selectedPhotoOffsetX = clientX - dragStartX;
  selectedPhotoOffsetY = clientY - dragStartY;

  drawPhotoPreview();
}

function stopPhotoDrag() {
  isDraggingPhoto = false;
}

/* =========================
   MOUSE
========================= */

photoCropCanvas?.addEventListener("mousedown", (event) => {
  event.preventDefault();

  startPhotoDrag(event.clientX, event.clientY);
});

window.addEventListener("mousemove", (event) => {
  movePhotoDrag(event.clientX, event.clientY);
});

window.addEventListener("mouseup", () => {
  stopPhotoDrag();
});

/* =========================
   TOUCH MOBILE
========================= */

photoCropCanvas?.addEventListener(
  "touchstart",
  (event) => {
    const touch = event.touches[0];

    if (!touch) return;

    startPhotoDrag(touch.clientX, touch.clientY);
  },
  { passive: true }
);

window.addEventListener(
  "touchmove",
  (event) => {
    const touch = event.touches[0];

    if (!touch) return;

    movePhotoDrag(touch.clientX, touch.clientY);
  },
  { passive: true }
);

window.addEventListener("touchend", () => {
  stopPhotoDrag();
});

photoCropClose?.addEventListener("click", () => {
  closePhotoCropModal();
});

photoCropCancel?.addEventListener("click", () => {
  closePhotoCropModal();
});

photoCropModal?.addEventListener("click", (event) => {
  if (event.target === photoCropModal) {
    closePhotoCropModal();
  }
});

photoCropSave?.addEventListener("click", async () => {
  if (!selectedPhotoImage) return;

  const base64 = getCroppedPhotoBase64();

  if (!base64) return;

  try {
    photoCropSave.disabled = true;
photoCropSave.classList.add("is-loading");
photoCropSave.textContent = "Guardando...";

    const data = await uploadProfilePhoto(base64);

    if (!data?.ok || !data.user) {
      console.error("Error actualizando foto:", data?.message);
      return;
    }

    user = data.user;

    localStorage.setItem("authUser", JSON.stringify(user));
    updateUIPhoto(user.foto);

    closePhotoCropModal();
  } catch (error) {
    console.error("Error subiendo foto:", error);
  } finally {
    photoCropSave.disabled = false;
photoCropSave.classList.remove("is-loading");
photoCropSave.textContent = "Guardar";
  }
});