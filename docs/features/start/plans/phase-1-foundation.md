# Plano: Fase 1 — Fundação do Formix

## Contexto

O projeto Formix é um SaaS multi-tenant para criação de formulários com respostas anônimas. Toda a documentação (PRD, arquitetura, domain rules, data modeling, code patterns) já existe, mas **não há código algum** — apenas diretórios vazios e READMEs. Este plano cobre a **Fase 1: Fundação** do PRD (US-001, US-002, US-003, US-016, US-047), que estabelece a infraestrutura base para todo o desenvolvimento posterior.

Ao final de cada US concluída, marcar no `docs/prd-formix.md` e registrar em `docs/features/start/progress.md`.

---

## Ordem de Execução

```
US-001 (Backend Setup) ──┬──▶ US-016 (Schemas & Entities)
                         └──▶ US-047 (Email Service)
US-002 (Frontend Setup) ──┬──▶ US-003 (HTTP Client)
                          │
(US-001 e US-002 são independentes, podem ser feitos em sequência rápida)
```

---

## 1. US-001: Setup do Backend (NestJS + MongoDB)

### 1.1 Inicializar projeto em `formix-backend/`

```bash
cd formix-backend && npm init -y
```

**Dependências de produção:**
```
@nestjs/common @nestjs/core @nestjs/platform-express reflect-metadata rxjs
@nestjs/mongoose mongoose
@nestjs/config class-validator class-transformer
bcrypt
```

**Dependências de desenvolvimento:**
```
typescript @types/node ts-node tsconfig-paths
@nestjs/cli @nestjs/testing
jest ts-jest @types/jest supertest @types/supertest
@types/bcrypt
eslint prettier eslint-config-prettier @typescript-eslint/eslint-plugin @typescript-eslint/parser
mongodb-memory-server
```

### 1.2 Arquivos de configuração

| Arquivo | Detalhes chave |
|---|---|
| `tsconfig.json` | strict: true, experimentalDecorators, emitDecoratorMetadata, paths: `@modules/*`, `@core/*`, `@shared/*`, `@utils/*` |
| `tsconfig.build.json` | extends tsconfig, excludes tests e node_modules |
| `nest-cli.json` | sourceRoot: "src" |
| `.eslintrc.js` | @typescript-eslint/recommended + prettier |
| `.prettierrc` | singleQuote, trailingComma: all, semi: true |
| `jest.config.ts` | ts-jest, moduleNameMapper para aliases, testRegex: `\.(spec\|test)\.ts$` |
| `.env` | MONGODB_URI, PORT=3001, NODE_ENV=development |
| `.env.example` | mesmas chaves, sem valores |

### 1.3 Scripts do package.json

```
dev, build, start, start:prod, test, test:unit, test:integration, test:watch, test:cov, lint, format, typecheck
```

### 1.4 Código base (TDD)

**Environment Module** — `src/core/environment/`
- `environment.config.spec.ts` → testa validação de variáveis obrigatórias
- `environment.config.ts` → ConfigModule.forRoot() com validação (Joi ou class-validator)
- `environment.module.ts` → exporta ConfigModule

**Database Module** — `src/core/database/`
- `database.module.test.ts` → testa conexão com mongodb-memory-server
- `database.module.ts` → MongooseModule.forRootAsync() com ConfigService

**App Bootstrap**
- `src/app.module.ts` → importa EnvironmentModule e DatabaseModule
- `src/main.ts` → NestFactory.create(), listen na PORT configurada

**Shared**
- `src/shared/domain-error.ts` + `domain-error.spec.ts` → classe DomainError base

### 1.5 Verificação

- `npm run typecheck` passa
- `npm run test` passa (unit + integration)
- `npm run dev` inicia o servidor sem erros

---

## 2. US-002: Setup do Frontend (Next.js + React)

### 2.1 Inicializar projeto em `formix-frontend/`

Como já existem diretórios, inicializar manualmente:
```bash
cd formix-frontend && npm init -y
npm install next react react-dom
npm install -D typescript @types/react @types/react-dom @types/node eslint eslint-config-next prettier eslint-config-prettier
```

### 2.2 Arquivos de configuração

| Arquivo | Detalhes |
|---|---|
| `tsconfig.json` | strict, jsx: preserve, paths: `@/*: ["./src/*"]` |
| `next.config.mjs` | reactStrictMode: true |
| `.eslintrc.json` | extends next/core-web-vitals + prettier |
| `.prettierrc` | mesmas configs do backend |
| `.env.local` | NEXT_PUBLIC_API_URL=http://localhost:3001 |
| `.env.example` | mesmas chaves |

### 2.3 Código base

- `src/app/layout.tsx` → root layout com metadata
- `src/app/page.tsx` → página de teste "Formix"
- `src/app/globals.css` → CSS reset + design tokens (custom properties para cores, spacing, fonts)

### 2.4 Verificação

- `npm run typecheck` passa
- `npm run build` sucesso
- `npm run dev` renderiza página de teste em localhost:3000

---

## 3. US-016: Schemas MongoDB + Entidades de Domínio

### 3.1 Value Objects compartilhados — `src/shared/value-objects/`

**Email VO** (`email.vo.ts` + `email.vo.spec.ts`)
- Private constructor, factory `create()`, validação regex, lowercase
- Padrão do `docs/code-patterns/backend-patterns.md` linha 58-75

**Password VO** (`password.vo.ts` + `password.vo.spec.ts`)
- `create(plaintext)` → valida complexidade, hash bcrypt
- `fromHash(hash)` → reconstitui do banco
- `compare(plaintext)` → bcrypt compare
- `getHash()` → retorna hash

### 3.2 Users Module — Domain

**User Entity** (`src/modules/users/domain/aggregate/entities/user.entity.ts` + `.spec.ts`)
- Props: id, name, email (Email VO), passwordHash, emailConfirmed, createdAt, updatedAt
- Factory: `create()` (novo user, emailConfirmed=false), `reconstitute()` (do banco)
- Métodos: `confirmEmail()`, `updateName()`, `updatePassword()`

**IUserRepository** (`src/modules/users/domain/repositories/user.repository.ts`)
- findById, findByEmail, save, exists
- Symbol token: `USER_REPOSITORY`

### 3.3 Users Module — Infra

**User Schema** (`src/modules/users/infra/schemas/user.schema.ts`)
- Conforme `docs/data-modeling/collections.md`: name, email (unique), passwordHash, emailConfirmed, timestamps
- Índices: `{ email: 1 }` unique, `{ createdAt: -1 }`

**MongoUserRepository** (`src/modules/users/infra/repositories/mongo-user.repository.ts` + `.test.ts`)
- Implementa IUserRepository, mapeia entre Mongoose doc e User entity

**UsersModule** (`src/modules/users/users.module.ts`)
- Registra schema e provider `{ provide: USER_REPOSITORY, useClass: MongoUserRepository }`

### 3.4 Organizations Module — Domain

**Slug VO** (`src/modules/organizations/domain/aggregate/value-objects/slug.vo.ts` + `.spec.ts`)
- Valida formato (lowercase, alphanumeric + hyphens)
- `fromName(name)` gera slug automaticamente

**Organization Entity** (`src/modules/organizations/domain/aggregate/entities/organization.entity.ts` + `.spec.ts`)
- Props: id, name, slug (Slug VO), createdAt, updatedAt
- Factory: `create()`, `reconstitute()`
- Método: `updateName()`

**MemberRole** — enum simples: `admin | member`

**Membership Entity** (`src/modules/organizations/domain/aggregate/entities/membership.entity.ts` + `.spec.ts`)
- Props: id, userId, organizationId, role (MemberRole), createdAt
- Método: `isAdmin()`

**IOrganizationRepository** + `ORGANIZATION_REPOSITORY` token
- findById, findBySlug, save, existsBySlug

**IMembershipRepository** + `MEMBERSHIP_REPOSITORY` token
- findByUserAndOrg, findByOrganizationId, findByUserId, save, delete, countAdminsByOrganization

### 3.5 Organizations Module — Infra

**Organization Schema** — name, slug (unique), timestamps
**Membership Schema** — userId, organizationId, role, createdAt; índices compound unique

**MongoOrganizationRepository** + `.test.ts`
**MongoMembershipRepository** + `.test.ts`

**OrganizationsModule** — registra schemas, providers, exporta repositórios

### 3.6 Verificação

- Todos os `.spec.ts` passam (entities, value objects)
- Todos os `.test.ts` passam (repositories com mongodb-memory-server)
- `npm run typecheck` passa
- Arquivos em domain/ não importam nada de `@nestjs/*` ou `mongoose`

---

## 4. US-047: Serviço de Email

### 4.1 Interface — `src/shared/email/`

**IEmailService** (`email-service.interface.ts`)
```typescript
interface IEmailService {
  send(to: string, template: EmailTemplate, data: Record<string, unknown>): Promise<void>;
}
```
**EmailTemplate** enum: EMAIL_CONFIRMATION, INVITATION, PASSWORD_RESET
**Symbol**: `EMAIL_SERVICE`

### 4.2 Implementação Console

**ConsoleEmailService** (`console-email.service.ts` + `.spec.ts`)
- Loga to, template, data no console
- Provider padrão em desenvolvimento

### 4.3 EmailModule (`email.module.ts`)
- Provide `EMAIL_SERVICE` → `ConsoleEmailService`
- Global module ou exportável

### 4.4 Extensão do Environment
- Adicionar `EMAIL_PROVIDER` (opcional, default: 'console')

### 4.5 Verificação
- Testes unitários passam
- `npm run typecheck` passa

---

## 5. US-003: Comunicação Frontend → Backend

### 5.1 Instalar Axios
```bash
cd formix-frontend && npm install axios
```

### 5.2 Arquivos

**HTTP Client** (`src/services/http-client.ts`)
- Axios instance com baseURL de `NEXT_PUBLIC_API_URL`
- Request interceptor: injeta `Authorization: Bearer <token>`
- Response interceptor: em 401, tenta refresh, retenta request original
- Queue para evitar múltiplos refreshes simultâneos

**Token Management** (`src/services/auth-token.ts`)
- getAccessToken, setAccessToken, getRefreshToken, setRefreshToken, clearTokens
- localStorage para Phase 1

**API Error Types** (`src/types/api-error.ts`)
- Classe ApiError com statusCode, message, errors

**Base Types** (`src/types/api.ts`)
- ApiResponse<T>, PaginatedResponse<T>

### 5.3 Verificação
- `npm run typecheck` passa
- `npm run build` sucesso

---

## Tracking de Progresso

### Ao completar cada US:
1. Marcar checkboxes `[x]` no `docs/prd-formix.md`
2. Adicionar entrada no `docs/features/start/progress.md` com formato padronizado

### Formato do `docs/features/start/progress.md`:
```markdown
# Formix — Progresso de Implementação

## Fase 1: Fundação
### US-001: Setup do Backend
- **Status:** Concluído
- **Data:** YYYY-MM-DD
- **Arquivos criados:** [lista]
- **Verificação:** typecheck OK, testes OK, servidor inicia

### US-002: ...
```

---

## Arquivos Críticos de Referência

- `docs/code-patterns/backend-patterns.md` — padrões exatos de código
- `docs/data-modeling/collections.md` — schemas MongoDB
- `docs/boundaries/module-boundaries.md` — dependências entre módulos
- `formix-backend/CLAUDE.md` — convenções do backend
- `formix-frontend/CLAUDE.md` — convenções do frontend
