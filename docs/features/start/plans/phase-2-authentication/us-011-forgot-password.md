# US-011: Reset de Senha — Solicitar

## Metadados

| Campo | Valor |
|---|---|
| **Feature** | Fase 2: Autenticação |
| **Status** | Pendente |
| **Depende de** | US-004 (Signup — cria usuários), US-014 (JWT Guard) |
| **Bloqueia** | US-012 (Reset password), US-013 (Password pages) |

## Contexto

Implementa `POST /auth/forgot-password`. O usuário informa o email e, se existir conta, recebe um link com token temporário para redefinir a senha. Por segurança, a resposta é idêntica independentemente de o email existir ou não — nunca revela se um email está cadastrado.

O `PasswordResetToken` é estado do `UserAggregate` — não existe coleção separada no banco. Esta US cria a `PasswordResetTokenEntity`, o `PasswordResetTokenId` VO e expande o `UserAggregate` e `IUserRepository` para suportar o token de reset.

## Arquivos

### Criar

**Users Module — Domain — Value Objects** — `formix-backend/src/modules/users/domain/aggregate/value-objects/`

| Arquivo | Descrição |
|---|---|
| `password-reset-token-id.vo.ts` | `PasswordResetTokenId` com `create()`, `from(value)`, `getValue()`, `equals()` |

**Users Module — Domain — Entities** — `formix-backend/src/modules/users/domain/aggregate/entities/`

| Arquivo | Descrição |
|---|---|
| `password-reset-token.entity.ts` | Props: id (`PasswordResetTokenId`), tokenHash (string), usedAt (Date \| null), expiresAt (Date), createdAt (Date). `create(expiresInMs)` gera rawToken (UUID) + SHA-256 hash. `markAsUsed()`. `isExpired()`. `wasUsed()`. `reconstitute()`. Expõe `rawToken` só na criação. Sem `userId` (implícito no aggregate) |
| `password-reset-token.entity.spec.ts` | Testa: create gera tokenHash (SHA-256), rawToken disponível só após create, markAsUsed define usedAt, isExpired, wasUsed, reconstitute mantém dados |

**Auth Module — Domain — Usecases** — `formix-backend/src/modules/auth/domain/usecases/`

| Arquivo | Descrição |
|---|---|
| `forgot-password.usecase.ts` | Input: `{ email }`. Chama `userRepo.findByEmail(email)`. Se `Output.isFailure`: retorna `Output.ok({ success: true })` (silencioso — não revela existência). Se `user.emailConfirmed === false`: retorna `Output.ok({ success: true })` (silencioso). Cria `PasswordResetTokenEntity.create(expiresInMs)`. Chama `user.setPasswordResetToken(newToken)`. Salva user. Envia email (PASSWORD_RESET template com `{ name, resetUrl: APP_URL + '/reset-password?token=...' }`). Retorna `Output.ok({ success: true })` |
| `forgot-password.usecase.spec.ts` | Testa: email existente cria token e envia email, email inexistente retorna sucesso silencioso, `userRepo.save` chamado com user atualizado, token anterior é substituído (setPasswordResetToken sobrescreve) |

**Auth Module — Infra — DTOs** — `formix-backend/src/modules/auth/infra/controllers/`

| Arquivo | Descrição |
|---|---|
| `forgot-password.dto.ts` | Campo: email (string). `@ApiProperty` + `@IsEmail()` |

### Modificar

**Users Module** — expande UserAggregate, UserSchema, IUserRepository, MongoUserRepository

| Arquivo | O que muda |
|---|---|
| `user.aggregate.ts` | Adicionar `passwordResetToken: PasswordResetTokenEntity \| null` nas props. Adicionar métodos: `setPasswordResetToken(token)`, `clearPasswordResetToken()` |
| `user.aggregate.spec.ts` | Adicionar testes para os novos métodos |
| `user.schema.ts` | Adicionar subdocumento `PasswordResetTokenSubSchema` e campo `passwordResetToken: PasswordResetTokenSubSchema \| null` |
| `user.repository.ts` | Adicionar `findByPasswordResetTokenHash(hash: string): Promise<Output<User>>` |
| `mongo-user.repository.ts` | Implementar novo finder, mapear `passwordResetToken` no `toDocument` e `toEntity` |
| `mongo-user.repository.test.ts` | Adicionar testes para o novo finder e persistência de passwordResetToken |

**Auth Module**

| Arquivo | O que muda |
|---|---|
| `auth.controller.ts` | Adicionar `POST /auth/forgot-password` com `@Public()` e tratamento de Output |
| `auth.module.ts` | Adicionar `ForgotPasswordUseCase` como provider. Adicionar `PASSWORD_RESET_EXPIRES_IN_MS` como provider de config |
| `auth.controller.test.ts` | Adicionar testes para POST /auth/forgot-password |

## Mapeamento Output → HTTP no controller

```typescript
// forgot-password — sempre 200 (silencioso)
if (output.isFailure) throw new BadRequestException(output.errorMessage);
return output.value;
```

## Passos de Implementação (TDD)

1. [impl] `password-reset-token-id.vo.ts`
2. [teste] `password-reset-token.entity.spec.ts` → [impl] `password-reset-token.entity.ts`
3. [impl] Expandir `user.aggregate.ts` com novos métodos + testes no `.spec.ts`
4. [impl] Expandir `user.schema.ts` com `PasswordResetTokenSubSchema`
5. [impl] Expandir `user.repository.ts` com `findByPasswordResetTokenHash`
6. [teste] Expandir `mongo-user.repository.test.ts` → [impl] `mongo-user.repository.ts`
7. [teste] `forgot-password.usecase.spec.ts` → [impl] `forgot-password.usecase.ts`
8. [impl] `forgot-password.dto.ts`
9. [teste] Adicionar casos ao `auth.controller.test.ts`
10. [impl] Adicionar `POST /auth/forgot-password` ao `auth.controller.ts`
11. Atualizar `auth.module.ts`

## Critérios de Aceitação

- [ ] POST /auth/forgot-password retorna 200 `{ success: true }` independente do email existir
- [ ] Email existente: token criado e email enviado
- [ ] Email inexistente: retorna 200 sem efeito colateral
- [ ] Token de reset salvo embutido no documento do usuário (hash, não plain text)
- [ ] Token anterior é substituído quando novo é gerado
- [ ] Usecases retornam `Output<T>` — nenhum `throw` interno
- [ ] Todos `.spec.ts` passam
- [ ] Todos `.test.ts` passam
- [ ] `npm run typecheck` passa

## Próximas USs

- **US-012** — Reset password (usa PasswordResetToken criado aqui)
- **US-013** — Password pages (frontend)
