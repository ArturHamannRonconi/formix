# US-017: Perfil do Usuário — Backend

## Metadados

| Campo | Valor |
|---|---|
| **Feature** | Fase 4: Gestão de Usuários |
| **Status** | Pendente |
| **Depende de** | US-014 (JWT Guard — rotas protegidas) |
| **Bloqueia** | US-018 (Perfil Frontend) |

## Contexto

Implementa `GET /users/me` e `PATCH /users/me`. O endpoint GET retorna os dados do usuário logado sem o `passwordHash`. O PATCH permite atualizar `name` e/ou `password` (email é imutável). A lógica usa `userId` extraído do JWT pelo `JwtAuthGuard`. O módulo `users` já tem `UserAggregate`, repositório e schema — esta US adiciona usecases e controller.

## Arquivos

### Criar

| Arquivo | Descrição |
|---|---|
| `formix-backend/src/modules/users/domain/usecases/get-profile.usecase.ts` | Input: `{ userId }`. Busca user por id. Retorna `Output.ok({ id, name, email, emailConfirmed })` sem passwordHash |
| `formix-backend/src/modules/users/domain/usecases/get-profile.usecase.spec.ts` | Testa: user encontrado retorna perfil sem passwordHash, user não encontrado retorna `Output.fail` |
| `formix-backend/src/modules/users/domain/usecases/update-profile.usecase.ts` | Input: `{ userId, name?, newPassword?, currentPassword? }`. Se `newPassword`: valida `currentPassword` via `user.passwordHash.compare()`. Atualiza nome e/ou password. Retorna `Output.ok({ updated: true })` |
| `formix-backend/src/modules/users/domain/usecases/update-profile.usecase.spec.ts` | Testa: atualizar nome, atualizar senha com senha atual correta, rejeitar se senha atual incorreta, não alterar email |
| `formix-backend/src/modules/users/infra/controllers/users.controller.ts` | `GET /users/me` com `@CurrentUser()` → `GetProfileUseCase`. `PATCH /users/me` → `UpdateProfileUseCase`. Swagger: `@ApiTags('users')`, `@ApiBearerAuth()` |
| `formix-backend/src/modules/users/infra/controllers/users.controller.test.ts` | Testes de integração para GET e PATCH /users/me |
| `formix-backend/src/modules/users/infra/controllers/get-profile-response.dto.ts` | `{ id, name, email, emailConfirmed }` com `@ApiProperty` |
| `formix-backend/src/modules/users/infra/controllers/update-profile.dto.ts` | `{ name?: string, currentPassword?: string, newPassword?: string }` com validações e `@ApiProperty` |

### Modificar

| Arquivo | O que muda |
|---|---|
| `formix-backend/src/modules/users/users.module.ts` | Adicionar `GetProfileUseCase`, `UpdateProfileUseCase`, `UsersController` como providers/controllers |

## Passos de Implementação (TDD)

1. [teste] `get-profile.usecase.spec.ts` — Red
2. [impl] `get-profile.usecase.ts` — Green
3. [teste] `update-profile.usecase.spec.ts` — Red
4. [impl] `update-profile.usecase.ts` — Green
5. [impl] `get-profile-response.dto.ts` + `update-profile.dto.ts`
6. [teste] `users.controller.test.ts` — Red
7. [impl] `users.controller.ts` — Green
8. Atualizar `users.module.ts`

## Critérios de Aceitação

- [ ] `GET /users/me` retorna `{ id, name, email, emailConfirmed }` — sem `passwordHash`
- [ ] `PATCH /users/me` com `{ name }` atualiza nome
- [ ] `PATCH /users/me` com `{ currentPassword, newPassword }` atualiza senha (hash bcrypt)
- [ ] `PATCH /users/me` com senha atual incorreta retorna 400
- [ ] Email não pode ser alterado via PATCH (campo ignorado se enviado)
- [ ] Rotas protegidas retornam 401 sem token
- [ ] Usecases retornam `Output<T>` — nenhum `throw` interno
- [ ] Todos os `.spec.ts` passam
- [ ] Todos os `.test.ts` passam
- [ ] `npm run typecheck` passa
- [ ] Swagger documenta `GET /users/me` e `PATCH /users/me`

## Próximas USs

- **US-018** — Perfil Frontend (consome estes endpoints)
