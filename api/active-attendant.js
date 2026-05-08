// ============================================================
// Sartec Papelaria — Registrar atendente ativo na conversa
// POST /api/active-attendant  { phone, attendant: { id, name, initials, color } }
// ============================================================

import Redis from "ioredis";

let redisClient = null;

const SESSION_TTL = 60 * 60 * 24 * 30; // 30 dias — alinhado com projeto

function getRedis() {
  if (!redisClient) {
    redisClient = new Redis(process.env.REDIS_URL, {
      connectTimeout: 5000,
      maxRetriesPerRequest: 2,
    });
    redisClient.on("error", (err) => console.error("[Redis/active-attendant] ❌", err.message));
  }
  return redisClient;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { phone, attendant } = req.body || {};

  if (!phone)               return res.status(400).json({ error: "Campo phone obrigatório" });
  if (!attendant?.id)       return res.status(400).json({ error: "Campo attendant.id obrigatório" });
  if (!attendant?.name)     return res.status(400).json({ error: "Campo attendant.name obrigatório" });

  try {
    const redis = getRedis();
    const raw   = await redis.get(`sartec:${phone}`);

    if (!raw) return res.status(404).json({ error: "Conversa não encontrada" });

    const session = JSON.parse(raw);

    session.activeAttendant   = {
      id:       attendant.id,
      name:     attendant.name,
      initials: attendant.initials || attendant.name.slice(0, 2).toUpperCase(),
      color:    attendant.color    || "#3b82f6",
    };
    session.activeAttendantAt = new Date().toISOString();

    await redis.set(`sartec:${phone}`, JSON.stringify(session), "EX", SESSION_TTL);

    console.log(`[active-attendant] ✅ +${phone} → ${attendant.name}`);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("[active-attendant] ❌", err.message);
    return res.status(500).json({ error: "Erro ao registrar atendente", detail: err.message });
  }
}
