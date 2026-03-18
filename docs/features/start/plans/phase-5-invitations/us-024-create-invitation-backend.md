# US-024: Criar Convite — Backend

## Metadados

| Campo | Valor |
|---|---|
| **Feature** | Fase 5: Convites |
| **Status** | Pendente |
| **Depende de** | US-023 (Schema Invitations) |
| **Bloqueia** | US-027 (Tela de Convites Frontend) |

## Contexto

Implementa `POST /invitations`. Apenas admins podem criar convites. Valida que não existe convite pendente para o mesmo email na mesma org e que o email ainda não é membro. Gera token único, salva convite e envia email com link de aceite contendo o token raw.

## Arquivos

### Criar

| Arquivo | Descrição |
|---|---|
| `formix-backend/src/modules/invitations/domain/usecases/create-invitation.usecase.ts` | Input: `{ organizationId, requestingUserId, requestingRole, email, role? }`. Verifica role admin. Verifica email não é membro (`IMembershipRepository.findByUserEmailAndOrg`). Verifica não existe pendente (`IInvitationRepository.findPendingByEmailAndOrg`). Cria `InvitationAggregate`. Salva. Envia email via `IEmailService`. Retorna `Output.ok({ invitationId })` |
| `formix-backend/src/modules/invitations/domain/usecases/create-invitation.usecase.spec.ts` | Testa: criar convite com sucesso, rejeitar se não-admin, rejeitar se email já é membro, rejeitar se já existe convite pendente |
| `formix-backend/src/modules/invitations/infra/controllers/invitations.controller.ts` | `POST /invitations`. `@Roles('admin')`. Swagger: `@ApiTags('invitations')`, `@ApiBearerAuth()` |
| `formix-backend/src/modules/invitations/infra/controllers/invitations.controller.test.ts` | Testes de integração para POST /invitations |
| `formix-backend/src/modules/invitations/infra/controllers/create-invitation.dto.ts` | `{ email: string, role?: 'member' }` com `@IsEmail()`, `@ApiProperty` |

### Modificar

| Arquivo | O que muda |
|---|---|
| `formix-backend/src/modules/invitations/invitations.module.ts` | Adicionar `CreateInvitationUseCase`, `InvitationsController`. Importar `UsersModule`, `OrganizationsModule` para repositórios |

## Email de Convite

Template: `invitation`. Dados: `{ inviteeName: email, organizationName, inviteLink: APP_URL/invite?token=<rawToken> }`.

## Passos de Implementação (TDD)

1. [teste] `create-invitation.usecase.spec.ts` — Red
2. [impl] `create-invitation.usecase.ts` — Green
3. [impl] `create-invitation.dto.ts`
4. [teste] `invitations.controller.test.ts` — Red (POST)
5. [impl] `invitations.controller.ts` — Green
6. Atualizar `invitations.module.ts`

## Critérios de Aceitação

- [ ] `POST /invitations` com `{ email }` cria convite e envia email
- [ ] Retorna 403 se requester não é admin
- [ ] Retorna 409 se convite pendente já existe para este email na org
- [ ] Retorna 409 se email já é membro da organização
- [ ] Token armazenado como hash SHA-256 (não plain text)
- [ ] Email enviado com link `APP_URL/invite?token=<rawToken>`
- [ ] Usecases retornam `Output<T>` — nenhum `throw` interno
- [ ] Todos os `.spec.ts` passam
- [ ] Todos os `.test.ts` passam
- [ ] `npm run typecheck` passa
- [ ] Swagger documenta o endpoint

## Próximas USs

- **US-027** — Tela de Convites Frontend
