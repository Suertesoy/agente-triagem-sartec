# PROJECT_CONTEXT — Sartec CRM

Este projeto é um CRM interno com agente de IA para atendimento via WhatsApp da Sartec Papelaria.

Arquitetura:
Node.js serverless na Vercel
Redis via ioredis
WhatsApp Cloud API
Anthropic Claude
Frontend em HTML, CSS e JavaScript puro

Arquivos principais:
api/webhook.js: recebe mensagens do WhatsApp, chama o agente, salva sessão e controla handoff
api/send.js: envia mensagens humanas, imagens e documentos
api/send-template.js: envia templates aprovados do WhatsApp
api/queue.js: alimenta o pipeline PF/PJ
api/conversations.js: lista conversas ativas e arquivadas
api/conversation.js: carrega histórico completo
api/update-card.js: edita dados do card
api/update-status.js: altera status do pipeline
api/resolve.js: marca conversa como resolvida
api/archive.js: arquiva histórico
painel/index.html: CRM visual
painel/login.html: tela de acesso

Regras de trabalho:
Sempre ler AGENT_RULES.md antes de sugerir alterações
Fazer mudanças mínimas e incrementais
Não trocar a stack
Não refatorar tudo sem necessidade
Preservar a estrutura das sessões Redis
Não quebrar webhook, envio de mensagem, templates ou janela de 24h
Antes de alterar código, explicar o que será feito e quais arquivos serão modificados
Não sugerir comandos de Git se o usuário não pedir

Prioridades:
Estabilidade
Clareza do atendimento
UX do CRM
Performance
Novas funcionalidades apenas depois de validar impacto

Pontos sensíveis:
Existem TTLs diferentes em alguns arquivos. Verificar antes de alterar
A sessão Redis é o coração do sistema
O painel usa polling, então alterações de renderização precisam evitar conflito com edição inline
A janela de 24h do WhatsApp precisa ser respeitada
Templates são obrigatórios quando a janela está fechada

Objetivo do produto:
Ajudar a Sartec a organizar atendimentos PF e PJ, reduzir perda de mensagens no WhatsApp, facilitar triagem com IA e dar contexto para o atendimento humano

## SITE PÚBLICO — CONTEXTO E OBJETIVO

O site da Sartec não é um e-commerce.

Ele funciona como:

vitrine de produtos
canal de entrada de leads
ponte direta para o WhatsApp
suporte ao CRM interno

Objetivo principal:
Levar o usuário a entrar em contato via WhatsApp de forma rápida e natural.

POSICIONAMENTO

A Sartec deve ser percebida como:

papelaria de bairro consolidada
com variedade de produtos
atendimento próximo e humano
solução prática para o dia a dia
ESTRATÉGIA DA HOME

A home NÃO deve ser centrada apenas em lista escolar.

A narrativa principal é:

"temos produtos, variedade e atendimento rápido"

A lista escolar é:

uma funcionalidade importante
mas sazonal
não define a identidade do site
PAPEL DAS PÁGINAS

Home:

apresentar a loja
destacar produtos
direcionar para WhatsApp

Produtos:

gerar desejo
incentivar contato via WhatsApp

Lista Escolar:

fluxo funcional específico (upload + envio)
foco em conversão em época sazonal

Cópias:

serviço com canal dedicado

Empresas:

fluxo B2B com cadastro e pedido estruturado
REGRA DE UX IMPORTANTE

Sempre priorizar:

clareza
rapidez de ação
acesso fácil ao WhatsApp
navegação simples no mobile

Evitar:

excesso de informação
fluxos complexos
decisões que afastem o usuário do contato