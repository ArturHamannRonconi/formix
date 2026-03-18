# Plano: Fase 7 — Respostas

## Contexto

A Fase 6 entregou o sistema de formulários completo. A Fase 7 implementa a **coleta e visualização de respostas**: schemas de responses e response_emails, submissão anônima via link público, página pública de resposta e visualização de respostas no painel.

Cobre US-038 a US-042. O requisito de **anonimato total** é crítico: respostas são armazenadas sem qualquer identificador do respondente. O hash de email fica em coleção separada sem vínculo com a resposta. Ao final de cada US concluída, atualizar `docs/features/progress.md`.

---

## Novos Pacotes a Instalar

Nenhum pacote adicional necessário nesta fase.

## Variáveis de Ambiente

Nenhuma nova variável de ambiente nesta fase.

---

## Ordem de Execução

```
US-038 (Schemas Responses/Response_Emails) ──▶ US-039 (Submeter Resposta Backend)
                                            ──▶ US-041 (Visualizar Respostas Backend)

US-039 ──▶ US-040 (Página Pública Frontend)
US-041 ──▶ US-042 (Visualizar Respostas Frontend)

(US-039 e US-041 são independentes entre si após US-038)
```

---

## Estrutura de Arquivos

```
formix-backend/src/modules/responses/
  domain/
    aggregate/
      response.aggregate.ts + .spec.ts            ← US-038
      response-email.aggregate.ts + .spec.ts      ← US-038
      value-objects/
        response-id.vo.ts                          ← US-038
        response-email-id.vo.ts                    ← US-038
    usecases/
      submit-response.usecase.ts + .spec.ts        ← US-039
      list-responses.usecase.ts + .spec.ts         ← US-041
    repositories/
      response.repository.ts                       ← US-038
      response-email.repository.ts                 ← US-038
  infra/
    schemas/
      response.schema.ts                           ← US-038
      response-email.schema.ts                     ← US-038
    repositories/
      mongo-response.repository.ts + .test.ts     ← US-038
      mongo-response-email.repository.ts + .test.ts ← US-038
    controllers/
      responses.controller.ts + .test.ts          ← US-039, US-041
      submit-response.dto.ts                       ← US-039
  responses.module.ts

formix-frontend/src/
  app/(public)/
    forms/[publicToken]/page.tsx                   ← US-040
  modules/
    QuestionRenderer/
      QuestionRenderer.tsx                         ← US-040
      renderers/
        TextRenderer.tsx ... EmailRenderer.tsx     ← US-040
  services/
    responses/
      responses.service.ts                         ← US-040, US-042
      responses.types.ts                           ← US-040
  app/(app)/forms/[id]/
    responses/page.tsx                             ← US-042
```

---

## Princípio de Anonimato — CRÍTICO

```
responses:        { formId, organizationId, answers[], submittedAt }
                  ↑
                  SEM email, SEM hash, SEM IP, SEM userId

response_emails:  { formId, emailHash, respondedAt }
                  ↑
                  SEM referência a responses (sem FK, sem timestamp correlacionável)
```

As duas inserções são independentes e sem vínculo. Nunca deve ser possível correlacionar um hash de email com uma resposta específica.

---

## Verificação da Fase Completa

- [ ] `npm run typecheck` passa no backend
- [ ] Todos os `.spec.ts` passam
- [ ] Todos os `.test.ts` passam
- [ ] Submeter resposta via publicToken funciona (rota pública)
- [ ] Duplicidade por email é verificada (hash SHA-256)
- [ ] Respostas salvas sem qualquer identificador de respondente
- [ ] `GET /forms/:id/responses` retorna respostas paginadas sem dados de respondente
- [ ] Swagger documenta os endpoints
- [ ] `npm run typecheck` passa no frontend
- [ ] `npm run build` sucesso
- [ ] Página pública renderiza todas as 11 perguntas via QuestionRenderer
- [ ] Visualização de respostas exibe tabela paginada

---

## Arquivos Críticos de Referência

- `docs/code-patterns/backend-patterns.md`
- `docs/domain-rules/responses.md`
- `docs/data-modeling/collections.md` (seção responses e response_emails)
- `docs/code-patterns/frontend-components.md` (módulo QuestionRenderer)
- `formix-backend/src/modules/forms/` — IFormRepository, IQuestionRepository
