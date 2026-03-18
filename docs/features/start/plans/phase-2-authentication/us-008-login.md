# US-008: Login

## Metadados

| Campo | Valor |
|---|---|
| **Feature** | Fase 2: Autenticação |
| **Status** | Pendente |
| **Depende de** | US-006 (Confirm email — login exige emailConfirmed), US-014 (JWT Guard) |
| **Bloqueia** | US-009 (Login page), US-010 (Refresh token), US-015 (Logout) |

## Contexto

Implementa `POST /auth/login`. Valida credenciais, verifica confirmação de email, gera access token JWT e refresh token. O `RefreshToken` é uma entity embutida no `UserAggregate` (array `refreshTokens`) — não existe coleção separada. Esta US cria a `RefreshTokenEntity`, o `RefreshTokenId` VO, e expande o `UserAggregate` e `IUserRepository` para suportar refresh tokens.

## Arquivos

### Criar

**Users Module — Domain — Value Objects** — `formix-backend/src/modules/users/domain/aggregate/value-objects/`

| Arquivo | Descrição |
|---|---|
| `refresh-token-id.vo.ts` | `RefreshTokenId` com `create()`, `from(value)`, `getValue()`, `equals()` |

**Users Module — Domain — Entities** — `formix-backend/src/modules/users/domain/aggregate/entities/`

| Arquivo | Descrição |
|---|---|
| `refresh-token.entity.ts` | Props: id (`RefreshTokenId`), tokenHash (string), family (string — UUID que agrupa tokens de uma sessão), usedAt (Date \| null), expiresAt (Date), createdAt (Date). `create(expiresInMs)` gera rawToken (UUID) + SHA-256 hash + nova family. `createWithFamily(family, expiresInMs)` reutiliza family existente (para rotation). `markAsUsed()`. `isExpired()`. `wasUsed()`. `reconstitute()`. Expõe `rawToken` só na criação. Sem `userId` (implícito no aggregate) |
| `refresh-token.entity.spec.ts` | Testa: create gera tokenHash (SHA-256) e family únicos, createWithFamily reutiliza a family, markAsUsed define usedAt, isExpired, wasUsed, reconstitute mantém dados |

**Auth Module — Domain — Usecases** — `formix-backend/src/modules/auth/domain/usecases/`

| Arquivo | Descrição |
|---|---|
| `login.usecase.ts` | Input: `{ email, password }`. Busca user por email via `userRepo.findByEmail`. Se `Output.isFailure`: retorna `Output.fail('Invalid credentials')` (401, mensagem genérica). Compara senha com `user.passwordHash.compare(password)`. Se falso: retorna `Output.fail('Invalid credentials')` (401). Se `!user.emailConfirmed`: retorna `Output.fail('Email not confirmed')` (403). Cria `RefreshTokenEntity`. Chama `user.addRefreshToken(refreshToken)`. Salva user. Gera accessToken JWT (payload: userId, organizationId, role). Retorna `Output.ok({ accessToken, refreshToken: rawToken, userId, organizationId, role })` |
| `login.usecase.spec.ts` | Testa: login válido retorna tokens, email não encontrado retorna falha genérica, senha inválida retorna falha genérica, email não confirmado retorna falha específica, refresh token adicionado ao user e user salvo |

**Auth Module — Infra — DTOs** — `formix-backend/src/modules/auth/infra/controllers/`

| Arquivo | Descrição |
|---|---|
| `login.dto.ts` | Campos: email (`@IsEmail()`), password (`@IsString()`). Com `@ApiProperty` |
| `login-response.dto.ts` | Campos: accessToken, refreshToken, userId, organizationId, role. Com `@ApiProperty` |

### Modificar

**Users Module** — expande UserAggregate, UserSchema, IUserRepository, MongoUserRepository

| Arquivo | O que muda |
|---|---|
| `user.aggregate.ts` | Adicionar `refreshTokens: RefreshTokenEntity[]` nas props. Adicionar métodos: `addRefreshToken(token)`, `findRefreshTokenByHash(hash): RefreshTokenEntity \| null`, `invalidateRefreshTokenFamily(family)` (marca como usados), `invalidateAllRefreshTokens()` (limpa array) |
| `user.aggregate.spec.ts` | Adicionar testes para os novos métodos |
| `user.schema.ts` | Adicionar subdocumento `RefreshTokenSubSchema` e campo `refreshTokens: RefreshTokenSubSchema[]` |
| `user.repository.ts` | Adicionar `findByRefreshTokenHash(hash: string): Promise<Output<User>>` |
| `mongo-user.repository.ts` | Implementar novo finder, mapear `refreshTokens` no `toDocument` e `toEntity` |
| `mongo-user.repository.test.ts` | Adicionar testes para o novo finder e persistência de refreshTokens |

**Auth Module**

| Arquivo | O que muda |
|---|---|
| `auth.controller.ts` | Adicionar `POST /auth/login` com `@Public()` e tratamento de Output |
| `auth.module.ts` | Adicionar `LoginUseCase` como provider |
| `auth.controller.test.ts` | Adicionar testes para POST /auth/login |

## Mapeamento Output → HTTP no controller

```typescript
// login
if (output.isFailure) {
  if (output.errorMessage === 'Email not confirmed') throw new ForbiddenException(output.errorMessage);
  throw new UnauthorizedException(output.errorMessage);
}
```

## Passos de Implementação (TDD)

1. [impl] `refresh-token-id.vo.ts`
2. [teste] `refresh-token.entity.spec.ts` → [impl] `refresh-token.entity.ts`
3. [impl] Expandir `user.aggregate.ts` com novos métodos + testes no `.spec.ts`
4. [impl] Expandir `user.schema.ts` com `RefreshTokenSubSchema`
5. [impl] Expandir `user.repository.ts` com `findByRefreshTokenHash`
6. [teste] Expandir `mongo-user.repository.test.ts` → [impl] `mongo-user.repository.ts`
7. [teste] `login.usecase.spec.ts` → [impl] `login.usecase.ts`
8. [impl] `login.dto.ts` + `login-response.dto.ts`
9. [teste] Adicionar casos ao `auth.controller.test.ts`
10. [impl] Adicionar `POST /auth/login` ao `auth.controller.ts`
11. Atualizar `auth.module.ts`

## Critérios de Aceitação

- [ ] POST /auth/login com credenciais válidas retorna 200 com `{ accessToken, refreshToken, userId, organizationId, role }`
- [ ] Email não encontrado retorna 401 (mensagem genérica)
- [ ] Senha inválida retorna 401 (mensagem genérica)
- [ ] Email não confirmado retorna 403
- [ ] Refresh token salvo embutido no documento do usuário (hash, não plain text)
- [ ] Usecases retornam `Output<T>` — nenhum `throw` interno
- [ ] Todos `.spec.ts` passam
- [ ] Todos `.test.ts` passam
- [ ] `npm run typecheck` passa

## Próximas USs

- **US-009** — Login page (frontend)
- **US-010** — Refresh token rotation
- **US-015** — Logout
