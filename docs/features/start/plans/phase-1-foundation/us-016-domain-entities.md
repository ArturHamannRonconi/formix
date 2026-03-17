# US-016: Schemas MongoDB + Entidades de Domínio

## Metadados

| Campo | Valor |
|---|---|
| **Feature** | Fase 1: Fundação |
| **Status** | Pendente |
| **Depende de** | US-001 — Setup do Backend |
| **Bloqueia** | US-004 — Auth (signup/login), US-005 — Invitations |

## Contexto

Os módulos `users/` e `organizations/` têm a estrutura de pastas criada mas estão vazios. Esta US implementa via TDD os Value Objects compartilhados, entidades de domínio e repositórios (interface + implementação Mongoose) para os módulos de usuários e organizações — a base que todos os outros módulos dependem.

## Arquivos

### Criar

**Shared Value Objects** — `formix-backend/src/shared/value-objects/`

| Arquivo | Descrição |
|---|---|
| `email.vo.ts` | VO imutável: `create(raw)` valida regex e normaliza lowercase; private constructor |
| `email.vo.spec.ts` | Testa: email válido, email inválido, normalização lowercase |
| `password.vo.ts` | `create(plaintext)` valida complexidade + bcrypt hash; `fromHash(hash)`; `compare(plain)`; `getHash()` |
| `password.vo.spec.ts` | Testa: senha válida, senha fraca rejeitada, compare correto/incorreto |

**Users Module — Domain** — `formix-backend/src/modules/users/domain/`

| Arquivo | Descrição |
|---|---|
| `aggregate/entities/user.entity.ts` | Props: id, name, email (Email VO), passwordHash (Password VO), emailConfirmed, createdAt, updatedAt. Factory `create()` e `reconstitute()`. Métodos: `confirmEmail()`, `updateName()`, `updatePassword()` |
| `aggregate/entities/user.entity.spec.ts` | Testa factories, confirmEmail, updateName, updatePassword |
| `repositories/user.repository.ts` | Interface `IUserRepository` + symbol `USER_REPOSITORY`. Métodos: `findById`, `findByEmail`, `save`, `exists` |

**Users Module — Infra** — `formix-backend/src/modules/users/infra/`

| Arquivo | Descrição |
|---|---|
| `schemas/user.schema.ts` | Mongoose schema: name, email (unique), passwordHash, emailConfirmed, timestamps. Índices: `{ email: 1 }` unique, `{ createdAt: -1 }` |
| `repositories/mongo-user.repository.ts` | Implementa `IUserRepository`; mapeia entre doc Mongoose e `User` entity |
| `repositories/mongo-user.repository.test.ts` | Integration test com mongodb-memory-server: findById, findByEmail, save, exists |

**Users Module — Root** — `formix-backend/src/modules/users/`

| Arquivo | Descrição |
|---|---|
| `users.module.ts` | Registra UserSchema, provider `{ provide: USER_REPOSITORY, useClass: MongoUserRepository }`, exporta `USER_REPOSITORY` |

**Organizations Module — Domain** — `formix-backend/src/modules/organizations/domain/`

| Arquivo | Descrição |
|---|---|
| `aggregate/value-objects/member-role.enum.ts` | Enum: `admin \| member` |
| `aggregate/value-objects/slug.vo.ts` | Valida formato (lowercase, alphanumeric + hyphens); `fromName(name)` gera slug automaticamente |
| `aggregate/value-objects/slug.vo.spec.ts` | Testa: slug válido, slug inválido, fromName com espaços/acentos |
| `aggregate/entities/organization.entity.ts` | Props: id, name, slug (Slug VO), createdAt, updatedAt. Factory `create()`, `reconstitute()`. Método: `updateName()` |
| `aggregate/entities/organization.entity.spec.ts` | Testa factories, updateName |
| `aggregate/entities/membership.entity.ts` | Props: id, userId, organizationId, role (MemberRole), createdAt. Método: `isAdmin()` |
| `aggregate/entities/membership.entity.spec.ts` | Testa isAdmin para admin e member |
| `repositories/organization.repository.ts` | Interface `IOrganizationRepository` + symbol. Métodos: `findById`, `findBySlug`, `save`, `existsBySlug` |
| `repositories/membership.repository.ts` | Interface `IMembershipRepository` + symbol. Métodos: `findByUserAndOrg`, `findByOrganizationId`, `findByUserId`, `save`, `delete`, `countAdminsByOrganization` |

**Organizations Module — Infra** — `formix-backend/src/modules/organizations/infra/`

| Arquivo | Descrição |
|---|---|
| `schemas/organization.schema.ts` | name, slug (unique), timestamps |
| `schemas/membership.schema.ts` | userId, organizationId, role, createdAt; índice compound unique (userId + organizationId) |
| `repositories/mongo-organization.repository.ts` | Implementa `IOrganizationRepository` |
| `repositories/mongo-organization.repository.test.ts` | Integration test: findById, findBySlug, save, existsBySlug |
| `repositories/mongo-membership.repository.ts` | Implementa `IMembershipRepository` |
| `repositories/mongo-membership.repository.test.ts` | Integration test: findByUserAndOrg, findByOrganizationId, save, delete, countAdmins |

**Organizations Module — Root** — `formix-backend/src/modules/organizations/`

| Arquivo | Descrição |
|---|---|
| `organizations.module.ts` | Registra schemas, providers para os dois repositórios, exporta ambos |

### Modificar

| Arquivo | O que muda |
|---|---|
| `formix-backend/src/app.module.ts` | Importar `UsersModule` e `OrganizationsModule` |

## Passos de Implementação

1. [teste] `email.vo.spec.ts` → [impl] `email.vo.ts`
2. [teste] `password.vo.spec.ts` → [impl] `password.vo.ts`
3. [teste] `user.entity.spec.ts` → [impl] `user.entity.ts`
4. [impl] `user.repository.ts` (interface)
5. [impl] `user.schema.ts`
6. [teste] `mongo-user.repository.test.ts` → [impl] `mongo-user.repository.ts`
7. [impl] `users.module.ts`
8. [teste] `slug.vo.spec.ts` → [impl] `slug.vo.ts`
9. [impl] `member-role.enum.ts`
10. [teste] `organization.entity.spec.ts` → [impl] `organization.entity.ts`
11. [teste] `membership.entity.spec.ts` → [impl] `membership.entity.ts`
12. [impl] `organization.repository.ts` + `membership.repository.ts` (interfaces)
13. [impl] `organization.schema.ts` + `membership.schema.ts`
14. [teste] `mongo-organization.repository.test.ts` → [impl] `mongo-organization.repository.ts`
15. [teste] `mongo-membership.repository.test.ts` → [impl] `mongo-membership.repository.ts`
16. [impl] `organizations.module.ts`
17. Registrar `UsersModule` e `OrganizationsModule` no `AppModule`

## Critérios de Aceitação

- [ ] Todos os `.spec.ts` passam (unit: VOs, entities)
- [ ] Todos os `.test.ts` passam (integration: repositories com mongodb-memory-server)
- [ ] `npm run typecheck` passa sem erros
- [ ] Arquivos em `domain/` não importam nada de `@nestjs/*` ou `mongoose`

## Dependências de Pacotes

> Nenhuma nova dependência — `mongoose`, `bcrypt` e `mongodb-memory-server` já instalados na US-001.

## Próximas USs

- **US-047** — Serviço de Email (paralela, não bloqueia)
- **US-004** — Auth: Signup + Login (depende desta)
- **US-005** — Invitations (depende desta)
