# Plano: Fase 4 — Gestão de Usuários

## Contexto

A Fase 3 entregou o layout base, componentes de input e sistema de rotas. A Fase 4 implementa **gestão de usuários e membros da organização**: perfil do usuário (visualização e edição), listagem de membros e remoção de membros — tanto backend quanto frontend.

Cobre US-017 a US-022. As USs de backend precedem as de frontend. Ao final de cada US concluída, atualizar `docs/features/progress.md`.

---

## Novos Pacotes a Instalar

Nenhum pacote adicional necessário nesta fase.

## Variáveis de Ambiente

Nenhuma nova variável de ambiente nesta fase.

---

## Ordem de Execução

```
US-017 (Perfil Backend) ──▶ US-018 (Perfil Frontend)

US-019 (Listar Membros Backend) ──▶ US-020 (Listar Membros Frontend)
                                 ──▶ US-021 (Remover Membro Backend) ──▶ US-022 (Remover Membro Frontend)

(US-017 e US-019 são independentes entre si — podem rodar em paralelo)
```

---

## Estrutura de Arquivos

```
formix-backend/src/modules/
  users/
    domain/
      usecases/
        get-profile.usecase.ts + .spec.ts          ← US-017
        update-profile.usecase.ts + .spec.ts       ← US-017
    infra/
      controllers/
        users.controller.ts + .test.ts             ← US-017
        get-profile-response.dto.ts                ← US-017
        update-profile.dto.ts                      ← US-017
      users.module.ts                              ← US-017

  organizations/
    domain/
      usecases/
        list-members.usecase.ts + .spec.ts         ← US-019
        remove-member.usecase.ts + .spec.ts        ← US-021
    infra/
      controllers/
        organizations.controller.ts + .test.ts    ← US-019, US-021
        list-members-response.dto.ts               ← US-019
      organizations.module.ts                      ← US-019, US-021

formix-frontend/src/
  app/(app)/
    settings/
      profile/page.tsx                             ← US-018
      members/page.tsx                             ← US-020, US-022
  services/
    users/
      users.service.ts                             ← US-018
      users.types.ts                               ← US-018
    organizations/
      organizations.service.ts                     ← US-020, US-022
      organizations.types.ts                       ← US-020
  modules/
    MembersTable/
      MembersTable.tsx                             ← US-020
      RemoveMemberModal.tsx                        ← US-022
```

---

## Padrão de retorno

Todos os usecases retornam `Output<T>` — **nunca lançam exceções**. Controllers convertem `Output.fail()` em HTTP exceptions.

---

## Verificação da Fase Completa

- [ ] `npm run typecheck` passa no backend
- [ ] Todos os `.spec.ts` passam
- [ ] Todos os `.test.ts` passam
- [ ] `GET /users/me` retorna dados do usuário logado (sem passwordHash)
- [ ] `PATCH /users/me` atualiza nome e/ou senha
- [ ] `GET /organizations/:orgId/members` retorna lista de membros
- [ ] `DELETE /organizations/:orgId/members/:userId` remove membro
- [ ] Admin não pode se remover se for único admin
- [ ] Swagger documenta todos os endpoints
- [ ] `npm run typecheck` passa no frontend
- [ ] `npm run build` sucesso no frontend
- [ ] Página de perfil exibe e salva dados
- [ ] Página de membros lista membros e permite remoção com confirmação

---

## Arquivos Críticos de Referência

- `docs/code-patterns/backend-patterns.md`
- `docs/domain-rules/users.md`
- `docs/domain-rules/organizations.md`
- `docs/data-modeling/collections.md`
- `formix-backend/src/modules/users/` — UserAggregate, schemas, repositórios existentes
