// ============================================================
// Sartec Papelaria — Atualizar status do pipeline
// PUT /api/update-status  { phone, pipelineStatus, clientType? }
// ============================================================

import Redis from "ioredis";

let redisClient = null;

function getRedis() {
  if (!redisClient) {
    redisClient = new Redis(process.env.REDIS_URL, {
      connectTimeout: 5000,
      maxRetriesPerRequest: 2,
    });
    redisClient.on("error", (err) => console.error("[Redis/update-status] ❌", err.message));
  }
  return redisClient;
}

const SESSION_TTL = 60 * 60 * 48;

const VALID_PF = ["novo", "em_atendimento", "orcamento_enviado", "confirmado", "finalizado"];
const VALID_PJ = ["novo", "cadastro", "em_cotacao", "proposta_enviada", "confirmado", "entregue"];

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { phone, pipelineStatus, clientType } = req.body || {};

  if (!phone || !pipelineStatus) {
    return res.status(400).json({ error: "Campos phone e pipelineStatus são obrigatórios" });
  }

  const type  = clientType || "pf";
  const valid = type === "pj" ? VALID_PJ : VALID_PF;

  if (!valid.includes(pipelineStatus)) {
    return res.status(400).json({
      error: `pipelineStatus inválido para clientType "${type}"`,
      valid,
    });
  }

  try {
    const redis   = getRedis();
    const raw     = await redis.get(`sartec:${phone}`);

    if (!raw) {
      return res.status(404).json({ error: "Conversa não encontrada" });
    }

    const session          = JSON.parse(raw);
    const prevStatus       = session.status;

    session.pipelineStatus = pipelineStatus;
    session.clientType     = type;

    // Reabrir: se estava resolvido/triagem_incompleta e voltou ao pipeline ativo
    if (
      (prevStatus === "resolvido" || prevStatus === "triagem_incompleta") &&
      pipelineStatus !== "resolvido"
    ) {
      session.status = "aguardando_humano";
      session.resolvedAt = null;
      console.log(`[update-status] 🔄 Reabertura: +${phone}`);
    }

    await redis.set(`sartec:${phone}`, JSON.stringify(session), "EX", SESSION_TTL);

    console.log(`[update-status] ✅ +${phone} → ${pipelineStatus} (${type})`);
    return res.status(200).json({
      success: true,
      pipelineStatus,
      clientType: type,
      status: session.status,
    });
  } catch (err) {
    console.error("[update-status] ❌", err.message);
    return res.status(500).json({ error: "Erro ao atualizar status", detail: err.message });
  }
}
