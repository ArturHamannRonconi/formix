# US-004: Signup — Criar conta + organização

## Metadados

| Campo | Valor |
|---|---|
| **Feature** | Fase 2: Autenticação |
| **Status** | Concluída |
| **Depende de** | US-016 (Entidades), US-047 (Email Service) |
| **Bloqueia** | US-005 (Signup page), US-006 (Confirm email), US-014 (JWT Guard) |

## Contexto

Implementa o endpoint `POST /auth/signup`, ponto de entrada do sistema. Ao registrar, cria simultaneamente User + Organization (com Membership admin embutido). Envia email de confirmação e retorna tokens JWT.

**Princípios arquiteturais aplicados:**
- `EmailConfirmationTokenEntity` fica embutida no `UserAggregate` (coleção `users`) — sem coleção separada
- `MembershipEntity` fica embutida no `OrganizationAggregate` (coleção `organizations`) — sem coleção separada
- O módulo `auth` não tem repositórios próprios — usa `IUserRepository` e `IOrganizationRepository`
- Usecases retornam `Output<T>` — nunca lançam exceções

## Novos Pacotes

```bash
npm install @nestjs/jwt @nestjs/swagger
```

Adicionar ao `.env` e `.env.example`:
```env
JWT_ACCESS_SECRET=
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=
JWT_REFRESH_EXPIRES_IN=7d
EMAIL_CONFIRMATION_EXPIRES_IN=86400000
APP_URL=http://localhost:3000
```

## Arquivos

### Criados

**Shared** — `formix-backend/src/shared/`

| Arquivo | Descrição |
|---|---|
| `output.ts` | Classe `Output<T>` com `Output.ok(value?)` e `Output.fail(errorMessage)`. Padrão de retorno para todos os usecases |

**Users Module — Domain — Value Objects** — `formix-backend/src/modules/users/domain/aggregate/value-objects/`

| Arquivo | Descrição |
|---|---|
| `user-id.vo.ts` | `UserId` com `create()`, `from(value)`, `getValue()`, `equals()` |
| `email-confirmation-token-id.vo.ts` | `EmailConfirmationTokenId` com `create()`, `from(value)`, `getValue()`, `equals()` |

**Users Module — Domain — Entities** — `formix-backend/src/modules/users/domain/aggregate/entities/`

| Arquivo | Descrição |
|---|---|
| `email-confirmation-token.entity.ts` | Props: id (`EmailConfirmationTokenId`), tokenHash (string), expiresAt (Date), createdAt (Date). `create(expiresInMs)` gera rawToken (UUID) + SHA-256 hash. `isExpired()`. `reconstitute()`. Expõe `rawToken` só na criação. Sem `userId` (implícito no aggregate) |
| `email-confirmation-token.entity.spec.ts` | Testa: create gera tokenHash, rawToken disponível só após create, isExpired, reconstitute mantém dados |

**Users Module — Domain — Aggregate** — `formix-backend/src/modules/users/domain/aggregate/`

| Arquivo | Descrição |
|---|---|
| `user.aggregate.ts` | Props: id (`UserId`), name, email, passwordHash, emailConfirmed, emailConfirmationToken (`EmailConfirmationTokenEntity \| null`), createdAt, updatedAt. `create()`, `reconstitute()`, `confirmEmail()`, `setEmailConfirmationToken()`, `updateName()`, `updatePassword()` |
| `user.aggregate.spec.ts` | Testa todos os métodos do aggregate |

**Users Module — Domain — Repository** — `formix-backend/src/modules/users/domain/repositories/`

| Arquivo | Descrição |
|---|---|
| `user.repository.ts` | Interface `IUserRepository` + symbol `USER_REPOSITORY`. Métodos: `save(user)`, `findById(id: UserId)`, `findByEmail(email: Email)`, `findByEmailConfirmationTokenHash(hash: string)`, `exists(email: Email)` |

**Users Module — Infra — Schema** — `formix-backend/src/modules/users/infra/schemas/`

| Arquivo | Descrição |
|---|---|
| `user.schema.ts` | `UserSchema` com subdocumento `EmailConfirmationTokenSubSchema` embutido. Índice sparse em `emailConfirmationToken.tokenHash` |

**Users Module — Infra — Repository** — `formix-backend/src/modules/users/infra/repositories/`

| Arquivo | Descrição |
|---|---|
| `mongo-user.repository.ts` | Implementa `IUserRepository`. Mapeia emailConfirmationToken no `toDocument` e `toEntity`. Implementa `findByEmailConfirmationTokenHash` |
| `mongo-user.repository.test.ts` | Integration test com mongodb-memory-server: save, findById, findByEmail, findByEmailConfirmationTokenHash, exists |

**Organizations Module — Domain — Value Objects** — `formix-backend/src/modules/organizations/domain/aggregate/value-objects/`

| Arquivo | Descrição |
|---|---|
| `organization-id.vo.ts` | `OrganizationId` com `create()`, `from(value)`, `getValue()`, `equals()` |
| `membership-id.vo.ts` | `MembershipId` com `create()`, `from(value)`, `getValue()`, `equals()` |

**Organizations Module — Domain — Entities** — `formix-backend/src/modules/organizations/domain/aggregate/entities/`

| Arquivo | Descrição |
|---|---|
| `membership.entity.ts` | Props: id (`MembershipId`), userId (`UserId`), role (`MemberRole`), joinedAt. `create(userId, role)`, `reconstitute()` |
| `membership.entity.spec.ts` | Testa criação e reconstitute |

**Organizations Module — Domain — Aggregate** — `formix-backend/src/modules/organizations/domain/aggregate/`

| Arquivo | Descrição |
|---|---|
| `organization.aggregate.ts` | Props: id, name, slug, members (`MembershipEntity[]`), createdAt, updatedAt. `create({ name, slug, initialAdminId })` cria org com membership admin embutida. `addMember()`, `removeMember()`, `findMemberByUserId()` |
| `organization.aggregate.spec.ts` | Testa criação, addMember, removeMember |

**Organizations Module — Domain — Repository** — `formix-backend/src/modules/organizations/domain/repositories/`

| Arquivo | Descrição |
|---|---|
| `organization.repository.ts` | Interface `IOrganizationRepository` + symbol. Métodos: `save(org)`, `findById(id: OrganizationId)`, `findByMemberId(userId: UserId)`, `existsBySlug(slug: string)` |

**Organizations Module — Infra — Schema/Repository** — `formix-backend/src/modules/organizations/infra/`

| Arquivo | Descrição |
|---|---|
| `organization.schema.ts` | Schema com subdocumento `MembershipSubSchema` embutido |
| `mongo-organization.repository.ts` | Implementa `IOrganizationRepository` |
| `mongo-organization.repository.test.ts` | Integration test |

**Auth Module — Domain — Usecases** — `formix-backend/src/modules/auth/domain/usecases/`

| Arquivo | Descrição |
|---|---|
| `signup.usecase.ts` | Input: `{ name, email, password, organizationName }`. Valida email único. Cria User + EmailConfirmationToken embutido. Cria Organization (com Membership admin embutido). Salva ambos. Envia email. Retorna `Output.ok({ userId, organizationId, accessToken, emailConfirmationRequired: true })` |
| `signup.usecase.spec.ts` | Testa: signup completo, email duplicado retorna `Output.fail`, tokens gerados |

**Auth Module — Infra — Controllers** — `formix-backend/src/modules/auth/infra/controllers/`

| Arquivo | Descrição |
|---|---|
| `signup.dto.ts` | Campos: name, email, password, organizationName. Com `@ApiProperty` e validators |
| `signup-response.dto.ts` | Campos: userId, organizationId, accessToken, emailConfirmationRequired. Com `@ApiProperty` |
| `auth.controller.ts` | `@ApiTags('auth')`. `POST /auth/signup` com `@Public()`, `@ApiOperation`, `@ApiBody`, `@ApiResponse`. Converte `Output.fail` → exceção HTTP |
| `auth.controller.test.ts` | Integration test: 201, 409, 400 |

**Auth Module — Root** — `formix-backend/src/modules/auth/`

| Arquivo | Descrição |
|---|---|
| `auth.module.ts` | Importa UsersModule, OrganizationsModule, EmailModule, JwtModule. Providers: SignupUseCase + tokens de config. Controllers: AuthController |

### Modificados

| Arquivo | O que muda |
|---|---|
| `formix-backend/src/app.module.ts` | Importar `AuthModule` |
| `formix-backend/src/core/environment/environment.config.ts` | Adicionar validação de `JWT_ACCESS_SECRET`, `JWT_ACCESS_EXPIRES_IN`, `EMAIL_CONFIRMATION_EXPIRES_IN`, `APP_URL` |
| `formix-backend/.env` + `.env.example` | Adicionar novas variáveis |
| `formix-backend/src/core/environment/environment.config.spec.ts` | Atualizar testes com novas variáveis obrigatórias |

## Passos de Implementação

1. [impl] Instalar `@nestjs/jwt`, `@nestjs/swagger`
2. [impl] `output.ts` (shared)
3. [impl] IDValueObjects: `user-id.vo.ts`, `organization-id.vo.ts`, `membership-id.vo.ts`, `email-confirmation-token-id.vo.ts`
4. [teste] `email-confirmation-token.entity.spec.ts` → [impl] `email-confirmation-token.entity.ts`
5. [teste] `membership.entity.spec.ts` → [impl] `membership.entity.ts`
6. [teste] `user.aggregate.spec.ts` → [impl] `user.aggregate.ts`
7. [teste] `organization.aggregate.spec.ts` → [impl] `organization.aggregate.ts`
8. [impl] Interfaces de repositório: `user.repository.ts`, `organization.repository.ts`
9. [impl] Schemas: `user.schema.ts`, `organization.schema.ts`
10. [teste] `mongo-user.repository.test.ts` → [impl] `mongo-user.repository.ts`
11. [teste] `mongo-organization.repository.test.ts` → [impl] `mongo-organization.repository.ts`
12. [teste] `signup.usecase.spec.ts` → [impl] `signup.usecase.ts`
13. [impl] `signup.dto.ts` + `signup-response.dto.ts`
14. [teste] `auth.controller.test.ts` → [impl] `auth.controller.ts`
15. [impl] `auth.module.ts`
16. Registrar `AuthModule` no `AppModule`, atualizar `environment.config.ts`

## Critérios de Aceitação

- [x] POST /auth/signup retorna 201 com `{ userId, organizationId, accessToken, emailConfirmationRequired: true }`
- [x] Email duplicado retorna 409
- [x] Body inválido retorna 400
- [x] User e Organization (com Membership embutida) criados no banco
- [x] EmailConfirmationToken embutido no User (hash, não plain text)
- [x] Email de confirmação é enviado (log no console em dev)
- [x] Usecases retornam `Output<T>` — nenhum `throw` interno
- [x] Todos `.spec.ts` passam
- [x] Todos `.test.ts` passam
- [x] `npm run typecheck` passa
- [x] Arquivos em `domain/` não importam `@nestjs/*` ou `mongoose`
- [x] Swagger documenta o endpoint

## Próximas USs

- **US-014** — JWT Guard (usa tokens gerados aqui)
- **US-006** — Confirm Email (usa `EmailConfirmationToken` embutido no User)
- **US-005** — Signup page (frontend)
