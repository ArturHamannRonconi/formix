# US-022: Remover Membro — Frontend

## Metadados

| Campo | Valor |
|---|---|
| **Feature** | Fase 4: Gestão de Usuários |
| **Status** | Pendente |
| **Depende de** | US-021 (Remover Membro Backend), US-020 (Listar Membros Frontend — tabela já existe) |
| **Bloqueia** | — |

## Contexto

Adiciona o modal de confirmação de remoção de membro na página `/settings/members`. Ao clicar "Remover" na tabela, um dialog exibe o nome do membro e confirma a ação. Após remoção bem-sucedida, a lista é atualizada e um toast é exibido.

## Arquivos

### Criar

| Arquivo | Descrição |
|---|---|
| `formix-frontend/src/modules/MembersTable/RemoveMemberModal.tsx` | Modal de confirmação: exibe nome do membro, botão "Cancelar" e botão "Remover" com loading state |
| `formix-frontend/src/modules/MembersTable/RemoveMemberModal.module.css` | Estilos do modal |

### Modificar

| Arquivo | O que muda |
|---|---|
| `formix-frontend/src/services/organizations/organizations.service.ts` | Adicionar `removeMember(orgId, userId): Promise<void>` |
| `formix-frontend/src/app/(app)/settings/members/page.tsx` | Integrar `RemoveMemberModal`: estado `memberToRemove`, abrir modal ao clicar "Remover", chamar service, atualizar lista, exibir toast |
| `formix-frontend/src/modules/MembersTable/MembersTable.tsx` | Receber `onRemove(userId)` como prop e chamar ao clicar "Remover" |

## Passos de Implementação

1. [impl] Adicionar `removeMember` ao `organizations.service.ts`
2. [impl] `RemoveMemberModal.tsx` + estilos
3. [impl] Integrar modal na `members/page.tsx` com estado e toast

## Critérios de Aceitação

- [ ] Clicar "Remover" na tabela abre modal com nome do membro
- [ ] Modal tem botão "Cancelar" (fecha modal) e "Remover" (executa ação)
- [ ] Botão "Remover" tem loading state durante request
- [ ] Após remoção: modal fecha, lista é recarregada, toast de sucesso exibido
- [ ] Erro da API exibido como toast de erro (ex: "Não é possível remover o único admin")
- [ ] Modal é acessível: foco armadilhado dentro, fecha com Escape, role="dialog"
- [ ] `npm run typecheck` passa
- [ ] `npm run build` sucesso

## Próximas USs

- Fase 5: US-023 (Schema Invitations)
