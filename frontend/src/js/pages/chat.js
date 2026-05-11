const BACKEND_URL = "https://website-asientos-2-0-backend.onrender.com";
const DEFAULT_AVATAR = "./assets/images/ui/avatar-default.png";

const token = localStorage.getItem("authToken");

if (!token) {
  window.location.href = "./login-form.html";
}

let user = JSON.parse(localStorage.getItem("authUser") || "null");
let activeChannel = "empleados";
let availableChannels = [];

const chatMessages = document.getElementById("chatMessages");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const activeChannelTitle = document.getElementById("activeChannelTitle");
const channelSelect = document.querySelector(".chat-channel-select");
const channelSelectButton = document.getElementById("channelSelectButton");
const channelSelectLabel = document.getElementById("channelSelectLabel");
const channelSelectMenu = document.getElementById("channelSelectMenu");

const channelInfo = {
  empleados: {
    label: "Procesadores",
    title: "#procesadores",
    placeholder: "Escribe en #procesadores...",
    icon: "🧑‍💻",
    description: "Procesadores y supervisores",
  },

  supervisores: {
    label: "Supervisores",
    title: "#supervisores",
    placeholder: "Escribe en #supervisores...",
    icon: "🛡️",
    description: "Coordinación interna",
  },

  avisos: {
    label: "Avisos",
    title: "#avisos",
    placeholder: "Escribe en #avisos...",
    icon: "📣",
    description: "Comunicados importantes",
  },
};

function updateUIPhoto(photo) {
  document.querySelectorAll(".user-avatar").forEach((img) => {
    img.src = photo || DEFAULT_AVATAR;
  });
}

async function apiRequest(path, options = {}) {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  const data = await res.json();

  if (!data.ok) {
    throw new Error(data.message || "Error en la request.");
  }

  return data;
}

async function loadUserProfile() {
  try {
    const data = await apiRequest("/api/auth/profile");

    if (data.user) {
      user = data.user;
      localStorage.setItem("authUser", JSON.stringify(user));
      updateUIPhoto(user.foto);
    }
  } catch (error) {
    console.error("Error cargando perfil:", error);
  }
}

function getMessageAuthor(message) {
  if (message.tipo === "bot") {
    return "Bot Assurant";
  }

  const fullName = `${message.nombre || ""} ${message.apellido || ""}`.trim();

  return fullName || "Usuario";
}

function formatMessageTime(dateValue) {
  const date = new Date(dateValue);

  return new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function createBotAvatar() {
  return `
    <div class="bot-avatar" aria-label="Bot Assurant">
      <div class="bot-avatar__head">
        <span class="bot-avatar__eye"></span>
        <span class="bot-avatar__eye"></span>
      </div>
      <div class="bot-avatar__body">
        <img src="./assets/images/ui/logo-assurant.png" alt="Assurant" />
      </div>
    </div>
  `;
}

function renderMessages(messages) {
  chatMessages.innerHTML = "";

  if (!messages.length) {
    chatMessages.innerHTML = `
      <div class="chat-empty-state">
        <strong>No hay mensajes todavía</strong>
        <span>Cuando alguien escriba en este canal, aparecerá acá.</span>
      </div>
    `;
    return;
  }

  messages.forEach((message) => {
    const isMine = message.usuario_id === user?.id;
    const isBot = message.tipo === "bot";
    const author = getMessageAuthor(message);

    const article = document.createElement("article");
    article.className = isMine ? "message message--mine" : "message";

    if (isMine) {
      article.innerHTML = `
        <div>
          <div class="message__bubble">${escapeHtml(message.mensaje)}</div>
          <span class="message__time">${formatMessageTime(message.created_at)}</span>
        </div>
      `;
    } else {
      article.innerHTML = `
        <div class="message__avatar">
          ${
            isBot
              ? createBotAvatar()
              : `<img src="${message.foto || DEFAULT_AVATAR}" alt="${author}" />`
          }
        </div>

        <div>
          <p class="message__name">${escapeHtml(author)}</p>
          <div class="message__bubble">${escapeHtml(message.mensaje)}</div>
          <span class="message__time">${formatMessageTime(message.created_at)}</span>
        </div>
      `;
    }

    chatMessages.appendChild(article);
  });

  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function updateActiveChannelUI() {
  const info = channelInfo[activeChannel];

  if (activeChannelTitle) {
    activeChannelTitle.textContent = info.title;
  }

  if (chatInput) {
    chatInput.placeholder = info.placeholder;
  }

  if (channelSelectLabel) {
    channelSelectLabel.textContent = info.label;
  }

  document.querySelectorAll(".channel-card").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.channel === activeChannel);
  });

  const activeChannelConfig = availableChannels.find(
    (channel) => channel.key === activeChannel
  );

  if (chatInput) {
    chatInput.disabled = !activeChannelConfig?.canWrite;
    chatInput.placeholder = activeChannelConfig?.canWrite
      ? info.placeholder
      : "Este canal es sólo lectura para tu usuario.";
  }

  const submitButton = chatForm?.querySelector("button");

  if (submitButton) {
    submitButton.disabled = !activeChannelConfig?.canWrite;
  }
}

function renderChannelMenu() {
  if (!channelSelectMenu) return;

  channelSelectMenu.innerHTML = "";

  availableChannels.forEach((channel) => {
    const info = channelInfo[channel.key];

    const button = document.createElement("button");
    button.className = "channel-card";
    button.dataset.channel = channel.key;
    button.type = "button";

    button.innerHTML = `
      <span class="channel-icon">${info.icon}</span>
      <span>
        <strong>${info.label}</strong>
        <small>${info.description}</small>
      </span>
    `;

    button.addEventListener("click", async () => {
      activeChannel = channel.key;
      channelSelect?.classList.remove("is-open");
      updateActiveChannelUI();
      await loadMessages();
    });

    channelSelectMenu.appendChild(button);
  });

  updateActiveChannelUI();
}

async function loadChannels() {
  try {
    const data = await apiRequest("/api/chat/channels");

    availableChannels = data.channels || [];

    if (!availableChannels.some((channel) => channel.key === activeChannel)) {
      activeChannel = availableChannels[0]?.key || "empleados";
    }

    renderChannelMenu();
  } catch (error) {
    console.error("Error cargando canales:", error);
  }
}

async function loadMessages() {
  try {
    const data = await apiRequest(`/api/chat/${activeChannel}/messages`);
    renderMessages(data.messages || []);
  } catch (error) {
    console.error("Error cargando mensajes:", error);

    chatMessages.innerHTML = `
      <div class="chat-empty-state">
        <strong>No se pudo cargar este canal</strong>
        <span>${escapeHtml(error.message)}</span>
      </div>
    `;
  }
}

chatForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const text = chatInput.value.trim();

  if (!text) return;

  try {
    chatInput.value = "";

    await apiRequest(`/api/chat/${activeChannel}/messages`, {
      method: "POST",
      body: JSON.stringify({
        message: text,
      }),
    });

    await loadMessages();
  } catch (error) {
    console.error("Error enviando mensaje:", error);
  }
});

channelSelectButton?.addEventListener("click", (event) => {
  event.stopPropagation();
  channelSelect?.classList.toggle("is-open");
});

document.addEventListener("click", () => {
  channelSelect?.classList.remove("is-open");
});

channelSelect?.addEventListener("click", (event) => {
  event.stopPropagation();
});

const profileMenuButtonDesktop = document.getElementById("profileMenuButtonDesktop");
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

document.addEventListener("click", closeProfileMenus);

document.querySelectorAll(".logoutAction").forEach((button) => {
  button.addEventListener("click", () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    window.location.href = "./login-form.html";
  });
});

async function initChat() {
  await loadUserProfile();
  await loadChannels();
  await loadMessages();

  setInterval(loadMessages, 15000);
}

initChat();