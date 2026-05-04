// ============================================================
// Sartec Papelaria — Marcar conversa como resolvida + arquivar
// POST /api/resolve  { phone }
// ============================================================

import Redis from "ioredis";
import { archiveSession } from "./archive.js";

let redisClient = null;

function getRedis() {
  if (!redisClient) {
    redisClient = new Redis(process.env.REDIS_URL, {
      connectTimeout: 5000,
      maxRetriesPerRequest: 2,
    });
    redisClient.on("error", (err) => console.error("[Redis/resolve] ❌", err.message));
  }
  return redisClient;
}

const SESSION_TTL = 60 * 60 * 48;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { phone } = req.body || {};

  if (!phone) {
    return res.status(400).json({ error: "Campo phone é obrigatório" });
  }

  try {
    const redis = getRedis();
    const raw   = await redis.get(`sartec:${phone}`);

    if (!raw) {
      return res.status(404).json({ error: "Conversa não encontrada" });
    }

    const session      = JSON.parse(raw);
    session.status     = "resolvido";
    session.resolvedAt = new Date().toISOString();

    await redis.set(`sartec:${phone}`, JSON.stringify(session), "EX", SESSION_TTL);

    // Arquivar em background — não bloqueia a resposta
    archiveSession(phone).catch((err) =>
      console.error("[resolve/archive] ⚠️", err.message)
    );

    console.log(`[resolve] ✅ +${phone} marcado como resolvido`);
    return res.status(200).json({ success: true, resolvedAt: session.resolvedAt });
  } catch (err) {
    console.error("[resolve] ❌", err.message);
    return res.status(500).json({ error: "Erro ao resolver conversa", detail: err.message });
  }
}
