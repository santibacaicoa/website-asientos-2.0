/* =========================================================
   MAPA.JS
   Función:
   - Protege la página.
   - Carga foto del usuario si existe.
   - Permite seleccionar piso.
   - Cambia entre vista selección y vista detalle.
   - Maneja selección visual de asientos mock.
========================================================= */

const BACKEND_URL = "https://website-asientos-2-0-backend.onrender.com";
const DEFAULT_AVATAR = "./assets/images/ui/avatar-default.png";

const token = localStorage.getItem("authToken");

if (!token) {
  window.location.href = "./login-form.html";
}

/* =========================================================
   1. CARGAR PERFIL
========================================================= */

function updateUIPhoto(photo) {
  const avatars = document.querySelectorAll(".user-avatar");

  avatars.forEach((img) => {
    img.src = photo || DEFAULT_AVATAR;
  });
}

async function loadUserProfile() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (data.ok && data.user) {
      localStorage.setItem("authUser", JSON.stringify(data.user));
      updateUIPhoto(data.user.foto);
    }
  } catch (error) {
    console.error("Error cargando perfil:", error);
  }
}

loadUserProfile();

/* =========================================================
   2. DATOS DE PISOS
========================================================= */

const floors = {
  7: {
    title: "Piso 7 - detalle de reserva",
    image: "./assets/images/ui/piso7.jpg",
  },
  8: {
    title: "Piso 8 - detalle de reserva",
    image: "./assets/images/ui/piso8.jpg",
  },
  11: {
    title: "Piso 11 - detalle de reserva",
    image: "./assets/images/ui/piso11.png",
  },
  12: {
    title: "Piso 12 - detalle de reserva",
    image: "./assets/images/ui/piso12.jpg",
  },
};

/* =========================================================
   3. CAMBIO ENTRE VISTAS
========================================================= */

const floorSelectView = document.getElementById("floorSelectView");
const floorDetailView = document.getElementById("floorDetailView");
const selectedFloorImage = document.getElementById("selectedFloorImage");
const floorDetailTitle = document.getElementById("floorDetailTitle");
const backToFloors = document.getElementById("backToFloors");

function openFloorDetail(floorNumber) {
  const floor = floors[floorNumber];

  if (!floor) return;

  floorDetailTitle.textContent = floor.title;
  selectedFloorImage.src = floor.image;
  selectedFloorImage.alt = `Mapa piso ${floorNumber}`;

  floorSelectView.classList.add("is-hidden");
  floorDetailView.classList.remove("is-hidden");

  document.querySelectorAll(".seat").forEach((seat) => {
    seat.classList.remove("is-selected");
  });
}

function backToFloorSelect() {
  floorDetailView.classList.add("is-hidden");
  floorSelectView.classList.remove("is-hidden");
}

document.querySelectorAll("[data-floor]").forEach((button) => {
  button.addEventListener("click", () => {
    const floorNumber = button.dataset.floor;
    openFloorDetail(floorNumber);
  });
});

backToFloors?.addEventListener("click", backToFloorSelect);

/* =========================================================
   4. SELECCIÓN VISUAL DE ASIENTOS MOCK
========================================================= */

document.querySelectorAll(".seat").forEach((seat) => {
  seat.addEventListener("click", () => {
    document.querySelectorAll(".seat").forEach((item) => {
      item.classList.remove("is-selected");
    });

    seat.classList.add("is-selected");
  });
});

/* =========================================================
   5. MENÚ DE PERFIL (IGUAL QUE HUB)
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
   6. LOGOUT
========================================================= */

document.querySelectorAll(".logoutAction").forEach((button) => {
  button.addEventListener("click", () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");

    window.location.href = "./login-form.html";
  });
});

/* =========================================================
   7. CAMBIAR FOTO DESDE MAPA
========================================================= */

const changePhotoButtons = document.querySelectorAll(".changePhotoBtn");
const photoInput = document.getElementById("photoInput");

changePhotoButtons.forEach((button) => {
  button.addEventListener("click", () => {
    closeProfileMenus();
    photoInput?.click();
  });
});

function resizeImageToBase64(file, maxSize = 600, quality = 0.78) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = () => {
      img.src = reader.result;
    };

    img.onload = () => {
      const canvas = document.createElement("canvas");

      let { width, height } = img;

      if (width > height && width > maxSize) {
        height = Math.round((height * maxSize) / width);
        width = maxSize;
      } else if (height > maxSize) {
        width = Math.round((width * maxSize) / height);
        height = maxSize;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      resolve(canvas.toDataURL("image/jpeg", quality));
    };

    reader.onerror = reject;
    img.onerror = reject;

    reader.readAsDataURL(file);
  });
}

photoInput?.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];

  if (!file) return;

  try {
    const base64 = await resizeImageToBase64(file);

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

    localStorage.setItem("authUser", JSON.stringify(data.user));
    updateUIPhoto(data.user.foto);

    photoInput.value = "";
  } catch (error) {
    console.error("Error subiendo foto desde mapa:", error);
  }
});