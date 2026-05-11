import { db } from "../config/db.js";

export async function deleteOldChatMessages(days = 30) {
  await db.query(
    `
      DELETE FROM chat_mensajes
      WHERE created_at < NOW() - ($1 || ' days')::INTERVAL
    `,
    [days]
  );
}

export async function findMessagesByChannel(channel) {
  const result = await db.query(
    `
      SELECT
        cm.id,
        cm.canal,
        cm.usuario_id,
        cm.tipo,
        cm.mensaje,
        cm.created_at,
        u.nombre,
        u.apellido,
        u.foto,
        u.rol
      FROM chat_mensajes cm
      LEFT JOIN usuarios u ON u.id = cm.usuario_id
      WHERE cm.canal = $1
      ORDER BY cm.created_at ASC
      LIMIT 100
    `,
    [channel]
  );

  return result.rows;
}

export async function createChatMessage({ channel, userId, type, message }) {
  const result = await db.query(
    `
      INSERT INTO chat_mensajes (
        canal,
        usuario_id,
        tipo,
        mensaje
      )
      VALUES ($1, $2, $3, $4)
      RETURNING id, canal, usuario_id, tipo, mensaje, created_at
    `,
    [channel, userId, type, message]
  );

  return result.rows[0];
}