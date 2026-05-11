import { db } from "../config/db.js";

/* =========================================================
   BUSCAR USUARIO POR EMAIL
   Función:
   - Se usa para login, registro y recuperación.
   - Ahora también devuelve foto.
========================================================= */
export async function findUserByEmail(email) {
  const query = `
    SELECT 
      id, 
      email, 
      password_hash, 
      nombre, 
      apellido, 
      rol, 
      estado_cuenta, 
      supervisor_id,
      foto
    FROM usuarios
    WHERE email = $1
    LIMIT 1
  `;

  const result = await db.query(query, [email]);
  return result.rows[0] || null;
}

/* =========================================================
   BUSCAR USUARIO POR ID
   Función:
   - Se usa para obtener perfil del usuario logueado.
========================================================= */
export async function findUserById(userId) {
  const query = `
    SELECT 
      u.id, 
      u.email, 
      u.nombre, 
      u.apellido, 
      u.rol, 
      u.estado_cuenta,
      u.supervisor_id,
      u.foto,
      s.id AS supervisor_id_real,
      s.nombre AS supervisor_nombre,
      s.apellido AS supervisor_apellido,
      s.foto AS supervisor_foto
    FROM usuarios u
    LEFT JOIN usuarios s ON s.id = u.supervisor_id
    WHERE u.id = $1
    LIMIT 1
  `;

  const result = await db.query(query, [userId]);
  return result.rows[0] || null;
}

/* =========================================================
   TOKENS DE VERIFICACIÓN DE EMAIL
========================================================= */
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

/* =========================================================
   CREAR USUARIO
   Función:
   - Crea usuario procesador activo.
   - Internamente el rol sigue siendo "empleado" por compatibilidad.
   - La foto arranca en NULL.
========================================================= */
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
      supervisor_id,
      foto
    )
    VALUES ($1, $2, $3, $4, 'empleado', 'activo', NULL, NULL)
    RETURNING 
      id, 
      email, 
      nombre, 
      apellido, 
      rol, 
      estado_cuenta, 
      supervisor_id, 
      foto,
      created_at
  `;

  const values = [email, passwordHash, nombre, apellido];
  const result = await db.query(query, values);

  return result.rows[0];
}

/* =========================================================
   RESET PASSWORD TOKENS
========================================================= */
export async function deleteResetTokensByUserId(usuarioId) {
  await db.query(
    `DELETE FROM tokens_reset_password WHERE usuario_id = $1`,
    [usuarioId]
  );
}

export async function createResetPasswordToken({ usuarioId, token, expiresAt }) {
  const query = `
    INSERT INTO tokens_reset_password (usuario_id, token, expires_at)
    VALUES ($1, $2, $3)
    RETURNING id, usuario_id, token, expires_at, used_at, created_at
  `;

  const result = await db.query(query, [usuarioId, token, expiresAt]);
  return result.rows[0];
}

export async function findResetPasswordTokenByEmailAndToken(email, token) {
  const query = `
    SELECT 
      trp.id,
      trp.usuario_id,
      trp.token,
      trp.expires_at,
      trp.used_at,
      u.email
    FROM tokens_reset_password trp
    INNER JOIN usuarios u ON u.id = trp.usuario_id
    WHERE u.email = $1 AND trp.token = $2
    LIMIT 1
  `;

  const result = await db.query(query, [email, token]);
  return result.rows[0] || null;
}

export async function updateUserPassword(usuarioId, passwordHash) {
  const query = `
    UPDATE usuarios
    SET password_hash = $1
    WHERE id = $2
    RETURNING id, email
  `;

  const result = await db.query(query, [passwordHash, usuarioId]);
  return result.rows[0];
}

export async function markResetPasswordTokenUsed(tokenId) {
  await db.query(
    `UPDATE tokens_reset_password SET used_at = NOW() WHERE id = $1`,
    [tokenId]
  );
}

/* =========================================================
   FOTO DE PERFIL
   Función:
   - Guarda la foto en la columna usuarios.foto.
   - Devuelve el usuario actualizado.
========================================================= */
export async function updateUserPhotoById(userId, foto) {
  const query = `
    UPDATE usuarios
    SET foto = $1
    WHERE id = $2
    RETURNING 
      id, 
      email, 
      nombre, 
      apellido, 
      rol, 
      estado_cuenta,
      supervisor_id, 
      foto
  `;

  const result = await db.query(query, [foto, userId]);
  return result.rows[0] || null;
}