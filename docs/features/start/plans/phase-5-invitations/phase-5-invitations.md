# Plano: Fase 5 — Convites

## Contexto

A Fase 4 entregou gestão de perfil e membros. A Fase 5 implementa o **sistema de convites**: schema de invitations, criação/aceitação/gestão de convites no backend e telas de gerenciamento e aceite no frontend.

Cobre US-023 a US-028. O fluxo completo: admin cria convite → email enviado → convidado acessa link → aceita convite (cria conta se necessário). Ao final de cada US concluída, atualizar `docs/features/progress.md`.

---

## Novos Pacotes a Instalar

Nenhum pacote adicional necessário nesta fase.

## Variáveis de Ambiente

```env
INVITATION_EXPIRES_IN=604800000   # 7 dias em ms
```

---

## Ordem de Execução

```
US-023 (Schema Invitations) ──▶ US-024 (Criar Convite Backend)
                             ──▶ US-025 (Aceitar Convite Backend)
                             ──▶ US-026 (Listar/Reenviar/Cancelar Backend)

US-024, US-025, US-026 podem rodar em paralelo após US-023.

US-027 (Tela Convites Frontend) ← após US-024 + US-026
US-028 (Tela Aceite Frontend)   ← após US-025
```

---

## Estrutura de Arquivos

```
formix-backend/src/modules/invitations/
  domain/
    aggregate/
      invitation.aggregate.ts + .spec.ts         ← US-023
      value-objects/
        invitation-id.vo.ts                       ← US-023
        invitation-status.vo.ts                   ← US-023
    usecases/
      create-invitation.usecase.ts + .spec.ts     ← US-024
      accept-invitation.usecase.ts + .spec.ts     ← US-025
      list-invitations.usecase.ts + .spec.ts      ← US-026
      resend-invitation.usecase.ts + .spec.ts     ← US-026
      cancel-invitation.usecase.ts + .spec.ts     ← US-026
    repositories/
      invitation.repository.ts                    ← US-023
  infra/
    schemas/
      invitation.schema.ts                        ← US-023
    repositories/
      mongo-invitation.repository.ts + .test.ts  ← US-023
    controllers/
      invitations.controller.ts + .test.ts       ← US-024, US-025, US-026
      create-invitation.dto.ts                    ← US-024
      accept-invitation.dto.ts                    ← US-025
  invitations.module.ts                           ← US-023

formix-frontend/src/
  services/
    invitations/
      invitations.service.ts                      ← US-027, US-028
      invitations.types.ts                        ← US-027
  modules/
    InvitationsSection/
      InvitationsSection.tsx                      ← US-027
      InviteModal.tsx                             ← US-027
  app/(app)/
    settings/members/page.tsx                    ← US-027 (adiciona seção de convites)
  app/(auth)/
    invite/page.tsx                               ← US-028
```

---

## Padrão: Invitation como Aggregate

`InvitationAggregate` encapsula o estado do convite:
- `accept()` — muda status para `accepted`, impede reutilização
- `expire()` — muda status para `expired`
- `cancel()` — muda status para `expired`/`cancelled`
- `isExpired(): boolean` — verifica `expiresAt < now`
- `isPending(): boolean` — verifica `status === 'pending'`

Token de convite: gerado como UUID, armazenado como hash SHA-256 (mesmo padrão dos refresh tokens).

---

## Verificação da Fase Completa

- [ ] `npm run typecheck` passa no backend
- [ ] Todos os `.spec.ts` passam
- [ ] Todos os `.test.ts` passam
- [ ] Admin cria convite → email enviado (log no console em dev)
- [ ] Convidado sem conta acessa link → cria conta → login automático
- [ ] Convidado com conta acessa link → aceita → login automático
- [ ] Admin pode listar, reenviar e cancelar convites
- [ ] Convite duplicado (mesmo email + org + pending) é rejeitado
- [ ] Swagger documenta todos os endpoints
- [ ] `npm run typecheck` passa no frontend
- [ ] `npm run build` sucesso

---

## Arquivos Críticos de Referência

- `docs/code-patterns/backend-patterns.md`
- `docs/domain-rules/invitations.md`
- `docs/data-modeling/collections.md`
- `formix-backend/src/modules/users/` — UserAggregate (referência para Membership)
- `formix-backend/src/shared/` — IEmailService, Output
