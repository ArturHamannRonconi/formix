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
- **Status:** Concluído
- **Data:** 2026-03-18
- **Arquivos criados:**
  - `formix-frontend/src/services/auth/auth.types.ts`
  - `formix-frontend/src/services/auth/auth.service.ts` (função `signup`)
  - `formix-frontend/src/app/signup/page.tsx`

### features/start US-006: Confirmação de Email
- **Status:** Concluído
- **Data:** 2026-03-18
- **Arquivos criados:**
  - `formix-backend/src/modules/auth/domain/usecases/confirm-email.usecase.ts` + `.spec.ts`
  - `formix-backend/src/modules/auth/domain/usecases/resend-confirmation.usecase.ts` + `.spec.ts`
  - `formix-backend/src/modules/auth/infra/controllers/confirm-email.dto.ts`
  - `formix-backend/src/modules/auth/infra/controllers/resend-confirmation.dto.ts`
- **Arquivos modificados:**
  - `formix-backend/src/modules/auth/infra/controllers/auth.controller.ts` (POST /auth/confirm-email, POST /auth/resend-confirmation)
  - `formix-backend/src/modules/auth/auth.module.ts`
  - `formix-backend/src/modules/auth/infra/controllers/auth.controller.test.ts`

### features/start US-007: Tela de Confirmação de Email
- **Status:** Concluído
- **Data:** 2026-03-18
- **Arquivos criados:**
  - `formix-frontend/src/app/confirm-email/page.tsx`
- **Arquivos modificados:**
  - `formix-frontend/src/services/auth/auth.service.ts` (funções `confirmEmail`, `resendConfirmation`)

### features/start US-008: Login
- **Status:** Concluído
- **Data:** 2026-03-18
- **Arquivos criados:**
  - `formix-backend/src/modules/users/domain/aggregate/value-objects/refresh-token-id.vo.ts`
  - `formix-backend/src/modules/users/domain/aggregate/entities/refresh-token.entity.ts` + `.spec.ts`
  - `formix-backend/src/modules/auth/domain/usecases/login.usecase.ts` + `.spec.ts`
  - `formix-backend/src/modules/auth/infra/controllers/login.dto.ts`
  - `formix-backend/src/modules/auth/infra/controllers/login-response.dto.ts`
- **Arquivos modificados:**
  - `formix-backend/src/modules/users/domain/aggregate/user.aggregate.ts` (refreshTokens, addRefreshToken, findRefreshTokenByHash, invalidateRefreshTokenFamily, invalidateAllRefreshTokens)
  - `formix-backend/src/modules/users/infra/schemas/user.schema.ts` (RefreshTokenSubSchema)
  - `formix-backend/src/modules/users/domain/repositories/user.repository.ts` (findByRefreshTokenHash)
  - `formix-backend/src/modules/users/infra/repositories/mongo-user.repository.ts` + `.test.ts`
  - `formix-backend/src/modules/auth/infra/controllers/auth.controller.ts` (POST /auth/login)
  - `formix-backend/src/modules/auth/auth.module.ts`

### features/start US-009: Tela de Login
- **Status:** Concluído
- **Data:** 2026-03-18
- **Arquivos criados:**
  - `formix-frontend/src/app/login/page.tsx`
- **Arquivos modificados:**
  - `formix-frontend/src/services/auth/auth.service.ts` (função `login`)
  - `formix-frontend/src/services/auth/auth.types.ts` (LoginResponse)

### features/start US-010: Refresh Token
- **Status:** Concluído
- **Data:** 2026-03-18
- **Arquivos criados:**
  - `formix-backend/src/modules/auth/domain/usecases/refresh-token.usecase.ts` + `.spec.ts`
  - `formix-backend/src/modules/auth/infra/controllers/refresh-token.dto.ts`
- **Arquivos modificados:**
  - `formix-backend/src/modules/auth/infra/controllers/auth.controller.ts` (POST /auth/refresh)
  - `formix-backend/src/modules/auth/auth.module.ts`

### features/start US-011: Reset de Senha — Solicitar
- **Status:** Concluído
- **Data:** 2026-03-18
- **Arquivos criados:**
  - `formix-backend/src/modules/users/domain/aggregate/value-objects/password-reset-token-id.vo.ts`
  - `formix-backend/src/modules/users/domain/aggregate/entities/password-reset-token.entity.ts` + `.spec.ts`
  - `formix-backend/src/modules/auth/domain/usecases/forgot-password.usecase.ts` + `.spec.ts`
  - `formix-backend/src/modules/auth/infra/controllers/forgot-password.dto.ts`
- **Arquivos modificados:**
  - `formix-backend/src/modules/users/domain/aggregate/user.aggregate.ts` (passwordResetToken, setPasswordResetToken, clearPasswordResetToken)
  - `formix-backend/src/modules/users/infra/schemas/user.schema.ts` (PasswordResetTokenSubSchema)
  - `formix-backend/src/modules/users/domain/repositories/user.repository.ts` (findByPasswordResetTokenHash)
  - `formix-backend/src/modules/users/infra/repositories/mongo-user.repository.ts` + `.test.ts`
  - `formix-backend/src/modules/auth/infra/controllers/auth.controller.ts` (POST /auth/forgot-password)
  - `formix-backend/src/modules/auth/auth.module.ts`

### features/start US-012: Reset de Senha — Confirmar
- **Status:** Concluído
- **Data:** 2026-03-18
- **Arquivos criados:**
  - `formix-backend/src/modules/auth/domain/usecases/reset-password.usecase.ts` + `.spec.ts`
  - `formix-backend/src/modules/auth/infra/controllers/reset-password.dto.ts`
- **Arquivos modificados:**
  - `formix-backend/src/modules/auth/infra/controllers/auth.controller.ts` (POST /auth/reset-password)
  - `formix-backend/src/modules/auth/auth.module.ts`

### features/start US-013: Telas de Reset de Senha
- **Status:** Concluído
- **Data:** 2026-03-18
- **Arquivos criados:**
  - `formix-frontend/src/app/forgot-password/page.tsx`
  - `formix-frontend/src/app/reset-password/page.tsx`
- **Arquivos modificados:**
  - `formix-frontend/src/services/auth/auth.service.ts` (funções `forgotPassword`, `resetPassword`)

### features/start US-014: Middleware de Autenticação (JWT Guard)
- **Status:** Concluído
- **Data:** 2026-03-18
- **Pacotes instalados:** `@nestjs/passport`, `passport`, `passport-jwt`, `@types/passport-jwt`
- **Arquivos criados:**
  - `formix-backend/src/modules/auth/infra/decorators/public.decorator.ts`
  - `formix-backend/src/modules/auth/infra/decorators/current-user.decorator.ts`
  - `formix-backend/src/modules/auth/infra/strategies/jwt.strategy.ts`
  - `formix-backend/src/modules/auth/infra/guards/jwt-auth.guard.ts`
- **Arquivos modificados:**
  - `formix-backend/src/modules/auth/auth.module.ts` (PassportModule, JwtStrategy, JwtAuthGuard)
  - `formix-backend/src/app.module.ts` (APP_GUARD global)
  - `formix-backend/src/core/environment/environment.config.ts` (JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRES_IN, PASSWORD_RESET_EXPIRES_IN)

### features/start US-015: Logout
- **Status:** Concluído
- **Data:** 2026-03-18
- **Arquivos criados:**
  - `formix-backend/src/modules/auth/domain/usecases/logout.usecase.ts` + `.spec.ts`
  - `formix-backend/src/modules/auth/infra/controllers/logout.dto.ts`
- **Arquivos modificados:**
  - `formix-backend/src/modules/auth/infra/controllers/auth.controller.ts` (POST /auth/logout)
  - `formix-backend/src/modules/auth/auth.module.ts`
- **Verificação final:** typecheck OK (backend + frontend), 97 testes unitários OK, 29 testes de integração OK, build frontend OK

## Fase 3: Layout e Navegação

### features/start US-036: Layout Principal — Frontend
- **Status:** Concluído
- **Data:** 2026-03-18
- **Arquivos criados:**
  - `formix-frontend/src/components/Layout/AppShell.tsx` + `.module.css`
  - `formix-frontend/src/components/Layout/Sidebar.tsx` + `.module.css`
  - `formix-frontend/src/components/Layout/Header.tsx` + `.module.css`
  - `formix-frontend/src/components/Layout/PageContainer.tsx` + `.module.css`
  - `formix-frontend/src/components/Layout/index.ts`
- **Verificação:** typecheck OK, build OK

### features/start US-037: Componentes de Input Reutilizáveis — Frontend
- **Status:** Concluído
- **Data:** 2026-03-18
- **Arquivos criados:**
  - `formix-frontend/src/types/input.types.ts`
  - `formix-frontend/src/components/inputs/TextInput/` (TextInput.tsx, module.css, index.ts)
  - `formix-frontend/src/components/inputs/EmailInput/`
  - `formix-frontend/src/components/inputs/TextArea/`
  - `formix-frontend/src/components/inputs/NumberInput/`
  - `formix-frontend/src/components/inputs/DatePicker/`
  - `formix-frontend/src/components/inputs/Toggle/`
  - `formix-frontend/src/components/inputs/RadioGroup/`
  - `formix-frontend/src/components/inputs/Checkbox/`
  - `formix-frontend/src/components/inputs/Dropdown/`
  - `formix-frontend/src/components/inputs/RatingInput/`
  - `formix-frontend/src/components/inputs/FileUpload/`
  - `formix-frontend/src/components/inputs/index.ts`
- **Verificação:** typecheck OK, build OK

### features/start US-045: Rotas e Navegação Completa — Frontend
- **Status:** Concluído
- **Data:** 2026-03-18
- **Arquivos criados:**
  - `formix-frontend/src/types/auth.types.ts`
  - `formix-frontend/src/hooks/useAuth.ts`
  - `formix-frontend/src/middleware.ts`
  - `formix-frontend/src/app/(auth)/layout.tsx`
  - `formix-frontend/src/app/(app)/layout.tsx`
  - `formix-frontend/src/app/(app)/forms/page.tsx` (placeholder)
  - `formix-frontend/src/app/(app)/forms/new/page.tsx` (placeholder)
  - `formix-frontend/src/app/(app)/forms/[id]/edit/page.tsx` (placeholder)
  - `formix-frontend/src/app/(app)/forms/[id]/responses/page.tsx` (placeholder)
  - `formix-frontend/src/app/(app)/forms/[id]/analytics/page.tsx` (placeholder)
  - `formix-frontend/src/app/(app)/settings/profile/page.tsx` (placeholder)
  - `formix-frontend/src/app/(app)/settings/members/page.tsx` (placeholder)
  - `formix-frontend/src/app/(auth)/check-email/page.tsx`
  - `formix-frontend/src/app/(auth)/invite/page.tsx` (placeholder)
  - `formix-frontend/src/app/(public)/forms/[publicToken]/page.tsx` (placeholder)
- **Arquivos modificados:**
  - Páginas de auth movidas de `src/app/*` para `src/app/(auth)/*`
  - `formix-frontend/src/app/(auth)/login/page.tsx` (redirect /forms em vez de /dashboard)
- **Verificação:** typecheck OK, build OK

### features/start US-046: Página 404
- **Status:** Concluído
- **Data:** 2026-03-18
- **Arquivos criados:**
  - `formix-frontend/src/app/not-found.tsx`
  - `formix-frontend/src/app/not-found.module.css`
- **Verificação final:** typecheck OK, build OK

## Fase 4: Gestão de Usuários

### features/start US-017: Perfil do Usuário — Backend
- **Status:** Concluído
- **Data:** 2026-03-18
- **Arquivos criados:**
  - `formix-backend/src/modules/users/domain/usecases/get-profile.usecase.ts`
  - `formix-backend/src/modules/users/domain/usecases/get-profile.usecase.spec.ts`
  - `formix-backend/src/modules/users/domain/usecases/update-profile.usecase.ts`
  - `formix-backend/src/modules/users/domain/usecases/update-profile.usecase.spec.ts`
  - `formix-backend/src/modules/users/infra/controllers/get-profile-response.dto.ts`
  - `formix-backend/src/modules/users/infra/controllers/update-profile.dto.ts`
  - `formix-backend/src/modules/users/infra/controllers/users.controller.ts`
  - `formix-backend/src/modules/users/infra/controllers/users.controller.test.ts`
- **Arquivos modificados:**
  - `formix-backend/src/modules/users/users.module.ts`
- **Verificação:** typecheck OK, testes OK (8 unit + 6 integration)

### features/start US-018: Perfil do Usuário — Frontend
- **Status:** Concluído
- **Data:** 2026-03-18
- **Arquivos criados:**
  - `formix-frontend/src/services/users/users.types.ts`
  - `formix-frontend/src/services/users/users.service.ts`
- **Arquivos modificados:**
  - `formix-frontend/src/app/(app)/settings/profile/page.tsx`
- **Verificação:** typecheck OK, build OK

### features/start US-019: Listar Membros da Organização — Backend
- **Status:** Concluído
- **Data:** 2026-03-18
- **Arquivos criados:**
  - `formix-backend/src/modules/organizations/domain/usecases/list-members.usecase.ts`
  - `formix-backend/src/modules/organizations/domain/usecases/list-members.usecase.spec.ts`
  - `formix-backend/src/modules/organizations/infra/controllers/list-members-response.dto.ts`
  - `formix-backend/src/modules/organizations/infra/controllers/organizations.controller.ts`
  - `formix-backend/src/modules/organizations/infra/controllers/organizations.controller.test.ts`
- **Arquivos modificados:**
  - `formix-backend/src/modules/organizations/organizations.module.ts`
- **Verificação:** typecheck OK, testes OK (3 unit + 4 integration)

### features/start US-020: Listar Membros — Frontend
- **Status:** Concluído
- **Data:** 2026-03-18
- **Arquivos criados:**
  - `formix-frontend/src/services/organizations/organizations.types.ts`
  - `formix-frontend/src/services/organizations/organizations.service.ts`
  - `formix-frontend/src/modules/MembersTable/MembersTable.tsx`
  - `formix-frontend/src/modules/MembersTable/MembersTable.module.css`
  - `formix-frontend/src/modules/MembersTable/RoleBadge.tsx`
- **Arquivos modificados:**
  - `formix-frontend/src/app/(app)/settings/members/page.tsx`
- **Verificação:** typecheck OK, build OK

### features/start US-021: Remover Membro — Backend
- **Status:** Concluído
- **Data:** 2026-03-18
- **Arquivos criados:**
  - `formix-backend/src/modules/organizations/domain/usecases/remove-member.usecase.ts`
  - `formix-backend/src/modules/organizations/domain/usecases/remove-member.usecase.spec.ts`
- **Arquivos modificados:**
  - `formix-backend/src/modules/organizations/infra/controllers/organizations.controller.ts`
  - `formix-backend/src/modules/organizations/infra/controllers/organizations.controller.test.ts`
  - `formix-backend/src/modules/organizations/organizations.module.ts`
- **Verificação:** typecheck OK, testes OK (5 unit + 9 integration total)

### features/start US-022: Remover Membro — Frontend
- **Status:** Concluído
- **Data:** 2026-03-18
- **Arquivos criados:**
  - `formix-frontend/src/modules/MembersTable/RemoveMemberModal.tsx`
  - `formix-frontend/src/modules/MembersTable/RemoveMemberModal.module.css`
- **Arquivos modificados:**
  - `formix-frontend/src/services/organizations/organizations.service.ts`
  - `formix-frontend/src/app/(app)/settings/members/page.tsx`
- **Verificação:** typecheck OK, build OK

## Fase 5: Convites

### features/start US-023: Schema MongoDB — Invitations
- **Status:** Concluído
- **Data:** 2026-03-19
- **Arquivos criados:**
  - `formix-backend/src/modules/invitations/domain/aggregate/value-objects/invitation-id.vo.ts`
  - `formix-backend/src/modules/invitations/domain/aggregate/value-objects/invitation-status.vo.ts`
  - `formix-backend/src/modules/invitations/domain/aggregate/invitation.aggregate.ts`
  - `formix-backend/src/modules/invitations/domain/aggregate/invitation.aggregate.spec.ts`
  - `formix-backend/src/modules/invitations/domain/repositories/invitation.repository.ts`
  - `formix-backend/src/modules/invitations/infra/schemas/invitation.schema.ts`
  - `formix-backend/src/modules/invitations/infra/repositories/mongo-invitation.repository.ts`
  - `formix-backend/src/modules/invitations/infra/repositories/mongo-invitation.repository.test.ts`
  - `formix-backend/src/modules/invitations/invitations.module.ts`
- **Verificação:** typecheck OK, testes OK (13 unit + 9 integration)

### features/start US-024: Criar Convite — Backend
- **Status:** Concluído
- **Data:** 2026-03-19
- **Arquivos criados:**
  - `formix-backend/src/modules/invitations/domain/usecases/create-invitation.usecase.ts`
  - `formix-backend/src/modules/invitations/domain/usecases/create-invitation.usecase.spec.ts`
  - `formix-backend/src/modules/invitations/infra/controllers/create-invitation.dto.ts`
  - `formix-backend/src/modules/invitations/infra/controllers/invitation-response.dto.ts`
- **Verificação:** typecheck OK, testes OK (5 unit)

### features/start US-025: Aceitar Convite — Backend
- **Status:** Concluído
- **Data:** 2026-03-19
- **Arquivos criados:**
  - `formix-backend/src/modules/invitations/domain/usecases/accept-invitation.usecase.ts`
  - `formix-backend/src/modules/invitations/domain/usecases/accept-invitation.usecase.spec.ts`
  - `formix-backend/src/modules/invitations/infra/controllers/accept-invitation.dto.ts`
- **Verificação:** typecheck OK, testes OK (6 unit)

### features/start US-026: Listar, Reenviar e Cancelar Convites — Backend
- **Status:** Concluído
- **Data:** 2026-03-19
- **Arquivos criados:**
  - `formix-backend/src/modules/invitations/domain/usecases/list-invitations.usecase.ts`
  - `formix-backend/src/modules/invitations/domain/usecases/list-invitations.usecase.spec.ts`
  - `formix-backend/src/modules/invitations/domain/usecases/resend-invitation.usecase.ts`
  - `formix-backend/src/modules/invitations/domain/usecases/resend-invitation.usecase.spec.ts`
  - `formix-backend/src/modules/invitations/domain/usecases/cancel-invitation.usecase.ts`
  - `formix-backend/src/modules/invitations/domain/usecases/cancel-invitation.usecase.spec.ts`
  - `formix-backend/src/modules/invitations/infra/controllers/invitations.controller.ts`
  - `formix-backend/src/modules/invitations/infra/controllers/invitations.controller.test.ts`
- **Arquivos modificados:**
  - `formix-backend/src/modules/invitations/invitations.module.ts`
  - `formix-backend/src/app.module.ts`
- **Verificação:** typecheck OK, testes OK (11 unit + 17 integration)

### features/start US-027: Tela de Convites — Frontend
- **Status:** Concluído
- **Data:** 2026-03-19
- **Arquivos criados:**
  - `formix-frontend/src/modules/InvitationsSection/InvitationsSection.tsx`
  - `formix-frontend/src/modules/InvitationsSection/InviteModal.tsx`
  - `formix-frontend/src/services/invitations/invitations.service.ts`
  - `formix-frontend/src/services/invitations/invitations.types.ts`
- **Arquivos modificados:**
  - `formix-frontend/src/app/(app)/settings/members/page.tsx`
- **Verificação:** typecheck OK, build OK

### features/start US-028: Tela de Aceite de Convite — Frontend
- **Status:** Concluído
- **Data:** 2026-03-19
- **Arquivos criados:**
  - `formix-frontend/src/app/(auth)/invite/page.tsx`
- **Arquivos modificados:**
  - `formix-frontend/src/services/invitations/invitations.service.ts`
- **Verificação:** typecheck OK, build OK

## Fase 6: Formulários

### features/start US-029: Schemas MongoDB — Forms e Questions
- **Status:** Concluído
- **Data:** 2026-03-19
- **Arquivos criados:**
  - `formix-backend/src/modules/forms/domain/aggregate/value-objects/form-id.vo.ts`
  - `formix-backend/src/modules/forms/domain/aggregate/value-objects/question-id.vo.ts`
  - `formix-backend/src/modules/forms/domain/aggregate/value-objects/form-status.vo.ts`
  - `formix-backend/src/modules/forms/domain/aggregate/value-objects/question-type.vo.ts`
  - `formix-backend/src/modules/forms/domain/aggregate/value-objects/public-token.vo.ts`
  - `formix-backend/src/modules/forms/domain/aggregate/question.entity.ts`
  - `formix-backend/src/modules/forms/domain/aggregate/question.entity.spec.ts`
  - `formix-backend/src/modules/forms/domain/aggregate/form.aggregate.ts`
  - `formix-backend/src/modules/forms/domain/aggregate/form.aggregate.spec.ts`
  - `formix-backend/src/modules/forms/domain/repositories/form.repository.ts`
  - `formix-backend/src/modules/forms/domain/repositories/question.repository.ts`
  - `formix-backend/src/modules/forms/infra/schemas/form.schema.ts`
  - `formix-backend/src/modules/forms/infra/schemas/question.schema.ts`
  - `formix-backend/src/modules/forms/infra/repositories/mongo-form.repository.ts`
  - `formix-backend/src/modules/forms/infra/repositories/mongo-form.repository.test.ts`
  - `formix-backend/src/modules/forms/infra/repositories/mongo-question.repository.ts`
  - `formix-backend/src/modules/forms/infra/repositories/mongo-question.repository.test.ts`
  - `formix-backend/src/modules/forms/forms.module.ts`
- **Verificação:** typecheck OK, testes OK (21 unit + 15 integration)

### features/start US-030: CRUD de Formulários — Backend
- **Status:** Concluído
- **Data:** 2026-03-19
- **Arquivos criados:**
  - `formix-backend/src/modules/forms/domain/usecases/create-form.usecase.ts`
  - `formix-backend/src/modules/forms/domain/usecases/list-forms.usecase.ts`
  - `formix-backend/src/modules/forms/domain/usecases/get-form.usecase.ts`
  - `formix-backend/src/modules/forms/domain/usecases/update-form.usecase.ts`
  - `formix-backend/src/modules/forms/domain/usecases/delete-form.usecase.ts`
  - `formix-backend/src/modules/forms/infra/controllers/create-form.dto.ts`
  - `formix-backend/src/modules/forms/infra/controllers/update-form.dto.ts`
  - `formix-backend/src/modules/forms/infra/controllers/form-response.dto.ts`
  - `formix-backend/src/modules/forms/infra/controllers/forms.controller.ts`
  - `formix-backend/src/modules/forms/infra/controllers/forms.controller.test.ts`
- **Arquivos modificados:**
  - `formix-backend/src/modules/forms/forms.module.ts`
- **Verificação:** typecheck OK, testes OK (17 unit + 11 integration)

### features/start US-031: Gestão de Perguntas — Backend
- **Status:** Concluído
- **Data:** 2026-03-19
- **Arquivos criados:**
  - `formix-backend/src/modules/forms/domain/usecases/add-question.usecase.ts`
  - `formix-backend/src/modules/forms/domain/usecases/update-question.usecase.ts`
  - `formix-backend/src/modules/forms/domain/usecases/remove-question.usecase.ts`
  - `formix-backend/src/modules/forms/domain/usecases/reorder-questions.usecase.ts`
  - `formix-backend/src/modules/forms/infra/controllers/add-question.dto.ts`
  - `formix-backend/src/modules/forms/infra/controllers/update-question.dto.ts`
  - `formix-backend/src/modules/forms/infra/controllers/reorder-questions.dto.ts`
- **Arquivos modificados:**
  - `formix-backend/src/modules/forms/infra/controllers/forms.controller.ts`
  - `formix-backend/src/modules/forms/infra/controllers/forms.controller.test.ts`
  - `formix-backend/src/modules/forms/forms.module.ts`
- **Verificação:** typecheck OK, testes OK (15 unit + 5 integration)

### features/start US-032: Publicar Formulário — Backend
- **Status:** Concluído
- **Data:** 2026-03-19
- **Arquivos criados:**
  - `formix-backend/src/modules/forms/domain/usecases/publish-form.usecase.ts`
  - `formix-backend/src/modules/forms/infra/controllers/publish-form-response.dto.ts`
- **Arquivos modificados:**
  - `formix-backend/src/modules/forms/infra/controllers/forms.controller.ts`
  - `formix-backend/src/modules/forms/infra/controllers/forms.controller.test.ts`
  - `formix-backend/src/modules/forms/forms.module.ts`
- **Verificação:** typecheck OK, testes OK (4 unit + 3 integration)

### features/start US-033: Fechar Formulário — Backend
- **Status:** Concluído
- **Data:** 2026-03-19
- **Arquivos criados:**
  - `formix-backend/src/modules/forms/domain/usecases/close-form.usecase.ts`
- **Arquivos modificados:**
  - `formix-backend/src/modules/forms/infra/controllers/forms.controller.ts`
  - `formix-backend/src/modules/forms/infra/controllers/forms.controller.test.ts`
  - `formix-backend/src/modules/forms/forms.module.ts`
- **Verificação:** typecheck OK, testes OK (3 unit + 2 integration)

### features/start US-034: Lista de Formulários — Frontend
- **Status:** Concluído
- **Data:** 2026-03-19
- **Arquivos criados:**
  - `formix-frontend/src/services/forms/forms.types.ts`
  - `formix-frontend/src/services/forms/forms.service.ts`
  - `formix-frontend/src/modules/FormCard/FormCard.tsx`
  - `formix-frontend/src/modules/FormCard/StatusBadge.tsx`
- **Arquivos modificados:**
  - `formix-frontend/src/app/(app)/forms/page.tsx`
- **Verificação:** typecheck OK, build OK

### features/start US-035: FormBuilder — Criar/Editar Formulário (Frontend)
- **Status:** Concluído
- **Data:** 2026-03-19
- **Arquivos criados:**
  - `formix-frontend/src/hooks/useFormBuilder.ts`
  - `formix-frontend/src/modules/FormBuilder/FormBuilder.tsx`
  - `formix-frontend/src/modules/FormBuilder/QuestionList.tsx`
  - `formix-frontend/src/modules/FormBuilder/QuestionEditor.tsx`
  - `formix-frontend/src/modules/FormBuilder/QuestionTypeSelector.tsx`
  - `formix-frontend/src/modules/FormBuilder/FormSettings.tsx`
- **Arquivos modificados:**
  - `formix-frontend/src/app/(app)/forms/new/page.tsx`
  - `formix-frontend/src/app/(app)/forms/[id]/edit/page.tsx`
- **Verificação:** typecheck OK, build OK
