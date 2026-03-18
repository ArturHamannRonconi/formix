# US-021: Remover Membro — Backend

## Metadados

| Campo | Valor |
|---|---|
| **Feature** | Fase 4: Gestão de Usuários |
| **Status** | Pendente |
| **Depende de** | US-019 (Listar Membros Backend — `OrganizationsController` já existe) |
| **Bloqueia** | US-022 (Remover Membro Frontend) |

## Contexto

Implementa `DELETE /organizations/:orgId/members/:userId`. Apenas admins podem remover membros. Um admin não pode se remover se for o único admin da organização. A remoção deleta a `Membership` (documento na coleção `memberships`) mas não o `User` (um usuário pode pertencer a múltiplas organizações).

## Arquivos

### Criar

| Arquivo | Descrição |
|---|---|
| `formix-backend/src/modules/organizations/domain/usecases/remove-member.usecase.ts` | Input: `{ organizationId, requestingUserId, targetUserId }`. Verifica que requesting é admin. Verifica que se targetUser é o único admin, rejeita. Remove membership via `IMembershipRepository.delete`. Retorna `Output.ok({ removed: true })` |
| `formix-backend/src/modules/organizations/domain/usecases/remove-member.usecase.spec.ts` | Testa: admin remove membro, admin não pode remover a si mesmo se único admin, não-admin é rejeitado, membro de outra org é rejeitado |

### Modificar

| Arquivo | O que muda |
|---|---|
| `formix-backend/src/modules/organizations/infra/controllers/organizations.controller.ts` | Adicionar `DELETE /organizations/:orgId/members/:userId` com `@Roles('admin')` |
| `formix-backend/src/modules/organizations/infra/controllers/organizations.controller.test.ts` | Adicionar testes para DELETE |
| `formix-backend/src/modules/organizations/organizations.module.ts` | Adicionar `RemoveMemberUseCase` |

## Regras de Negócio

1. Verificar que `token.organizationId === orgId` (multi-tenancy)
2. Verificar que `token.role === 'admin'` (apenas admins removem)
3. Contar admins da org — se `targetUserId === requestingUserId` e count de admins === 1, rejeitar com mensagem "Cannot remove the last admin"
4. Deletar membership `{ userId: targetUserId, organizationId }`

## Passos de Implementação (TDD)

1. [teste] `remove-member.usecase.spec.ts` — Red
2. [impl] `remove-member.usecase.ts` — Green
3. [teste] Expandir `organizations.controller.test.ts` com DELETE
4. [impl] Adicionar DELETE ao `organizations.controller.ts`
5. Atualizar `organizations.module.ts`

## Critérios de Aceitação

- [ ] `DELETE /organizations/:orgId/members/:userId` remove a membership
- [ ] Retorna 403 se requester não é admin
- [ ] Retorna 400 se tentar remover o único admin
- [ ] Retorna 403 se `orgId` ≠ `organizationId` do token
- [ ] Retorna 404 se membership não encontrada
- [ ] User não é deletado — apenas a membership
- [ ] Usecases retornam `Output<T>` — nenhum `throw` interno
- [ ] Todos os `.spec.ts` passam
- [ ] Todos os `.test.ts` passam
- [ ] `npm run typecheck` passa
- [ ] Swagger documenta o endpoint

## Próximas USs

- **US-022** — Remover Membro Frontend
