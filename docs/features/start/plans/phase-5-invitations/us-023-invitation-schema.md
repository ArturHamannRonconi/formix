# US-023: Schema MongoDB — Invitations

## Metadados

| Campo | Valor |
|---|---|
| **Feature** | Fase 5: Convites |
| **Status** | Pendente |
| **Depende de** | US-016 (Schemas Users/Memberships — já implementados) |
| **Bloqueia** | US-024, US-025, US-026 (usecases de convites) |

## Contexto

Cria o schema Mongoose `invitations`, o `InvitationAggregate` de domínio, o repositório e o módulo NestJS. O convite guarda email do convidado, token (hash SHA-256), role, status e expiração. O token é armazenado como hash — nunca em plain text. Segue o mesmo padrão dos tokens de autenticação já implementados.

## Arquivos

### Criar

| Arquivo | Descrição |
|---|---|
| `formix-backend/src/modules/invitations/domain/aggregate/value-objects/invitation-id.vo.ts` | `InvitationId`: `create()`, `from(value)`, `getValue()`, `equals()` |
| `formix-backend/src/modules/invitations/domain/aggregate/value-objects/invitation-status.vo.ts` | Enum: `pending`, `accepted`, `expired`. Método `isPending()`, `isAccepted()` |
| `formix-backend/src/modules/invitations/domain/aggregate/invitation.aggregate.ts` | Props: `id`, `organizationId`, `email`, `tokenHash`, `role ('member')`, `status (InvitationStatus)`, `expiresAt`, `createdAt`. Métodos: `create(input)` gera tokenHash + expiresAt, `accept()`, `expire()`, `cancel()`, `isExpired()`, `isPending()`. Expõe `rawToken` apenas na criação |
| `formix-backend/src/modules/invitations/domain/aggregate/invitation.aggregate.spec.ts` | Testa: create gera hash do token, accept muda status, isExpired verifica data, cancel invalida convite |
| `formix-backend/src/modules/invitations/domain/repositories/invitation.repository.ts` | Interface `IInvitationRepository`: `save`, `findById`, `findByTokenHash`, `findByOrganizationId`, `findPendingByEmailAndOrg`, `delete` |
| `formix-backend/src/modules/invitations/infra/schemas/invitation.schema.ts` | Schema Mongoose: `_id`, `organizationId`, `email`, `tokenHash`, `role`, `status`, `expiresAt`, `createdAt`. Índices: `{ tokenHash: 1 }` unique, `{ organizationId: 1, email: 1, status: 1 }`, `{ expiresAt: 1 }` TTL (para limpeza automática de expirados) |
| `formix-backend/src/modules/invitations/infra/repositories/mongo-invitation.repository.ts` | Implementação Mongoose de `IInvitationRepository` |
| `formix-backend/src/modules/invitations/infra/repositories/mongo-invitation.repository.test.ts` | Testes de integração: save, findByTokenHash, findPendingByEmailAndOrg |
| `formix-backend/src/modules/invitations/invitations.module.ts` | Módulo NestJS: registra schema, repositório, exporta `IInvitationRepository` |

## Passos de Implementação (TDD)

1. [impl] `invitation-id.vo.ts` + `invitation-status.vo.ts`
2. [teste] `invitation.aggregate.spec.ts` — Red
3. [impl] `invitation.aggregate.ts` — Green
4. [impl] `invitation.repository.ts` — interface
5. [impl] `invitation.schema.ts` — schema Mongoose
6. [teste] `mongo-invitation.repository.test.ts` — Red
7. [impl] `mongo-invitation.repository.ts` — Green
8. [impl] `invitations.module.ts`

## Critérios de Aceitação

- [ ] `InvitationAggregate.create()` gera token raw + hash SHA-256 + expiresAt
- [ ] `rawToken` só acessível no momento da criação
- [ ] `accept()`, `expire()`, `cancel()` mudam o status corretamente
- [ ] `isExpired()` verifica `expiresAt < new Date()`
- [ ] Schema tem índice TTL em `expiresAt`
- [ ] `findByTokenHash` busca pelo hash (nunca pelo token bruto)
- [ ] `findPendingByEmailAndOrg` encontra convites pendentes por email + org
- [ ] Todos os `.spec.ts` passam
- [ ] Todos os `.test.ts` passam
- [ ] `npm run typecheck` passa

## Próximas USs

- **US-024** — Criar Convite Backend
- **US-025** — Aceitar Convite Backend
- **US-026** — Listar/Reenviar/Cancelar Backend
