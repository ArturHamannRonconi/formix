# Plano: Fase 6 — Formulários

## Contexto

A Fase 5 entregou o sistema de convites. A Fase 6 implementa o **núcleo do produto**: criação e gestão de formulários com perguntas, publicação e fechamento — tanto backend quanto frontend (FormBuilder).

Cobre US-029 a US-035. É a fase mais complexa do projeto — o FormBuilder frontend é um editor visual com drag-and-drop e suporte a 11 tipos de perguntas. O backend segue DDD com Forms e Questions em coleções separadas. Ao final de cada US concluída, atualizar `docs/features/progress.md`.

---

## Novos Pacotes a Instalar

```bash
# Frontend — drag-and-drop para reordenação de perguntas
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

## Variáveis de Ambiente

Nenhuma nova variável de ambiente nesta fase.

---

## Ordem de Execução

```
US-029 (Schemas Forms/Questions) ──▶ US-030 (CRUD Forms Backend)
                                  ──▶ US-031 (Gestão Perguntas Backend)
                                  ──▶ US-032 (Publicar Backend)
                                  ──▶ US-033 (Fechar Backend)

(US-030, US-031, US-032, US-033 são independentes entre si após US-029)

US-034 (Lista Forms Frontend) ← após US-030
US-035 (FormBuilder Frontend) ← após US-030 + US-031 + US-032 + US-033 + US-037 (inputs)
```

---

## Estrutura de Arquivos

```
formix-backend/src/modules/
  forms/
    domain/
      aggregate/
        form.aggregate.ts + .spec.ts              ← US-029
        question.entity.ts + .spec.ts             ← US-029
        value-objects/
          form-id.vo.ts                           ← US-029
          question-id.vo.ts                       ← US-029
          form-status.vo.ts                       ← US-029
          question-type.vo.ts                     ← US-029
          public-token.vo.ts                      ← US-029
      usecases/
        create-form.usecase.ts + .spec.ts         ← US-030
        list-forms.usecase.ts + .spec.ts          ← US-030
        get-form.usecase.ts + .spec.ts            ← US-030
        update-form.usecase.ts + .spec.ts         ← US-030
        delete-form.usecase.ts + .spec.ts         ← US-030
        add-question.usecase.ts + .spec.ts        ← US-031
        update-question.usecase.ts + .spec.ts     ← US-031
        remove-question.usecase.ts + .spec.ts     ← US-031
        reorder-questions.usecase.ts + .spec.ts   ← US-031
        publish-form.usecase.ts + .spec.ts        ← US-032
        close-form.usecase.ts + .spec.ts          ← US-033
      repositories/
        form.repository.ts                        ← US-029
        question.repository.ts                    ← US-029
    infra/
      schemas/
        form.schema.ts                            ← US-029
        question.schema.ts                        ← US-029
      repositories/
        mongo-form.repository.ts + .test.ts      ← US-029
        mongo-question.repository.ts + .test.ts  ← US-029
      controllers/
        forms.controller.ts + .test.ts           ← US-030, US-031, US-032, US-033
        (DTOs por usecase)                        ← US-030–US-033
    forms.module.ts                               ← US-029

formix-frontend/src/
  services/forms/
    forms.service.ts                              ← US-034, US-035
    forms.types.ts                                ← US-034, US-035
  app/(app)/forms/
    page.tsx                                      ← US-034
    new/page.tsx                                  ← US-035
    [id]/edit/page.tsx                            ← US-035
  modules/
    FormBuilder/
      FormBuilder.tsx                             ← US-035
      QuestionList.tsx                            ← US-035
      QuestionEditor.tsx                          ← US-035
      QuestionTypeSelector.tsx                    ← US-035
      FormSettings.tsx                            ← US-035
```

---

## Padrão: Form e Question como entidades separadas

- `Form` é o aggregate root — controla status, publicToken, settings
- `Question` é uma entidade independente (não embeddada no form) com sua própria coleção
- Queries de questions sempre filtram por `formId` E `organizationId`
- Publicar form: muda status `draft → active`, gera `publicToken`
- Fechar form: muda status `active → closed`

## 11 Tipos de Perguntas

`text`, `textarea`, `checkbox`, `radio`, `toggle`, `dropdown`, `number`, `date`, `rating`, `file`, `email`

Tipos com opções obrigatórias: `checkbox`, `radio`, `dropdown`

---

## Verificação da Fase Completa

- [ ] `npm run typecheck` passa no backend
- [ ] Todos os `.spec.ts` passam
- [ ] Todos os `.test.ts` passam
- [ ] CRUD de formulários funcionando (criar, listar, detalhar, editar, excluir)
- [ ] CRUD de perguntas com reordenação funcionando
- [ ] Publicar form: `draft → active`, gera publicToken único
- [ ] Fechar form: `active → closed`
- [ ] Excluir form remove perguntas associadas
- [ ] Swagger documenta todos os endpoints
- [ ] `npm run typecheck` passa no frontend
- [ ] `npm run build` sucesso
- [ ] Lista de formulários exibe cards com status colorido
- [ ] FormBuilder permite criar/editar perguntas com drag-and-drop

---

## Arquivos Críticos de Referência

- `docs/code-patterns/backend-patterns.md`
- `docs/code-patterns/frontend-components.md` (módulo FormBuilder)
- `docs/domain-rules/forms.md`
- `docs/data-modeling/collections.md`
- `formix-backend/src/shared/` — Output, IEmailService
