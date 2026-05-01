const BACKEND_URL = "https://website-asientos-2-0-backend.onrender.com";
const DEFAULT_AVATAR = "./assets/images/ui/avatar-default.png";

const token = localStorage.getItem("authToken");

if (!token) {
  window.location.href = "./login-form.html";
}

let user = JSON.parse(localStorage.getItem("authUser") || "null");

const channels = {
  empleados: {
    title: "#empleados",
    placeholder: "Escribe en #empleados...",
    messages: [
      {
        name: "Bot Assurant",
        text: "Bienvenidos al canal de empleados. Acá podrán comunicarse empleados y supervisores.",
        mine: false,
        bot: true,
      },
    ],
  },

  supervisores: {
    title: "#supervisores",
    placeholder: "Escribe en #supervisores...",
    messages: [
      {
        name: "Bot Assurant",
        text: "Bienvenidos al canal de supervisores. Este espacio estará reservado para coordinación interna.",
        mine: false,
        bot: true,
      },
    ],
  },

  avisos: {
    title: "#avisos",
    placeholder: "Escribe en #avisos...",
    messages: [
      {
        name: "Bot Assurant",
        text: "Bienvenidos al canal de avisos. Acá aparecerán comunicados importantes para todos.",
        mine: false,
        bot: true,
      },
    ],
  },
};

let activeChannel = "empleados";

const chatMessages = document.getElementById("chatMessages");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const activeChannelTitle = document.getElementById("activeChannelTitle");

function updateUIPhoto(photo) {
  document.querySelectorAll(".user-avatar").forEach((img) => {
    img.src = photo || DEFAULT_AVATAR;
  });
}

async function loadUserProfile() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (data.ok && data.user) {
      user = data.user;
      localStorage.setItem("authUser", JSON.stringify(user));
      updateUIPhoto(user.foto);
    }
  } catch (error) {
    console.error("Error cargando perfil:", error);
  }
}

function renderMessages() {
  const channel = channels[activeChannel];

  activeChannelTitle.textContent = channel.title;
  chatInput.placeholder = channel.placeholder;

  chatMessages.innerHTML = "";

  channel.messages.forEach((message) => {
    const article = document.createElement("article");
    article.className = message.mine ? "message message--mine" : "message";

    article.innerHTML = message.mine
      ? `<div class="message__bubble">${message.text}</div>`
      : `
        <div class="message__avatar">
          <img src="${message.bot ? "./assets/images/ui/logo-assurant.png" : DEFAULT_AVATAR}" alt="${message.name}" />
        </div>
        <div>
          <p class="message__name">${message.name}</p>
          <div class="message__bubble">${message.text}</div>
        </div>
      `;

    chatMessages.appendChild(article);
  });

  chatMessages.scrollTop = chatMessages.scrollHeight;
}

document.querySelectorAll(".channel-card").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".channel-card").forEach((item) => {
      item.classList.remove("is-active");
    });

    button.classList.add("is-active");
    activeChannel = button.dataset.channel;
    renderMessages();
  });
});

chatForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = chatInput.value.trim();

  if (!text) return;

  channels[activeChannel].messages.push({
    name: user?.nombre || "Usuario",
    text,
    mine: true,
  });

  chatInput.value = "";
  renderMessages();
});

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

  if (!isOpen) dropdown.classList.add("is-open");
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

profileDropdownDesktop?.addEventListener("click", (event) => event.stopPropagation());
profileDropdownMobile?.addEventListener("click", (event) => event.stopPropagation());

document.addEventListener("click", closeProfileMenus);

document.querySelectorAll(".logoutAction").forEach((button) => {
  button.addEventListener("click", () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    window.location.href = "./login-form.html";
  });
});

loadUserProfile();
renderMessages();