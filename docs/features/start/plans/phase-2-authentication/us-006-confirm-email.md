# US-006: Confirmação de Email

## Metadados

| Campo | Valor |
|---|---|
| **Feature** | Fase 2: Autenticação |
| **Status** | Pendente |
| **Depende de** | US-004 (Signup — salva EmailConfirmationToken no User), US-014 (JWT Guard) |
| **Bloqueia** | US-007 (Confirm email page), US-008 (Login — exige emailConfirmed) |

## Contexto

Implementa a confirmação de email após signup. O usuário clica no link com o token enviado por email. O endpoint busca o usuário pelo hash do token (via `IUserRepository`), valida a expiração, confirma o email e salva o usuário. O token é apagado automaticamente por `user.confirmEmail()`.

O `EmailConfirmationTokenEntity` já existe embutido no `UserAggregate` desde a US-004. Não há repositório separado — toda persistência passa pelo `IUserRepository`.

## Arquivos

### Criar

**Auth Module — Domain — Usecases** — `formix-backend/src/modules/auth/domain/usecases/`

| Arquivo | Descrição |
|---|---|
| `confirm-email.usecase.ts` | Input: `{ token }`. Calcula SHA-256 do token recebido. Chama `userRepo.findByEmailConfirmationTokenHash(hash)`. Se `Output.isFailure`: retorna `Output.fail('Invalid or expired token')` (404). Verifica `user.emailConfirmationToken!.isExpired()` → retorna `Output.fail('Token expired')` (410). Chama `user.confirmEmail()` (confirma email e limpa o token). Salva user via `userRepo.save(user)`. Retorna `Output.ok({ success: true })` |
| `confirm-email.usecase.spec.ts` | Testa: token válido confirma user e limpa token, user não encontrado retorna falha, token expirado retorna falha, `userRepo.save` chamado com user atualizado |
| `resend-confirmation.usecase.ts` | Input: `{ email }`. Busca user por email (`userRepo.findByEmail`). Se não encontrar: retorna `Output.ok({ success: true })` (silencioso). Se `user.emailConfirmed`: retorna `Output.ok({ success: true })` (silencioso). Cria novo `EmailConfirmationTokenEntity`. Chama `user.setEmailConfirmationToken(newToken)`. Salva user. Envia email. Retorna `Output.ok({ success: true })` |
| `resend-confirmation.usecase.spec.ts` | Testa: email válido reenvia, email não encontrado retorna sucesso silencioso, já confirmado retorna sucesso silencioso |

**Auth Module — Infra — DTOs** — `formix-backend/src/modules/auth/infra/controllers/`

| Arquivo | Descrição |
|---|---|
| `confirm-email.dto.ts` | Campo: token (string). `@ApiProperty` + `@IsString()` |
| `resend-confirmation.dto.ts` | Campo: email (string). `@ApiProperty` + `@IsEmail()` |

### Modificar

| Arquivo | O que muda |
|---|---|
| `auth.controller.ts` | Adicionar `POST /auth/confirm-email` (`@Public()`) e `POST /auth/resend-confirmation` (`@Public()`) com tratamento de `Output` |
| `auth.module.ts` | Adicionar `ConfirmEmailUseCase` e `ResendConfirmationUseCase` como providers |
| `auth.controller.test.ts` | Adicionar testes para os dois novos endpoints |

## Mapeamento Output → HTTP no controller

```typescript
// confirm-email: 404 se token não encontrado, 410 se expirado
if (output.isFailure) {
  if (output.errorMessage === 'Token expired') throw new GoneException(output.errorMessage);
  throw new NotFoundException(output.errorMessage);
}
```

## Passos de Implementação (TDD)

1. [teste] `confirm-email.usecase.spec.ts` → [impl] `confirm-email.usecase.ts`
2. [teste] `resend-confirmation.usecase.spec.ts` → [impl] `resend-confirmation.usecase.ts`
3. [impl] `confirm-email.dto.ts` + `resend-confirmation.dto.ts`
4. [teste] Adicionar casos de teste ao `auth.controller.test.ts`
5. [impl] Adicionar endpoints ao `auth.controller.ts`
6. Atualizar `auth.module.ts` com novos usecases

## Critérios de Aceitação

- [ ] POST /auth/confirm-email com token válido retorna 200 `{ success: true }`
- [ ] POST /auth/confirm-email com token inexistente retorna 404
- [ ] POST /auth/confirm-email com token expirado retorna 410
- [ ] POST /auth/resend-confirmation reenvia email e retorna 200
- [ ] POST /auth/resend-confirmation com email não cadastrado retorna 200 (silencioso)
- [ ] `user.emailConfirmed` é `true` após confirmação
- [ ] `user.emailConfirmationToken` é `null` após confirmação
- [ ] Usecases retornam `Output<T>` — nenhum `throw` interno
- [ ] Todos `.spec.ts` passam
- [ ] `auth.controller.test.ts` passa
- [ ] `npm run typecheck` passa

## Próximas USs

- **US-007** — Confirm email page (frontend)
- **US-008** — Login (verifica emailConfirmed)
