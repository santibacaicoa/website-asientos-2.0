import {
  createChatMessage,
  deleteOldChatMessages,
  findMessagesByChannel,
} from "../repositories/chat.repository.js";

const CHAT_RETENTION_DAYS = 30;

const CHANNELS = {
  empleados: {
    label: "Procesadores",
    canRead: ["empleado", "supervisor", "admin"],
    canWrite: ["empleado", "supervisor", "admin"],
  },

  supervisores: {
    label: "Supervisores",
    canRead: ["supervisor", "admin"],
    canWrite: ["supervisor", "admin"],
  },

  avisos: {
    label: "Avisos",
    canRead: ["empleado", "supervisor", "admin"],
    canWrite: ["supervisor", "admin"],
  },
};

function getUserRole(user) {
  return user?.rol || "empleado";
}

function validateChannel(channel) {
  if (!CHANNELS[channel]) {
    throw new Error("Canal inválido.");
  }
}

function canReadChannel(role, channel) {
  return CHANNELS[channel].canRead.includes(role);
}

function canWriteChannel(role, channel) {
  return CHANNELS[channel].canWrite.includes(role);
}

export function getAvailableChannels({ user }) {
  const role = getUserRole(user);

  return Object.entries(CHANNELS)
    .filter(([, config]) => config.canRead.includes(role))
    .map(([key, config]) => ({
      key,
      label: config.label,
      canWrite: config.canWrite.includes(role),
    }));
}

export async function getChannelMessages({ user, channel }) {
  validateChannel(channel);

  const role = getUserRole(user);

  if (!canReadChannel(role, channel)) {
    throw new Error("No tenés permiso para ver este canal.");
  }

  await deleteOldChatMessages(CHAT_RETENTION_DAYS);

  const messages = await findMessagesByChannel(channel);

  return {
    channel,
    messages,
  };
}

export async function sendChannelMessage({ user, channel, message }) {
  validateChannel(channel);

  const role = getUserRole(user);

  if (!canWriteChannel(role, channel)) {
    throw new Error("No tenés permiso para escribir en este canal.");
  }

  const cleanMessage = String(message || "").trim();

  if (!cleanMessage) {
    throw new Error("El mensaje no puede estar vacío.");
  }

  if (cleanMessage.length > 1000) {
    throw new Error("El mensaje es demasiado largo.");
  }

  await deleteOldChatMessages(CHAT_RETENTION_DAYS);

  const createdMessage = await createChatMessage({
    channel,
    userId: user.id,
    type: "usuario",
    message: cleanMessage,
  });

  return {
    message: createdMessage,
  };
}