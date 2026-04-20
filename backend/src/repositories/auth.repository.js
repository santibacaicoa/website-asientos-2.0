import { db } from "../config/db.js";

export async function findUserByEmail(email) {
  const query = `
    SELECT id, email, password_hash, nombre, apellido, rol, estado_cuenta, supervisor_id
    FROM usuarios
    WHERE email = $1
    LIMIT 1
  `;

  const result = await db.query(query, [email]);
  return result.rows[0] || null;
}

export async function findVerificationTokenByEmail(email) {
  const query = `
    SELECT id, email, token, nombre, apellido, password_hash, expires_at, created_at
    FROM tokens_verificacion_email
    WHERE email = $1
    ORDER BY created_at DESC
    LIMIT 1
  `;

  const result = await db.query(query, [email]);
  return result.rows[0] || null;
}

export async function findVerificationTokenByEmailAndToken(email, token) {
  const query = `
    SELECT id, email, token, nombre, apellido, password_hash, expires_at, created_at
    FROM tokens_verificacion_email
    WHERE email = $1 AND token = $2
    LIMIT 1
  `;

  const result = await db.query(query, [email, token]);
  return result.rows[0] || null;
}

export async function deleteVerificationTokensByEmail(email) {
  const query = `
    DELETE FROM tokens_verificacion_email
    WHERE email = $1
  `;

  await db.query(query, [email]);
}

export async function createVerificationToken({
  email,
  token,
  nombre,
  apellido,
  passwordHash,
  expiresAt,
}) {
  const query = `
    INSERT INTO tokens_verificacion_email (
      email,
      token,
      nombre,
      apellido,
      password_hash,
      expires_at
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, email, token, nombre, apellido, expires_at, created_at
  `;

  const values = [email, token, nombre, apellido, passwordHash, expiresAt];
  const result = await db.query(query, values);

  return result.rows[0];
}

export async function createUser({
  email,
  passwordHash,
  nombre,
  apellido,
}) {
  const query = `
    INSERT INTO usuarios (
      email,
      password_hash,
      nombre,
      apellido,
      rol,
      estado_cuenta,
      supervisor_id
    )
    VALUES ($1, $2, $3, $4, 'empleado', 'activo', NULL)
    RETURNING id, email, nombre, apellido, rol, estado_cuenta, supervisor_id, created_at
  `;

  const values = [email, passwordHash, nombre, apellido];
  const result = await db.query(query, values);

  return result.rows[0];
}