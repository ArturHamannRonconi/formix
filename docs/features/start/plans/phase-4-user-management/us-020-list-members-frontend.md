# US-020: Listar Membros — Frontend

## Metadados

| Campo | Valor |
|---|---|
| **Feature** | Fase 4: Gestão de Usuários |
| **Status** | Pendente |
| **Depende de** | US-019 (Listar Membros Backend), US-036 (AppShell), US-045 (Rotas) |
| **Bloqueia** | US-022 (Remover Membro Frontend) |

## Contexto

Cria a página `/settings/members` com tabela de membros da organização. Exibe nome, email, role (com badge visual) e data de entrada. Botão "Convidar" visível apenas para admins (implementação do convite na Fase 5). Botão "Remover" por membro visível apenas para admins (modal de confirmação na US-022). Usa `useAuth` para verificar role do usuário logado.

## Arquivos

### Criar

| Arquivo | Descrição |
|---|---|
| `formix-frontend/src/services/organizations/organizations.service.ts` | `listMembers(orgId): Promise<Member[]>`. Usa `httpClient` |
| `formix-frontend/src/services/organizations/organizations.types.ts` | `Member { userId, name, email, role, joinedAt }` |
| `formix-frontend/src/app/(app)/settings/members/page.tsx` | Página de membros: carrega lista, renderiza tabela |
| `formix-frontend/src/modules/MembersTable/MembersTable.tsx` | Componente de tabela: colunas nome, email, role (badge), data. Botão "Remover" por linha (admin only) |
| `formix-frontend/src/modules/MembersTable/RoleBadge.tsx` | Badge visual para role: admin (azul), member (cinza) |
| `formix-frontend/src/modules/MembersTable/MembersTable.module.css` | Estilos da tabela |

### Modificar

| Arquivo | O que muda |
|---|---|
| `formix-frontend/src/app/(app)/settings/members/page.tsx` | Substituir placeholder pelo componente real |

## Passos de Implementação

1. [impl] `organizations.types.ts` — tipos
2. [impl] `organizations.service.ts` — `listMembers`
3. [impl] `RoleBadge.tsx` — badge visual
4. [impl] `MembersTable.tsx` — tabela com dados e botões condicionais
5. [impl] `members/page.tsx` — carrega dados, passa para tabela

## Critérios de Aceitação

- [ ] Página `/settings/members` carrega lista de membros ao montar
- [ ] Tabela exibe colunas: nome, email, role (badge colorido), data de entrada
- [ ] Badge admin: estilo diferenciado (ex: azul); badge member: cinza
- [ ] Botão "Convidar" visível apenas para admins
- [ ] Botão "Remover" visível por linha apenas para admins
- [ ] Admin não vê botão "Remover" na própria linha
- [ ] Loading state durante fetch da lista
- [ ] `npm run typecheck` passa
- [ ] `npm run build` sucesso

## Próximas USs

- **US-021** — Remover Membro Backend
- **US-022** — Remover Membro Frontend (modal de confirmação)
