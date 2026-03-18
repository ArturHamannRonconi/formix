# US-010: Refresh Token

## Metadados

| Campo | Valor |
|---|---|
| **Feature** | Fase 2: Autenticação |
| **Status** | Pendente |
| **Depende de** | US-008 (Login — cria RefreshTokenEntity, expande UserAggregate e IUserRepository) |
| **Bloqueia** | — |

## Contexto

Implementa `POST /auth/refresh` com refresh token rotation. Após uso, o token antigo é invalidado e um novo par é emitido. Se um token já utilizado for apresentado novamente, isso indica possível roubo — todos os tokens da família (sessão) são invalidados, forçando novo login.

O `RefreshToken` é estado do `UserAggregate` — não existe repositório separado. Toda a lógica usa `userRepo.findByRefreshTokenHash()` e métodos do aggregate.

## Arquivos

### Criar

**Auth Module — Domain — Usecases** — `formix-backend/src/modules/auth/domain/usecases/`

| Arquivo | Descrição |
|---|---|
| `refresh-token.usecase.ts` | Input: `{ refreshToken }`. Calcula SHA-256 do token recebido. Chama `userRepo.findByRefreshTokenHash(hash)`. Se `Output.isFailure`: retorna `Output.fail('Invalid refresh token')` (401). Chama `user.findRefreshTokenByHash(hash)` para obter a entity. Se `token.wasUsed()`: chama `user.invalidateRefreshTokenFamily(token.family)`, salva user, retorna `Output.fail('Refresh token reuse detected')` (401 — theft detection). Se `token.isExpired()`: retorna `Output.fail('Refresh token expired')` (401). Chama `user.invalidateRefreshTokenFamily(token.family)` para marcar token atual como usado. Cria novo `RefreshTokenEntity.createWithFamily(token.family, expiresInMs)`. Chama `user.addRefreshToken(newToken)`. Salva user. Gera novo accessToken JWT. Retorna `Output.ok({ accessToken, refreshToken: newToken.rawToken })` |
| `refresh-token.usecase.spec.ts` | Testa: token válido retorna novo par e invalida o antigo, token já usado invalida família inteira + retorna falha, token expirado retorna falha, token não encontrado retorna falha |

**Auth Module — Infra — DTOs** — `formix-backend/src/modules/auth/infra/controllers/`

| Arquivo | Descrição |
|---|---|
| `refresh-token.dto.ts` | Campo: refreshToken (string). Com `@ApiProperty` + `@IsString()` |
| `refresh-token-response.dto.ts` | Campos: accessToken, refreshToken. Com `@ApiProperty` |

### Modificar

| Arquivo | O que muda |
|---|---|
| `auth.controller.ts` | Adicionar `POST /auth/refresh` com `@Public()` e tratamento de Output |
| `auth.module.ts` | Adicionar `RefreshTokenUseCase` como provider |
| `auth.controller.test.ts` | Adicionar testes para POST /auth/refresh |

## Mapeamento Output → HTTP no controller

```typescript
// refresh
if (output.isFailure) throw new UnauthorizedException(output.errorMessage);
```

## Passos de Implementação (TDD)

1. [teste] `refresh-token.usecase.spec.ts` → [impl] `refresh-token.usecase.ts`
2. [impl] `refresh-token.dto.ts` + `refresh-token-response.dto.ts`
3. [teste] Adicionar casos ao `auth.controller.test.ts`
4. [impl] Adicionar `POST /auth/refresh` ao `auth.controller.ts`
5. Atualizar `auth.module.ts`

## Critérios de Aceitação

- [ ] POST /auth/refresh com token válido retorna 200 com novo `{ accessToken, refreshToken }`
- [ ] Token antigo é invalidado (family) após uso
- [ ] Token já usado invalida toda a família e retorna 401
- [ ] Token expirado retorna 401
- [ ] Token inexistente retorna 401
- [ ] Usecases retornam `Output<T>` — nenhum `throw` interno
- [ ] Todos `.spec.ts` passam
- [ ] `auth.controller.test.ts` atualizado passa
- [ ] `npm run typecheck` passa

## Próximas USs

- **US-009** — Login page frontend (usa refresh via http-client interceptor)
