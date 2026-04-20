import {
  findUserByEmail,
  findVerificationTokenByEmailAndToken,
  deleteVerificationTokensByEmail,
  createVerificationToken,
  createUser,
} from "../repositories/auth.repository.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { generateRandomToken } from "../utils/token.js";
import { signAccessToken } from "../utils/jwt.js";
import { mailTransporter } from "../config/mail.js";
import { env } from "../config/env.js";

export async function registerUser({ email, password, nombre, apellido }) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedNombre = nombre.trim();
  const normalizedApellido = apellido.trim();

  const existingUser = await findUserByEmail(normalizedEmail);

  if (existingUser) {
    throw new Error("Ya existe un usuario registrado con ese email.");
  }

  await deleteVerificationTokensByEmail(normalizedEmail);

  const passwordHash = await hashPassword(password);
  const token = generateRandomToken(16);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 15);

  await createVerificationToken({
    email: normalizedEmail,
    token,
    nombre: normalizedNombre,
    apellido: normalizedApellido,
    passwordHash,
    expiresAt,
  });

  const verifyText = `
Tu token de verificación es: ${token}

Este token vence en 15 minutos.
  `.trim();

  await mailTransporter.sendMail({
    from: env.emailUser,
    to: normalizedEmail,
    subject: "Verificación de cuenta - Website Asientos",
    text: verifyText,
  });

  return {
    message: "Te enviamos un token de verificación por email.",
  };
}

export async function verifyEmailToken({ email, token }) {
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
    throw new Error("Token inválido o email incorrecto.");
  }

  const now = new Date();
  const expiresAt = new Date(verificationRecord.expires_at);

  if (expiresAt < now) {
    throw new Error("El token expiró.");
  }

  const createdUser = await createUser({
    email: verificationRecord.email,
    passwordHash: verificationRecord.password_hash,
    nombre: verificationRecord.nombre,
    apellido: verificationRecord.apellido,
  });

  await deleteVerificationTokensByEmail(normalizedEmail);

  return {
    message: "Cuenta verificada correctamente.",
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