CREATE TABLE IF NOT EXISTS chat_mensajes (
  id SERIAL PRIMARY KEY,
  canal VARCHAR(40) NOT NULL,
  usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  tipo VARCHAR(20) NOT NULL DEFAULT 'usuario',
  mensaje TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_mensajes_canal_created_at
ON chat_mensajes (canal, created_at);

CREATE INDEX IF NOT EXISTS idx_chat_mensajes_created_at
ON chat_mensajes (created_at);