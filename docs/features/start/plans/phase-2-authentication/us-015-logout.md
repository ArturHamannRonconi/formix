# US-015: Logout

## Metadados

| Campo | Valor |
|---|---|
| **Feature** | Fase 2: Autenticação |
| **Status** | Pendente |
| **Depende de** | US-008 (Login — expande UserAggregate com RefreshToken e IUserRepository com findByRefreshTokenHash), US-014 (JWT Guard) |
| **Bloqueia** | — |

## Contexto

Implementa `POST /auth/logout`. Invalida o refresh token atual (e toda a sua família/sessão) do usuário, encerrando a sessão no backend. O frontend deve limpar os tokens armazenados e redirecionar para a tela de login. A rota exige autenticação (JWT válido no header).

O `RefreshToken` é estado do `UserAggregate` — não existe repositório separado. Toda a lógica usa `userRepo.findByRefreshTokenHash()` e métodos do aggregate.

## Arquivos

### Criar

**Auth Module — Domain — Usecases** — `formix-backend/src/modules/auth/domain/usecases/`

| Arquivo | Descrição |
|---|---|
| `logout.usecase.ts` | Input: `{ refreshToken }`. Calcula SHA-256 do token. Chama `userRepo.findByRefreshTokenHash(hash)`. Se `Output.isFailure`: retorna `Output.ok({ success: true })` (idempotente — sem efeito). Chama `user.findRefreshTokenByHash(hash)` para obter a entity. Chama `user.invalidateRefreshTokenFamily(token.family)` (invalida a sessão inteira). Salva user. Retorna `Output.ok({ success: true })` |
| `logout.usecase.spec.ts` | Testa: token válido invalida família e salva user, token não encontrado retorna sucesso silencioso, `userRepo.save` chamado apenas quando token encontrado |

**Auth Module — Infra — DTOs** — `formix-backend/src/modules/auth/infra/controllers/`

| Arquivo | Descrição |
|---|---|
| `logout.dto.ts` | Campo: refreshToken (string). `@ApiProperty` + `@IsString()` |

### Modificar

| Arquivo | O que muda |
|---|---|
| `auth.controller.ts` | Adicionar `POST /auth/logout` **sem** `@Public()` (exige JWT). Com `@ApiBearerAuth()` e tratamento de Output |
| `auth.module.ts` | Adicionar `LogoutUseCase` como provider |
| `auth.controller.test.ts` | Adicionar testes para POST /auth/logout (com e sem token JWT) |

## Mapeamento Output → HTTP no controller

```typescript
// logout — sempre 200 (idempotente)
if (output.isFailure) throw new BadRequestException(output.errorMessage);
return output.value;
```

## Passos de Implementação (TDD)

1. [teste] `logout.usecase.spec.ts` → [impl] `logout.usecase.ts`
2. [impl] `logout.dto.ts`
3. [teste] Adicionar casos ao `auth.controller.test.ts`
4. [impl] Adicionar `POST /auth/logout` ao `auth.controller.ts`
5. Atualizar `auth.module.ts`

## Critérios de Aceitação

- [ ] POST /auth/logout com JWT válido e refreshToken retorna 200 `{ success: true }`
- [ ] Família de refresh tokens é invalidada no aggregate (sessão encerrada)
- [ ] POST /auth/logout sem JWT retorna 401
- [ ] Token não encontrado retorna 200 silenciosamente (idempotente)
- [ ] Usecases retornam `Output<T>` — nenhum `throw` interno
- [ ] Todos `.spec.ts` passam
- [ ] `auth.controller.test.ts` atualizado passa
- [ ] `npm run typecheck` passa

## Próximas USs

- **US-009** — Login page (frontend inclui lógica de logout)
