# Sartec — WhatsApp Webhook + Agente IA

## Variáveis de ambiente

Crie `.env.local` na raiz (nunca suba para o git):

```env
WHATSAPP_VERIFY_TOKEN=sartec_webhook_token_2024
WHATSAPP_ACCESS_TOKEN=SEU_ACCESS_TOKEN_AQUI
WHATSAPP_PHONE_NUMBER_ID=SEU_PHONE_NUMBER_ID_AQUI
ANTHROPIC_API_KEY=sk-ant-...
```

Na Vercel: **Settings → Environment Variables**

---

## Estrutura

```
/
├── api/
│   └── webhook.js   ← webhook + agente integrados
├── vercel.json
└── package.json
```

---

## package.json necessário

```json
{
  "type": "module",
  "dependencies": {
    "@anthropic-ai/sdk": "^0.39.0"
  }
}
```

---

## Fluxo completo

```
Cliente manda msg no WhatsApp
  → Meta POST /api/webhook
    → Extrai phone + texto
    → getConversation(phone)     ← cria sessão se não existir
    → chatWithAgent(phone, text)
        → verifica estado handoff
        → chama Claude (Haiku) com histórico
        → retorna resposta do agente
    → sendTextMessage(phone, resposta)
        → POST graph.facebook.com/messages
    → res.status(200)
```

---

## Próximos passos

- [ ] Persistir conversas em Vercel KV ou Redis (hoje reseta em cold start)
- [ ] Suporte a áudio → speech-to-text → texto → agente
- [ ] Suporte a imagem → leitura de lista escolar via Claude Vision
- [ ] Integrar CRM: criar lead no HubSpot quando handoff for detectado

---

> **Última atualização:** 2026-05-04
