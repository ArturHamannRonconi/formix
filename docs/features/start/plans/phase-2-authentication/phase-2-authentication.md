# Plano: Fase 2 — Autenticação

## Contexto

A Fase 1 estabeleceu a infraestrutura base: backend NestJS + MongoDB, entidades de domínio (User, Organization), value objects (Email, Password), repositórios Mongo e serviço de email. A Fase 2 implementa **autenticação completa**, prerequisito para todas as features protegidas do sistema.

Cobre US-004 a US-015: signup, confirmação de email, login, refresh token rotation, reset de senha, JWT guard e logout — tanto backend quanto frontend.

Ao final de cada US concluída, atualizar `docs/features/progress.md`.

---

## Novos Pacotes a Instalar (Backend)

```bash
npm install @nestjs/passport passport passport-jwt
npm install -D @types/passport-jwt
```

> `@nestjs/jwt` já instalado na US-004.

## Variáveis de Ambiente

```env
JWT_ACCESS_SECRET=
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=
JWT_REFRESH_EXPIRES_IN=7d
EMAIL_CONFIRMATION_EXPIRES_IN=86400000   # 24h em ms
PASSWORD_RESET_EXPIRES_IN=3600000        # 1h em ms
APP_URL=http://localhost:3000
```

> Já adicionadas ao `.env` e `.env.example` na US-004.

---

## Princípio de design: tokens pertencem ao User

Todos os tokens de autenticação são estado do `UserAggregate` — não existem coleções separadas para eles:

| Token | Onde vive | Como é acessado |
|---|---|---|
| `EmailConfirmationTokenEntity` | embutido em `users` (campo `emailConfirmationToken`) | `userRepo.findByEmailConfirmationTokenHash(hash)` |
| `RefreshTokenEntity[]` | embutido em `users` (array `refreshTokens`) | `userRepo.findByRefreshTokenHash(hash)` |
| `PasswordResetTokenEntity` | embutido em `users` (campo `passwordResetToken`) | `userRepo.findByPasswordResetTokenHash(hash)` |

Isso significa que o módulo `auth` **não tem repositórios próprios** — apenas usecases, controller, guards e decorators.

---

## Ordem de Execução

```
US-004 (Signup backend) ✅
    │
    ├──▶ US-014 (JWT Guard)
    │         │
    │         └──▶ US-006 (Confirm Email backend)
    │                   │
    │                   └──▶ US-008 (Login backend)
    │                             │
    │                             ├──▶ US-010 (Refresh Token)
    │                             ├──▶ US-015 (Logout)
    │                             └──▶ US-011 ──▶ US-012 (Password Reset)
    │
US-005 (Signup page)        ← após US-004
US-007 (Confirm Email page) ← após US-006
US-009 (Login page)         ← após US-008
US-013 (Password pages)     ← após US-012
```

---

## Estrutura do Módulo Auth

O módulo `auth` não tem domínio próprio — não há aggregate, entities nem repositórios no auth. Toda persistência é feita via `IUserRepository` e `IOrganizationRepository`.

```
formix-backend/src/modules/auth/
  domain/
    usecases/
      signup.usecase.ts + .spec.ts              ✅ concluído
      confirm-email.usecase.ts + .spec.ts
      resend-confirmation.usecase.ts + .spec.ts
      login.usecase.ts + .spec.ts
      refresh-token.usecase.ts + .spec.ts
      forgot-password.usecase.ts + .spec.ts
      reset-password.usecase.ts + .spec.ts
      logout.usecase.ts + .spec.ts
  infra/
    controllers/
      auth.controller.ts + .test.ts             ✅ concluído (parcial — só signup)
      signup.dto.ts                              ✅ concluído
      signup-response.dto.ts                    ✅ concluído
      confirm-email.dto.ts
      resend-confirmation.dto.ts
      login.dto.ts
      login-response.dto.ts
      refresh-token.dto.ts
      refresh-token-response.dto.ts
      forgot-password.dto.ts
      reset-password.dto.ts
      logout.dto.ts
    guards/
      jwt-auth.guard.ts
    strategies/
      jwt.strategy.ts
    decorators/
      public.decorator.ts
      current-user.decorator.ts
  auth.module.ts                                ✅ concluído
```

## Estrutura de tokens no UserAggregate

Tokens de autenticação ficam embutidos no documento `users`. As entities são definidas em `users/domain/aggregate/`:

```
formix-backend/src/modules/users/domain/aggregate/
  entities/
    email-confirmation-token.entity.ts + .spec.ts    ✅ concluído
    refresh-token.entity.ts + .spec.ts               (US-008)
    password-reset-token.entity.ts + .spec.ts        (US-011)
  value-objects/
    user-id.vo.ts                                    ✅ concluído
    email-confirmation-token-id.vo.ts                ✅ concluído
    refresh-token-id.vo.ts                           (US-008)
    password-reset-token-id.vo.ts                    (US-011)
  user.aggregate.ts                                  ✅ concluído (parcial)
```

O `UserAggregate` receberá novos métodos a cada US:
- US-008: `addRefreshToken()`, `findRefreshTokenByHash()`, `invalidateRefreshTokenFamily()`, `invalidateAllRefreshTokens()`
- US-011: `setPasswordResetToken()`, `clearPasswordResetToken()`
- US-012: chama `user.updatePassword()` + `user.invalidateAllRefreshTokens()`

O `IUserRepository` receberá novos finders a cada US:
- US-008: `findByRefreshTokenHash(hash: string)`
- US-011: `findByPasswordResetTokenHash(hash: string)`

---

## Padrão de retorno dos usecases

Todos os usecases retornam `Output<T>` — **nunca lançam exceções**. Apenas o controller converte `Output.fail()` em exceções HTTP.

```typescript
// usecase
async execute(input): Promise<Output<{ success: true }>> {
  const result = await this.userRepo.findById(userId);
  if (result.isFailure) return Output.fail('User not found');
  // ...
  return Output.ok({ success: true });
}

// controller
const output = await this.useCase.execute(dto);
if (output.isFailure) throw new NotFoundException(output.errorMessage);
return output.value;
```

---

## Verificação da Fase Completa

- [ ] `npm run typecheck` passa no backend
- [ ] Todos `.spec.ts` passam (usecases, entities — unit)
- [ ] Todos `.test.ts` passam (repositories, controller — integration)
- [ ] Arquivos em `domain/` não importam `@nestjs/*` ou `mongoose`
- [ ] Fluxo completo testável: signup → confirm email → login → refresh → logout
- [ ] Fluxo de reset de senha: forgot-password → reset-password → login com nova senha
- [ ] Rotas protegidas retornam 401 sem token
- [ ] `@Public()` em rotas de auth não bloqueia requisições sem token
- [ ] Swagger documenta todos os endpoints
- [ ] `npm run typecheck` passa no frontend
- [ ] Pages renderizam e chamam os endpoints corretos

---

## Arquivos Críticos de Referência

- `docs/domain-rules/auth.md`
- `docs/data-modeling/collections.md`
- `docs/code-patterns/backend-patterns.md`
- `formix-backend/src/modules/users/` — UserAggregate com tokens embutidos
- `formix-backend/src/shared/` — Email VO, Password VO, Output, IEmailService
