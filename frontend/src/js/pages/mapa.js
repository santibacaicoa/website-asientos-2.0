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