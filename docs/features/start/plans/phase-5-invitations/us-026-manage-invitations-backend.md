# US-026: Listar, Reenviar e Cancelar Convites — Backend

## Metadados

| Campo | Valor |
|---|---|
| **Feature** | Fase 5: Convites |
| **Status** | Pendente |
| **Depende de** | US-023 (Schema Invitations), US-024 (Criar Convite — controller já existe) |
| **Bloqueia** | US-027 (Tela de Convites Frontend) |

## Contexto

Completa o CRUD de convites: listagem, reenvio (novo token + nova expiração) e cancelamento. Todas as ações são restritas a admins. Adiciona handlers ao controller de invitations já criado na US-024.

## Arquivos

### Criar

| Arquivo | Descrição |
|---|---|
| `formix-backend/src/modules/invitations/domain/usecases/list-invitations.usecase.ts` | Input: `{ organizationId }`. Retorna todos os convites da org (todos os status). `Output.ok({ invitations: InvitationDto[] })` |
| `formix-backend/src/modules/invitations/domain/usecases/list-invitations.usecase.spec.ts` | Testa: lista convites da org, não retorna convites de outras orgs |
| `formix-backend/src/modules/invitations/domain/usecases/resend-invitation.usecase.ts` | Input: `{ organizationId, invitationId, requestingRole }`. Verifica admin. Busca convite. Gera novo token + nova expiração. Atualiza convite. Envia email. `Output.ok({ resent: true })` |
| `formix-backend/src/modules/invitations/domain/usecases/resend-invitation.usecase.spec.ts` | Testa: reenviar gera novo token e nova expiração, rejeitar se não-admin, rejeitar se convite não existe |
| `formix-backend/src/modules/invitations/domain/usecases/cancel-invitation.usecase.ts` | Input: `{ organizationId, invitationId, requestingRole }`. Verifica admin. Busca convite pendente. Chama `invitation.cancel()`. Salva. `Output.ok({ cancelled: true })` |
| `formix-backend/src/modules/invitations/domain/usecases/cancel-invitation.usecase.spec.ts` | Testa: cancelar convite pendente, rejeitar se não-admin, rejeitar se convite não pendente |

### Modificar

| Arquivo | O que muda |
|---|---|
| `formix-backend/src/modules/invitations/infra/controllers/invitations.controller.ts` | Adicionar: `GET /invitations`, `POST /invitations/:id/resend`, `DELETE /invitations/:id` |
| `formix-backend/src/modules/invitations/infra/controllers/invitations.controller.test.ts` | Adicionar testes para os 3 novos endpoints |
| `formix-backend/src/modules/invitations/invitations.module.ts` | Adicionar 3 novos usecases como providers |

## Resposta de listagem

```json
{
  "invitations": [
    {
      "id": "uuid",
      "email": "usuario@example.com",
      "role": "member",
      "status": "pending",
      "expiresAt": "2026-03-25T10:00:00.000Z",
      "createdAt": "2026-03-18T10:00:00.000Z"
    }
  ]
}
```

## Passos de Implementação (TDD)

1. [teste] `list-invitations.usecase.spec.ts` → [impl] `list-invitations.usecase.ts`
2. [teste] `resend-invitation.usecase.spec.ts` → [impl] `resend-invitation.usecase.ts`
3. [teste] `cancel-invitation.usecase.spec.ts` → [impl] `cancel-invitation.usecase.ts`
4. [teste] Expandir `invitations.controller.test.ts` com GET, POST/:id/resend, DELETE/:id
5. [impl] Adicionar handlers ao `invitations.controller.ts`
6. Atualizar `invitations.module.ts`

## Critérios de Aceitação

- [ ] `GET /invitations` retorna convites da organização do token
- [ ] `POST /invitations/:id/resend` gera novo token e nova expiração
- [ ] `DELETE /invitations/:id` cancela convite pendente
- [ ] Todos os endpoints retornam 403 se requester não é admin
- [ ] Todos os endpoints retornam 404 se convite não existe ou é de outra org
- [ ] Reenvio envia novo email com novo token
- [ ] Cancelamento de convite não-pendente retorna 400
- [ ] Usecases retornam `Output<T>` — nenhum `throw` interno
- [ ] Todos os `.spec.ts` passam
- [ ] Todos os `.test.ts` passam
- [ ] `npm run typecheck` passa
- [ ] Swagger documenta os 3 endpoints

## Próximas USs

- **US-027** — Tela de Convites Frontend
