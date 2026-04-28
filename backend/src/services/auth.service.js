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
} from "../repositories/auth.repository.js";

import { hashPassword, comparePassword } from "../utils/password.js";
import { generateRandomToken } from "../utils/token.js";
import { signAccessToken } from "../utils/jwt.js";
import { mailTransporter } from "../config/mail.js";
import { env } from "../config/env.js";

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
  await Promise.race([
    mailTransporter.sendMail({
      from: env.emailUser,
      to: normalizedEmail,
      subject: "Código de verificación - Website Asientos",
      text: `Tu código de verificación es: ${token}\n\nEste código vence en 15 minutos.`,
    }),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout mail")), 5000)
    ),
  ]);
} catch (error) {
  console.error("Error enviando mail:", error);

  throw new Error(
    "No se pudo enviar el email de verificación. Revisá EMAIL_USER y EMAIL_PASS en Render."
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

  await mailTransporter.sendMail({
    from: env.emailUser,
    to: normalizedEmail,
    subject: "Restablecer contraseña - Website Asientos",
    text: `
Tu token para restablecer la contraseña es: ${token}

Este token vence en 15 minutos.
    `.trim(),
  });

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