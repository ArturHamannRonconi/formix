# Arquitetura — Visão Geral

## Stack

```
Next.js/React ──▶ NestJS (DDD, 7 módulos) ──▶ MongoDB
```

## Multi-tenancy

Isolamento por organização (`organizationId`). Toda query filtra por org. Um usuário pode pertencer a múltiplas orgs via Membership (embutida no OrganizationAggregate).

## Fluxos principais

| Fluxo | Passos |
|---|---|
| Signup | User + Organization + Membership(admin) + email de confirmação |
| Convite | Admin cria invitation → email → membro aceita → User + Membership(member) |
| Formulário | Criar form + perguntas → publicar (gera publicToken) → compartilhar link |
| Resposta | Acessa link → verifica duplicidade (hash) → salva resposta (anônima) + hash separado |
| Analytics | Seleciona form → backend agrega → dashboard |

## Segurança

- JWT para autenticação (access token curto + refresh token longo com rotation)
- Tokens de convite e reset de senha com expiração
- Emails hashados (SHA-256) para controle de duplicidade
- Respostas sem vínculo de identidade — impossível rastrear respondente
