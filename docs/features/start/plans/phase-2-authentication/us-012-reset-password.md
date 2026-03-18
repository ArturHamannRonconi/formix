# US-012: Reset de Senha — Confirmar

## Metadados

| Campo | Valor |
|---|---|
| **Feature** | Fase 2: Autenticação |
| **Status** | Pendente |
| **Depende de** | US-011 (Forgot password — expande UserAggregate com PasswordResetToken), US-008 (Login — expande UserAggregate com invalidateAllRefreshTokens) |
| **Bloqueia** | US-013 (Password pages) |

## Contexto

Implementa `POST /auth/reset-password`. O usuário envia o token recebido por email e a nova senha. Após validação, a senha é atualizada e todos os refresh tokens do usuário são invalidados, forçando novo login em todos os dispositivos. O token de reset não pode ser reutilizado.

O token de reset está embutido no `UserAggregate` — `userRepo.findByPasswordResetTokenHash(hash)` retorna o user que contém o token. Não existe repositório separado para `PasswordResetToken`.

## Arquivos

### Criar

**Auth Module — Domain — Usecases** — `formix-backend/src/modules/auth/domain/usecases/`

| Arquivo | Descrição |
|---|---|
| `reset-password.usecase.ts` | Input: `{ token, newPassword }`. Calcula SHA-256 do token. Chama `userRepo.findByPasswordResetTokenHash(hash)`. Se `Output.isFailure`: retorna `Output.fail('Invalid or expired token')` (404). Obtém `user.passwordResetToken`. Se `token.wasUsed()`: retorna `Output.fail('Token already used')` (410). Se `token.isExpired()`: retorna `Output.fail('Token expired')` (410). Cria `Password` VO com nova senha (valida complexidade — pode lançar DomainError, capturar e retornar Output.fail). Chama `user.updatePassword(newPassword)`. Chama `user.clearPasswordResetToken()`. Chama `user.invalidateAllRefreshTokens()`. Salva user. Retorna `Output.ok({ success: true })` |
| `reset-password.usecase.spec.ts` | Testa: token válido atualiza senha e invalida refresh tokens e limpa token de reset, token não encontrado retorna falha, token já usado retorna falha, token expirado retorna falha, nova senha fraca retorna falha |

**Auth Module — Infra — DTOs** — `formix-backend/src/modules/auth/infra/controllers/`

| Arquivo | Descrição |
|---|---|
| `reset-password.dto.ts` | Campos: token (string), newPassword (string minLength:8). `@ApiProperty` + validators |

### Modificar

| Arquivo | O que muda |
|---|---|
| `auth.controller.ts` | Adicionar `POST /auth/reset-password` com `@Public()` e tratamento de Output |
| `auth.module.ts` | Adicionar `ResetPasswordUseCase` como provider |
| `auth.controller.test.ts` | Adicionar testes para POST /auth/reset-password |

## Mapeamento Output → HTTP no controller

```typescript
// reset-password
if (output.isFailure) {
  if (output.errorMessage === 'Token already used' || output.errorMessage === 'Token expired')
    throw new GoneException(output.errorMessage);
  if (output.errorMessage === 'Invalid or expired token')
    throw new NotFoundException(output.errorMessage);
  throw new BadRequestException(output.errorMessage);
}
```

## Passos de Implementação (TDD)

1. [teste] `reset-password.usecase.spec.ts` → [impl] `reset-password.usecase.ts`
2. [impl] `reset-password.dto.ts`
3. [teste] Adicionar casos ao `auth.controller.test.ts`
4. [impl] Adicionar `POST /auth/reset-password` ao `auth.controller.ts`
5. Atualizar `auth.module.ts`

## Critérios de Aceitação

- [ ] POST /auth/reset-password com token válido retorna 200 `{ success: true }`
- [ ] Senha do usuário é atualizada no banco
- [ ] Todos os refresh tokens do usuário são invalidados (`invalidateAllRefreshTokens`)
- [ ] Token de reset é limpo do user após uso (`clearPasswordResetToken`)
- [ ] Token não encontrado retorna 404
- [ ] Token já usado retorna 410
- [ ] Token expirado retorna 410
- [ ] Nova senha fraca (não atende critérios) retorna 400
- [ ] Usecases retornam `Output<T>` — nenhum `throw` interno
- [ ] Todos `.spec.ts` passam
- [ ] `auth.controller.test.ts` atualizado passa
- [ ] `npm run typecheck` passa

## Próximas USs

- **US-013** — Password pages (frontend)
