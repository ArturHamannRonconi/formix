# US-014: Middleware de Autenticação (JWT Guard)

## Metadados

| Campo | Valor |
|---|---|
| **Feature** | Fase 2: Autenticação |
| **Status** | Pendente |
| **Depende de** | US-004 (Signup — define payload JWT) |
| **Bloqueia** | US-006, US-008, US-015 (rotas autenticadas) |

## Contexto

Implementa o guard global do NestJS que protege todas as rotas autenticadas validando o JWT Bearer token. Rotas públicas (signup, login, confirm-email) são marcadas com `@Public()`. O guard também disponibiliza `@CurrentUser()` para injetar o payload do token nos handlers.

## Novos Pacotes

```bash
npm install @nestjs/passport passport passport-jwt
npm install -D @types/passport-jwt
```

## Arquivos

### Criar

**Auth Module — Infra — Guards** — `formix-backend/src/modules/auth/infra/guards/`

| Arquivo | Descrição |
|---|---|
| `jwt-auth.guard.ts` | Estende `AuthGuard('jwt')`. No `canActivate`: verifica se rota tem metadata `IS_PUBLIC_KEY` (via Reflector) — se sim, retorna `true` diretamente; caso contrário, delega para a validação JWT do passport |

**Auth Module — Infra — Strategies** — `formix-backend/src/modules/auth/infra/strategies/`

| Arquivo | Descrição |
|---|---|
| `jwt.strategy.ts` | Estende `PassportStrategy(Strategy, 'jwt')`. Extrai token do header `Authorization: Bearer`. Chave: `JWT_ACCESS_SECRET` via ConfigService. `validate(payload)` retorna `{ userId, organizationId, role }` |

**Auth Module — Infra — Decorators** — `formix-backend/src/modules/auth/infra/decorators/`

| Arquivo | Descrição |
|---|---|
| `public.decorator.ts` | `export const IS_PUBLIC_KEY = 'isPublic'`. Decorator `@Public()` usa `SetMetadata(IS_PUBLIC_KEY, true)` |
| `current-user.decorator.ts` | Decorator `@CurrentUser()` usa `createParamDecorator` para extrair `req.user` do ExecutionContext |

### Modificar

| Arquivo | O que muda |
|---|---|
| `formix-backend/src/modules/auth/auth.module.ts` | Adicionar imports: `PassportModule.register({ defaultStrategy: 'jwt' })`. Adicionar providers: `JwtStrategy`, `JwtAuthGuard`. Exportar `JwtAuthGuard`, `JwtStrategy` |
| `formix-backend/src/app.module.ts` | Registrar `JwtAuthGuard` como provider global: `{ provide: APP_GUARD, useClass: JwtAuthGuard }` |

## Passos de Implementação

1. [impl] Instalar `@nestjs/passport passport passport-jwt @types/passport-jwt`
2. [impl] `public.decorator.ts`
3. [impl] `current-user.decorator.ts`
4. [impl] `jwt.strategy.ts`
5. [impl] `jwt-auth.guard.ts`
6. Atualizar `auth.module.ts` com PassportModule, JwtStrategy, JwtAuthGuard
7. Registrar guard global no `AppModule`
8. Anotar rotas públicas existentes com `@Public()` em `auth.controller.ts`

## Critérios de Aceitação

- [ ] Rota protegida sem token retorna 401
- [ ] Rota protegida com token válido retorna 200
- [ ] Rota protegida com token expirado retorna 401
- [ ] Rotas marcadas com `@Public()` não exigem token
- [ ] `@CurrentUser()` injeta `{ userId, organizationId, role }` corretamente
- [ ] `npm run typecheck` passa

## Próximas USs

- **US-006** — Confirm Email (adiciona endpoints públicos)
- **US-008** — Login (endpoint público, retorna tokens)
- **US-015** — Logout (endpoint autenticado)
