# US-019: Listar Membros da Organização — Backend

## Metadados

| Campo | Valor |
|---|---|
| **Feature** | Fase 4: Gestão de Usuários |
| **Status** | Pendente |
| **Depende de** | US-014 (JWT Guard), US-016 (Schemas Users/Organizations/Memberships — já implementado na Fase 1) |
| **Bloqueia** | US-020 (Listar Membros Frontend), US-021 (Remover Membro Backend) |

## Contexto

Implementa `GET /organizations/:orgId/members` que retorna todos os memberships da organização com dados de usuário (nome, email, role, data de entrada). O módulo `organizations` ainda não tem usecases nem controller — esta US os cria. O acesso é restrito à própria organização do token JWT (`organizationId` do token deve ser igual a `:orgId`). Qualquer membro (admin ou member) pode listar.

## Arquivos

### Criar

| Arquivo | Descrição |
|---|---|
| `formix-backend/src/modules/organizations/domain/usecases/list-members.usecase.ts` | Input: `{ organizationId }`. Busca memberships + dados de usuário via repositórios. Retorna `Output.ok({ members: MemberDto[] })` |
| `formix-backend/src/modules/organizations/domain/usecases/list-members.usecase.spec.ts` | Testa: lista membros da org, não retorna membros de outra org |
| `formix-backend/src/modules/organizations/infra/controllers/organizations.controller.ts` | `GET /organizations/:orgId/members`. Valida que `orgId === token.organizationId`. `@ApiTags('organizations')`, `@ApiBearerAuth()` |
| `formix-backend/src/modules/organizations/infra/controllers/organizations.controller.test.ts` | Testes de integração |
| `formix-backend/src/modules/organizations/infra/controllers/list-members-response.dto.ts` | `MemberDto { userId, name, email, role, joinedAt }` com `@ApiProperty` |

### Modificar

| Arquivo | O que muda |
|---|---|
| `formix-backend/src/modules/organizations/organizations.module.ts` | Adicionar `ListMembersUseCase`, `OrganizationsController`. Importar `UsersModule` para `IUserRepository` |

## Resposta do Endpoint

```json
{
  "members": [
    {
      "userId": "uuid",
      "name": "João Silva",
      "email": "joao@example.com",
      "role": "admin",
      "joinedAt": "2026-01-15T10:00:00.000Z"
    }
  ]
}
```

## Passos de Implementação (TDD)

1. [teste] `list-members.usecase.spec.ts` — Red
2. [impl] `list-members.usecase.ts` — Green
3. [impl] `list-members-response.dto.ts`
4. [teste] `organizations.controller.test.ts` — Red
5. [impl] `organizations.controller.ts` — Green
6. Atualizar `organizations.module.ts`

## Critérios de Aceitação

- [ ] `GET /organizations/:orgId/members` retorna lista com `userId`, `name`, `email`, `role`, `joinedAt`
- [ ] Retorna 403 se `orgId` do path ≠ `organizationId` do token
- [ ] Retorna 401 sem token
- [ ] Qualquer membro (admin ou member) pode listar
- [ ] Não retorna `passwordHash` nem dados sensíveis
- [ ] Usecases retornam `Output<T>` — nenhum `throw` interno
- [ ] Todos os `.spec.ts` passam
- [ ] Todos os `.test.ts` passam
- [ ] `npm run typecheck` passa
- [ ] Swagger documenta o endpoint

## Próximas USs

- **US-020** — Listar Membros Frontend
- **US-021** — Remover Membro Backend
