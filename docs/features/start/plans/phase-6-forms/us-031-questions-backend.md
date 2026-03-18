# US-031: Gestão de Perguntas — Backend

## Metadados

| Campo | Valor |
|---|---|
| **Feature** | Fase 6: Formulários |
| **Status** | Pendente |
| **Depende de** | US-029 (Schemas Forms/Questions), US-030 (FormsController existe para adicionar sub-rotas) |
| **Bloqueia** | US-035 (FormBuilder Frontend) |

## Contexto

Implementa CRUD de perguntas como sub-recurso de formulários: adicionar, editar, remover e reordenar. Cada pergunta tem tipo, label, required, order, description e campos condicionais (options, validation). Validação por tipo: checkbox/radio/dropdown exigem `options`. Reordenação recebe array com novos valores de `order` para múltiplas perguntas.

## Arquivos

### Criar

| Arquivo | Descrição |
|---|---|
| `forms/domain/usecases/add-question.usecase.ts` | Input: `{ organizationId, formId, type, label, description?, required, options?, validation? }`. Valida form existe + pertence à org. Valida `question.validateForType()`. Define `order` como próximo número. Salva question. `Output.ok({ questionId })` |
| `forms/domain/usecases/add-question.usecase.spec.ts` | Testa: adicionar pergunta, rejeitar radio sem options, rejeitar form de outra org |
| `forms/domain/usecases/update-question.usecase.ts` | Input: `{ organizationId, formId, questionId, ...campos }`. Atualiza campos enviados. Re-valida tipo se `type` ou `options` mudou. `Output.ok({ updated: true })` |
| `forms/domain/usecases/update-question.usecase.spec.ts` | Testa: atualizar label, atualizar options, rejeitar quando options removidas de radio |
| `forms/domain/usecases/remove-question.usecase.ts` | Input: `{ organizationId, formId, questionId }`. Remove question. `Output.ok({ removed: true })` |
| `forms/domain/usecases/remove-question.usecase.spec.ts` | Testa: remover pergunta, rejeitar question de outro form |
| `forms/domain/usecases/reorder-questions.usecase.ts` | Input: `{ organizationId, formId, questions: { id, order }[] }`. Atualiza `order` de cada question. `Output.ok({ reordered: true })` |
| `forms/domain/usecases/reorder-questions.usecase.spec.ts` | Testa: reordenar perguntas, rejeitar se questionId não pertence ao form |
| `forms/infra/controllers/add-question.dto.ts` | `{ type, label, description?, required, options?, validation? }` |
| `forms/infra/controllers/update-question.dto.ts` | Versão partial com mesmos campos |
| `forms/infra/controllers/reorder-questions.dto.ts` | `{ questions: { id: string, order: number }[] }` |

### Modificar

| Arquivo | O que muda |
|---|---|
| `forms/infra/controllers/forms.controller.ts` | Adicionar: `POST /forms/:formId/questions`, `PATCH /forms/:formId/questions/:questionId`, `DELETE /forms/:formId/questions/:questionId`, `PATCH /forms/:formId/questions/reorder` |
| `forms/infra/controllers/forms.controller.test.ts` | Adicionar testes para os 4 novos endpoints |
| `forms/forms.module.ts` | Adicionar 4 novos usecases |

## Passos de Implementação (TDD)

1. [teste] `add-question.usecase.spec.ts` → [impl] `add-question.usecase.ts`
2. [teste] `update-question.usecase.spec.ts` → [impl] `update-question.usecase.ts`
3. [teste] `remove-question.usecase.spec.ts` → [impl] `remove-question.usecase.ts`
4. [teste] `reorder-questions.usecase.spec.ts` → [impl] `reorder-questions.usecase.ts`
5. [impl] DTOs
6. [teste] Expandir `forms.controller.test.ts` com 4 novos endpoints
7. [impl] Adicionar handlers ao `forms.controller.ts`
8. Atualizar `forms.module.ts`

## Critérios de Aceitação

- [ ] `POST /forms/:formId/questions` adiciona pergunta com order automático
- [ ] `PATCH /forms/:formId/questions/:questionId` atualiza campos
- [ ] `DELETE /forms/:formId/questions/:questionId` remove pergunta
- [ ] `PATCH /forms/:formId/questions/reorder` atualiza order de múltiplas perguntas
- [ ] checkbox/radio/dropdown sem options retorna 400
- [ ] Perguntas de outros forms retornam 404
- [ ] 11 tipos suportados: text, textarea, checkbox, radio, toggle, dropdown, number, date, rating, file, email
- [ ] Usecases retornam `Output<T>` — nenhum `throw` interno
- [ ] Todos os `.spec.ts` passam
- [ ] Todos os `.test.ts` passam
- [ ] `npm run typecheck` passa
- [ ] Swagger documenta os 4 endpoints

## Próximas USs

- **US-032** — Publicar Formulário Backend
- **US-035** — FormBuilder Frontend
