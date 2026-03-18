# US-027: Tela de Convites — Frontend

## Metadados

| Campo | Valor |
|---|---|
| **Feature** | Fase 5: Convites |
| **Status** | Pendente |
| **Depende de** | US-024 (Criar Convite Backend), US-026 (Listar/Reenviar/Cancelar Backend), US-020 (Membros Frontend — página já existe) |
| **Bloqueia** | — |

## Contexto

Adiciona uma seção de convites à página `/settings/members`. Admin vê lista de convites pendentes com botões de reenviar e cancelar, e um botão "Convidar" que abre modal para inserir email do convidado. Usa `useAuth` para verificar role admin antes de exibir controles.

## Arquivos

### Criar

| Arquivo | Descrição |
|---|---|
| `formix-frontend/src/services/invitations/invitations.service.ts` | `listInvitations(orgId)`, `createInvitation(orgId, email)`, `resendInvitation(orgId, invitationId)`, `cancelInvitation(orgId, invitationId)` |
| `formix-frontend/src/services/invitations/invitations.types.ts` | `Invitation { id, email, role, status, expiresAt, createdAt }` |
| `formix-frontend/src/modules/InvitationsSection/InvitationsSection.tsx` | Lista convites pendentes com botões Reenviar e Cancelar (com confirmação). Loading states. |
| `formix-frontend/src/modules/InvitationsSection/InviteModal.tsx` | Modal com campo de email, botão "Enviar convite". Validação de email antes de submit |
| `formix-frontend/src/modules/InvitationsSection/InvitationsSection.module.css` | Estilos |

### Modificar

| Arquivo | O que muda |
|---|---|
| `formix-frontend/src/app/(app)/settings/members/page.tsx` | Adicionar `<InvitationsSection>` abaixo da tabela de membros (visível apenas para admins) |

## Passos de Implementação

1. [impl] `invitations.types.ts` + `invitations.service.ts`
2. [impl] `InviteModal.tsx` — modal de criação
3. [impl] `InvitationsSection.tsx` — lista + ações
4. [impl] Integrar na `members/page.tsx`

## Critérios de Aceitação

- [ ] Seção de convites visível apenas para admins
- [ ] Lista convites com: email, status, data de expiração
- [ ] Botão "Convidar" abre modal com campo de email
- [ ] Modal valida email antes de enviar
- [ ] Botão "Reenviar" reenvia convite e atualiza lista
- [ ] Botão "Cancelar" exibe confirmação antes de cancelar
- [ ] Toast de feedback para cada ação (sucesso/erro)
- [ ] Loading state em cada ação
- [ ] `npm run typecheck` passa
- [ ] `npm run build` sucesso

## Próximas USs

- **US-028** — Tela de Aceite Frontend
