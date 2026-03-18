# US-025: Aceitar Convite — Backend

## Metadados

| Campo | Valor |
|---|---|
| **Feature** | Fase 5: Convites |
| **Status** | Pendente |
| **Depende de** | US-023 (Schema Invitations) |
| **Bloqueia** | US-028 (Tela de Aceite Frontend) |

## Contexto

Implementa `POST /invitations/accept`. Rota pública (sem auth). Valida o token, identifica se o convidado já tem conta, cria User + Membership (se não tem conta) ou apenas Membership (se já tem). Marca convite como aceito e retorna tokens de acesso para login automático.

## Arquivos

### Criar

| Arquivo | Descrição |
|---|---|
| `formix-backend/src/modules/invitations/domain/usecases/accept-invitation.usecase.ts` | Input: `{ token, name?, password? }`. Calcula hash do token. Busca convite por hash. Valida: pendente + não expirado. Busca user por email do convite. Se não tem conta: `name` e `password` obrigatórios — cria User. Cria Membership `{ userId, organizationId, role }`. Chama `invitation.accept()`. Salva convite. Gera tokens (access + refresh). Retorna `Output.ok({ accessToken, refreshToken, userId, organizationId })` |
| `formix-backend/src/modules/invitations/domain/usecases/accept-invitation.usecase.spec.ts` | Testa: aceitar com conta existente, aceitar sem conta (cria user), token inválido, token expirado, convite já aceito, name/password obrigatórios se sem conta |
| `formix-backend/src/modules/invitations/infra/controllers/accept-invitation.dto.ts` | `{ token: string, name?: string, password?: string }` com `@ApiProperty` |

### Modificar

| Arquivo | O que muda |
|---|---|
| `formix-backend/src/modules/invitations/infra/controllers/invitations.controller.ts` | Adicionar `POST /invitations/accept` com `@Public()` |
| `formix-backend/src/modules/invitations/infra/controllers/invitations.controller.test.ts` | Adicionar testes para POST /invitations/accept |
| `formix-backend/src/modules/invitations/invitations.module.ts` | Adicionar `AcceptInvitationUseCase` |

## Fluxo de Aceite

```
1. hash(token) → busca invitation por tokenHash
2. Valida invitation.isPending() && !invitation.isExpired()
3. Busca user por invitation.email
4. Se user NÃO existe:
   - Valida name e password presentes no body
   - Cria User (emailConfirmed=true — vindo de convite já confirma)
   - Cria RefreshToken
5. Se user EXISTE:
   - Apenas adiciona Membership
6. Cria Membership { userId, organizationId: invitation.organizationId, role: invitation.role }
7. invitation.accept()
8. Salva invitation + user
9. Gera accessToken + refreshToken
10. Retorna tokens
```

## Passos de Implementação (TDD)

1. [teste] `accept-invitation.usecase.spec.ts` — Red
2. [impl] `accept-invitation.usecase.ts` — Green
3. [impl] `accept-invitation.dto.ts`
4. [teste] Expandir `invitations.controller.test.ts` com POST /accept
5. [impl] Adicionar handler ao `invitations.controller.ts`
6. Atualizar `invitations.module.ts`

## Critérios de Aceitação

- [ ] `POST /invitations/accept` com token válido e user existente cria Membership e retorna tokens
- [ ] `POST /invitations/accept` sem conta cria User (emailConfirmed=true) + Membership + retorna tokens
- [ ] Token inválido retorna 400
- [ ] Token expirado retorna 400
- [ ] Convite já aceito retorna 400
- [ ] `name` e `password` obrigatórios se user não tem conta — retorna 400 se ausentes
- [ ] Token de convite não pode ser reutilizado
- [ ] Rota é pública (`@Public()`)
- [ ] Usecases retornam `Output<T>` — nenhum `throw` interno
- [ ] Todos os `.spec.ts` passam
- [ ] Todos os `.test.ts` passam
- [ ] `npm run typecheck` passa
- [ ] Swagger documenta o endpoint

## Próximas USs

- **US-028** — Tela de Aceite Frontend
