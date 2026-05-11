import { db } from "../config/db.js";

export async function findSupervisors() {
  const result = await db.query(`
    SELECT id, nombre, apellido, email, foto
    FROM usuarios
    WHERE rol = 'supervisor'
      AND estado_cuenta = 'activo'
    ORDER BY nombre ASC, apellido ASC
  `);

  return result.rows;
}

export async function updateUserSupervisor({ userId, supervisorId }) {
  const result = await db.query(
    `
      UPDATE usuarios
      SET supervisor_id = $1
      WHERE id = $2
        AND rol = 'empleado'
      RETURNING id, email, nombre, apellido, rol, estado_cuenta, supervisor_id, foto
    `,
    [supervisorId, userId]
  );

  return result.rows[0] || null;
}