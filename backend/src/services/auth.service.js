import {
  findUserByEmail,
  findVerificationTokenByEmailAndToken,
  deleteVerificationTokensByEmail,
  createVerificationToken,
  createUser,
  deleteResetTokensByUserId,
  createResetPasswordToken,
  findResetPasswordTokenByEmailAndToken,
  updateUserPassword,
  markResetPasswordTokenUsed,
  updateUserPhotoById,
  findUserById,
} from "../repositories/auth.repository.js";

import { hashPassword, comparePassword } from "../utils/password.js";
import { generateRandomToken } from "../utils/token.js";
import { signAccessToken } from "../utils/jwt.js";
import { mailTransporter } from "../config/mail.js";
import { env } from "../config/env.js";
import { resend } from "../config/resend.js";

export async function registerUser({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await findUserByEmail(normalizedEmail);

  if (existingUser) {
    throw new Error("Ya existe un usuario registrado con ese email.");
  }

  await deleteVerificationTokensByEmail(normalizedEmail);

  const passwordHash = await hashPassword(password);
  const token = Math.floor(1000 + Math.random() * 9000).toString();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 15);

  await createVerificationToken({
    email: normalizedEmail,
    token,
    nombre: null,
    apellido: null,
    passwordHash,
    expiresAt,
  });

try {
  const { data, error } = await resend.emails.send({
    from: "Website Asientos <noreply@assientos-assurantweb.fun>",
    to: [normalizedEmail],
    subject: "Código de verificación - Website Asientos",
    html: `
      <h2>Código de verificación</h2>
      <p>Tu código de verificación es:</p>
      <h1>${token}</h1>
      <p>Este código vence en 15 minutos.</p>
    `,
  });

  if (error) {
    console.error("ERROR RESEND REGISTRO:", error);
    throw new Error("No se pudo enviar el email de verificación.");
  }

  console.log("MAIL REGISTRO ENVIADO CON RESEND:", data);
} catch (error) {
  console.error("ERROR MAIL REGISTRO:", error);

  throw new Error(
    "No se pudo enviar el email de verificación. Revisá RESEND_API_KEY en Render."
  );
}

  return {
    message: "Te enviamos un código de verificación por email.",
  };
}

export async function verifyEmailToken({ email, token, nombre, apellido }) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedToken = token.trim();

  const existingUser = await findUserByEmail(normalizedEmail);

  if (existingUser) {
    throw new Error("Ese email ya fue verificado y registrado.");
  }

  const verificationRecord = await findVerificationTokenByEmailAndToken(
    normalizedEmail,
    normalizedToken
  );

  if (!verificationRecord) {
    throw new Error("Token no válido.");
  }

  if (new Date(verificationRecord.expires_at) < new Date()) {
    throw new Error("El token expiró.");
  }

  const createdUser = await createUser({
    email: verificationRecord.email,
    passwordHash: verificationRecord.password_hash,
    nombre: nombre.trim(),
    apellido: apellido.trim(),
  });

  await deleteVerificationTokensByEmail(normalizedEmail);

  return {
    message: "Token válido. Cuenta creada correctamente.",
    user: createdUser,
  };
}

export async function loginUser({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await findUserByEmail(normalizedEmail);

  if (!user) {
    throw new Error("Credenciales inválidas.");
  }

  if (user.estado_cuenta !== "activo") {
    throw new Error("La cuenta no está activa.");
  }

  const isPasswordValid = await comparePassword(password, user.password_hash);

  if (!isPasswordValid) {
    throw new Error("Credenciales inválidas.");
  }

  const token = signAccessToken({
    sub: user.id,
    email: user.email,
    rol: user.rol,
  });

  return {
    message: "Login exitoso.",
    token,
    user: {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      apellido: user.apellido,
      rol: user.rol,
      supervisor_id: user.supervisor_id,
      foto: user.foto,
    },
  };
}

export async function forgotPassword({ email }) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await findUserByEmail(normalizedEmail);

  if (!user) {
    return {
      message:
        "Si el email existe, te enviaremos un token para restablecer la contraseña.",
    };
  }

  await deleteResetTokensByUserId(user.id);

  const token = Math.floor(1000 + Math.random() * 9000).toString();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 15);

  await createResetPasswordToken({
    usuarioId: user.id,
    token,
    expiresAt,
  });

  try {
  const { data, error } = await resend.emails.send({
    from: "Website Asientos <noreply@assientos-assurantweb.fun>",
    to: [normalizedEmail],
    subject: "Restablecer contraseña - Website Asientos",
    html: `
      <h2>Restablecer contraseña</h2>
      <p>Tu código para restablecer la contraseña es:</p>
      <h1>${token}</h1>
      <p>Este código vence en 15 minutos.</p>
    `,
  });

  if (error) {
    console.error("ERROR RESEND RESET PASSWORD:", error);
    throw new Error("No se pudo enviar el email para restablecer contraseña.");
  }

  console.log("MAIL RESET ENVIADO CON RESEND:", data);
} catch (error) {
  console.error("ERROR MAIL RESET:", error);

  throw new Error(
    "No se pudo enviar el email para restablecer contraseña. Revisá RESEND_API_KEY en Render."
  );
}

  return {
    message:
      "Si el email existe, te enviaremos un token para restablecer la contraseña.",
  };
}

export async function resetPassword({ email, token, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedToken = token.trim();

  const resetRecord = await findResetPasswordTokenByEmailAndToken(
    normalizedEmail,
    normalizedToken
  );

  if (!resetRecord) {
    throw new Error("Token inválido o email incorrecto.");
  }

  if (resetRecord.used_at) {
    throw new Error("Este token ya fue utilizado.");
  }

  if (new Date(resetRecord.expires_at) < new Date()) {
    throw new Error("El token expiró.");
  }

  const passwordHash = await hashPassword(password);

  await updateUserPassword(resetRecord.usuario_id, passwordHash);
  await markResetPasswordTokenUsed(resetRecord.id);

  return {
    message: "Contraseña actualizada correctamente.",
  };
}

export async function updateProfilePhoto({ userId, foto }) {
  if (!foto || typeof foto !== "string") {
    throw new Error("La foto es obligatoria.");
  }

  if (!foto.startsWith("data:image/")) {
    throw new Error("El archivo debe ser una imagen válida.");
  }

  const maxSizeInChars = 2_000_000;

  if (foto.length > maxSizeInChars) {
    throw new Error("La imagen es demasiado grande.");
  }

  const updatedUser = await updateUserPhotoById(userId, foto);

  if (!updatedUser) {
    throw new Error("Usuario no encontrado.");
  }

  return {
    message: "Foto actualizada correctamente.",
    user: updatedUser,
  };
}

export async function getProfile({ userId }) {
  const user = await findUserById(userId);

  if (!user) {
    throw new Error("Usuario no encontrado.");
  }

  return { user };
}

export async function updateProfilePhoto({ userId, foto }) {
  if (!foto || typeof foto !== "string") {
    throw new Error("La foto es obligatoria.");
  }

  if (!foto.startsWith("data:image/")) {
    throw new Error("El archivo debe ser una imagen válida.");
  }

  if (foto.length > 2_000_000) {
    throw new Error("La imagen es demasiado grande.");
  }

  const updatedUser = await updateUserPhotoById(userId, foto);

  if (!updatedUser) {
    throw new Error("Usuario no encontrado.");
  }

  return {
    message: "Foto actualizada correctamente.",
    user: updatedUser,
  };
}