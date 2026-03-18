# Formix — Progresso de Implementação

## Fase 1: Fundação

### features/start US-001: Setup do Backend
- **Status:** Concluído
- **Data:** 2026-03-16
- **Arquivos criados:**
  - `formix-backend/package.json` (com scripts: dev, build, start, test:unit, test:integration, typecheck, etc.)
  - `formix-backend/tsconfig.json` (strict, decorators, path aliases: @modules, @core, @shared, @utils)
  - `formix-backend/tsconfig.build.json`
  - `formix-backend/nest-cli.json`
  - `formix-backend/.eslintrc.js`
  - `formix-backend/.prettierrc`
  - `formix-backend/jest.config.ts`
  - `formix-backend/.env` e `.env.example`
  - `formix-backend/.gitignore`
  - `formix-backend/src/shared/domain-error.ts` + `domain-error.spec.ts`
  - `formix-backend/src/core/environment/environment.config.ts` + `environment.config.spec.ts`
  - `formix-backend/src/core/environment/environment.module.ts`
  - `formix-backend/src/core/database/database.module.ts` + `database.module.test.ts`
  - `formix-backend/src/app.module.ts`
  - `formix-backend/src/main.ts`
- **Verificação:** typecheck OK, 5 testes unitários OK, 1 teste de integração OK (MongoDB via MongoMemoryServer)

### features/start US-002: Setup do Frontend
- **Status:** Concluído
- **Data:** 2026-03-16
- **Arquivos criados:**
  - `formix-frontend/package.json` (com scripts: dev, build, start, lint, typecheck)
  - `formix-frontend/tsconfig.json` (strict, jsx: react-jsx, paths: @/* → ./src/*)
  - `formix-frontend/next.config.mjs` (reactStrictMode: true)
  - `formix-frontend/.eslintrc.json` (next/core-web-vitals + prettier)
  - `formix-frontend/.prettierrc`
  - `formix-frontend/.gitignore`
  - `formix-frontend/.env.local` e `.env.example`
  - `formix-frontend/src/app/globals.css` (CSS reset + design tokens)
  - `formix-frontend/src/app/layout.tsx` (root layout, html lang="pt-BR", metadata)
  - `formix-frontend/src/app/page.tsx` (página de teste)
- **Verificação:** typecheck OK, build OK (Next.js 16, static page gerada)

### features/start US-003: Comunicação Frontend → Backend (HTTP Client)
- **Status:** Concluído
- **Data:** 2026-03-16
- **Arquivos criados:**
  - `formix-frontend/src/types/api.ts` (ApiResponse<T>, PaginatedResponse<T>)
  - `formix-frontend/src/types/api-error.ts` (classe ApiError com statusCode, message, errors; factory fromAxiosError)
  - `formix-frontend/src/services/auth-token.ts` (getAccessToken, setAccessToken, getRefreshToken, setRefreshToken, clearTokens — SSR safe)
  - `formix-frontend/src/services/http-client.ts` (axios instance com baseURL NEXT_PUBLIC_API_URL, request interceptor com Bearer token, response interceptor 401 com fila de refresh)
- **Verificação:** typecheck OK, build OK

### features/start US-016: Schemas MongoDB + Entidades de Domínio
- **Status:** Concluído
- **Data:** 2026-03-16
- **Arquivos criados:**
  - `formix-backend/src/shared/value-objects/email.vo.ts` + `email.vo.spec.ts` (Email VO com validação regex, lowercase)
  - `formix-backend/src/shared/value-objects/password.vo.ts` + `password.vo.spec.ts` (Password VO com bcrypt hash/compare)
  - `formix-backend/src/modules/users/domain/aggregate/entities/user.entity.ts` + `.spec.ts`
  - `formix-backend/src/modules/users/domain/repositories/user.repository.ts` (IUserRepository + USER_REPOSITORY token)
  - `formix-backend/src/modules/users/infra/schemas/user.schema.ts` (Mongoose schema com índices)
  - `formix-backend/src/modules/users/infra/repositories/mongo-user.repository.ts` + `.test.ts`
  - `formix-backend/src/modules/users/users.module.ts`
  - `formix-backend/src/modules/organizations/domain/aggregate/value-objects/slug.vo.ts` + `.spec.ts`
  - `formix-backend/src/modules/organizations/domain/aggregate/value-objects/member-role.enum.ts`
  - `formix-backend/src/modules/organizations/domain/aggregate/entities/organization.entity.ts` + `.spec.ts`
  - `formix-backend/src/modules/organizations/domain/aggregate/entities/membership.entity.ts` + `.spec.ts`
  - `formix-backend/src/modules/organizations/domain/repositories/organization.repository.ts` (IOrganizationRepository)
  - `formix-backend/src/modules/organizations/domain/repositories/membership.repository.ts` (IMembershipRepository)
  - `formix-backend/src/modules/organizations/infra/schemas/organization.schema.ts`
  - `formix-backend/src/modules/organizations/infra/schemas/membership.schema.ts`
  - `formix-backend/src/modules/organizations/infra/repositories/mongo-organization.repository.ts` + `.test.ts`
  - `formix-backend/src/modules/organizations/infra/repositories/mongo-membership.repository.ts` + `.test.ts`
  - `formix-backend/src/modules/organizations/organizations.module.ts`
- **Verificação:** typecheck OK, 72 testes passando (unit + integration), domain layer sem imports de framework

### features/start US-047: Serviço de Email
- **Status:** Concluído
- **Data:** 2026-03-16
- **Arquivos criados:**
  - `formix-backend/src/shared/email/email-service.interface.ts` (IEmailService + EmailTemplate enum + EMAIL_SERVICE token)
  - `formix-backend/src/shared/email/console-email.service.ts` + `console-email.service.spec.ts`
  - `formix-backend/src/shared/email/email.module.ts` (global module, provide EMAIL_SERVICE → ConsoleEmailService)
- **Verificação:** typecheck OK, testes unitários passando

---

## Fase 2: Autenticação

### Planning da Fase 2
- **Status:** Concluído
- **Data:** 2026-03-16
- **Arquivos criados:**
  - `docs/features/start/plans/phase-2-authentication/phase-2-authentication.md`
  - `docs/features/start/plans/phase-2-authentication/us-004-signup.md`
  - `docs/features/start/plans/phase-2-authentication/us-005-signup-page.md`
  - `docs/features/start/plans/phase-2-authentication/us-006-confirm-email.md`
  - `docs/features/start/plans/phase-2-authentication/us-007-confirm-email-page.md`
  - `docs/features/start/plans/phase-2-authentication/us-008-login.md`
  - `docs/features/start/plans/phase-2-authentication/us-009-login-page.md`
  - `docs/features/start/plans/phase-2-authentication/us-010-refresh-token.md`
  - `docs/features/start/plans/phase-2-authentication/us-011-forgot-password.md`
  - `docs/features/start/plans/phase-2-authentication/us-012-reset-password.md`
  - `docs/features/start/plans/phase-2-authentication/us-013-password-pages.md`
  - `docs/features/start/plans/phase-2-authentication/us-014-jwt-guard.md`
  - `docs/features/start/plans/phase-2-authentication/us-015-logout.md`

### features/start US-004: Signup Backend
- **Status:** Concluído
- **Data:** 2026-03-17
- **Arquivos criados:**
  - `formix-backend/src/shared/output.ts` (Output<T> pattern)
  - `formix-backend/src/modules/users/domain/aggregate/value-objects/user-id.vo.ts`
  - `formix-backend/src/modules/users/domain/aggregate/value-objects/email-confirmation-token-id.vo.ts`
  - `formix-backend/src/modules/users/domain/aggregate/entities/email-confirmation-token.entity.ts` + `.spec.ts`
  - `formix-backend/src/modules/users/domain/aggregate/user.aggregate.ts` + `.spec.ts`
  - `formix-backend/src/modules/users/domain/repositories/user.repository.ts`
  - `formix-backend/src/modules/users/infra/schemas/user.schema.ts` (com EmailConfirmationTokenSubSchema embutido)
  - `formix-backend/src/modules/users/infra/repositories/mongo-user.repository.ts` + `.test.ts`
  - `formix-backend/src/modules/organizations/domain/aggregate/value-objects/organization-id.vo.ts`
  - `formix-backend/src/modules/organizations/domain/aggregate/value-objects/membership-id.vo.ts`
  - `formix-backend/src/modules/organizations/domain/aggregate/entities/membership.entity.ts` + `.spec.ts`
  - `formix-backend/src/modules/organizations/domain/aggregate/organization.aggregate.ts` + `.spec.ts`
  - `formix-backend/src/modules/organizations/domain/repositories/organization.repository.ts`
  - `formix-backend/src/modules/organizations/infra/schemas/organization.schema.ts` (com MembershipSubSchema embutido)
  - `formix-backend/src/modules/organizations/infra/repositories/mongo-organization.repository.ts` + `.test.ts`
  - `formix-backend/src/modules/auth/domain/usecases/signup.usecase.ts` + `.spec.ts`
  - `formix-backend/src/modules/auth/infra/controllers/auth.controller.ts` + `.test.ts`
  - `formix-backend/src/modules/auth/infra/controllers/signup.dto.ts`
  - `formix-backend/src/modules/auth/infra/controllers/signup-response.dto.ts`
  - `formix-backend/src/modules/auth/auth.module.ts`
- **Arquivos modificados:**
  - `formix-backend/src/app.module.ts` (importar AuthModule)
  - `formix-backend/src/core/environment/environment.config.ts` (JWT_ACCESS_SECRET, JWT_ACCESS_EXPIRES_IN, EMAIL_CONFIRMATION_EXPIRES_IN, APP_URL)
  - `formix-backend/.env` + `.env.example` (novas variáveis JWT e confirmação de email)
  - `formix-backend/src/core/environment/environment.config.spec.ts` (atualizar testes com novas vars)
  - `docs/code-patterns/backend-patterns.md` (reescrito com padrões: Aggregate, IDValueObject, Output, Repository)
  - `formix-backend/CLAUDE.md` (adicionados padrões de código obrigatórios)
- **Pacotes instalados:** `@nestjs/jwt`, `@nestjs/swagger`
- **Nota:** EmailConfirmationToken embutido no UserAggregate (sem coleção separada). Membership embutido no OrganizationAggregate (sem coleção separada). Auth module sem repositórios próprios.

### features/start US-005: Tela de Signup
- **Status:** Pendente

### features/start US-006: Confirmação de Email
- **Status:** Pendente

### features/start US-007: Tela de Confirmação de Email
- **Status:** Pendente

### features/start US-008: Login
- **Status:** Pendente

### features/start US-009: Tela de Login
- **Status:** Pendente

### features/start US-010: Refresh Token
- **Status:** Pendente

### features/start US-011: Reset de Senha — Solicitar
- **Status:** Pendente

### features/start US-012: Reset de Senha — Confirmar
- **Status:** Pendente

### features/start US-013: Telas de Reset de Senha
- **Status:** Pendente

### features/start US-014: Middleware de Autenticação (JWT Guard)
- **Status:** Pendente

### features/start US-015: Logout
- **Status:** Pendente
