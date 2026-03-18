# US-030: CRUD de Formulários — Backend

## Metadados

| Campo | Valor |
|---|---|
| **Feature** | Fase 6: Formulários |
| **Status** | Pendente |
| **Depende de** | US-029 (Schemas Forms/Questions) |
| **Bloqueia** | US-034 (Lista Forms Frontend), US-035 (FormBuilder Frontend) |

## Contexto

Implementa CRUD completo de formulários: criar, listar, detalhar (com perguntas), editar title/description/settings e excluir (cascata: remove perguntas + respostas + response_emails). Qualquer membro (admin ou member) pode executar todas as operações. Todas as queries filtram por `organizationId` do token.

## Arquivos

### Criar

| Arquivo | Descrição |
|---|---|
| `forms/domain/usecases/create-form.usecase.ts` | Input: `{ organizationId, createdBy, title, description? }`. Cria `FormAggregate` com status `draft`. Salva. `Output.ok({ formId })` |
| `forms/domain/usecases/create-form.usecase.spec.ts` | Testa: criar form com status draft, form tem organizationId correto |
| `forms/domain/usecases/list-forms.usecase.ts` | Input: `{ organizationId, status? }`. Lista forms da org. `Output.ok({ forms: FormSummaryDto[] })` |
| `forms/domain/usecases/list-forms.usecase.spec.ts` | Testa: lista apenas forms da org, filtra por status |
| `forms/domain/usecases/get-form.usecase.ts` | Input: `{ organizationId, formId }`. Busca form + questions (ordenadas). `Output.ok({ form, questions })` |
| `forms/domain/usecases/get-form.usecase.spec.ts` | Testa: retorna form com questions, rejeita form de outra org |
| `forms/domain/usecases/update-form.usecase.ts` | Input: `{ organizationId, formId, title?, description?, settings? }`. Atualiza apenas campos enviados. `Output.ok({ updated: true })` |
| `forms/domain/usecases/update-form.usecase.spec.ts` | Testa: atualiza campos, rejeita form de outra org |
| `forms/domain/usecases/delete-form.usecase.ts` | Input: `{ organizationId, formId }`. Remove form + questions (`questionRepo.deleteByFormId`) + respostas (`responseRepo.deleteByFormId`, implementado na US-038) + response_emails. `Output.ok({ deleted: true })` |
| `forms/domain/usecases/delete-form.usecase.spec.ts` | Testa: deleta form + questions, rejeita form de outra org |
| `forms/infra/controllers/forms.controller.ts` | CRUD: `POST /forms`, `GET /forms`, `GET /forms/:id`, `PATCH /forms/:id`, `DELETE /forms/:id`. `@ApiTags('forms')`, `@ApiBearerAuth()` |
| `forms/infra/controllers/forms.controller.test.ts` | Testes de integração para os 5 endpoints |
| `forms/infra/controllers/create-form.dto.ts` | `{ title: string, description?: string }` com `@ApiProperty` |
| `forms/infra/controllers/update-form.dto.ts` | `{ title?, description?, settings? }` parcial com `@ApiProperty` |
| `forms/infra/controllers/form-response.dto.ts` | DTO de resposta com campos do form |

### Modificar

| Arquivo | O que muda |
|---|---|
| `forms/forms.module.ts` | Adicionar 5 usecases + `FormsController` |

## Passos de Implementação (TDD)

1. [teste] `create-form.usecase.spec.ts` → [impl] `create-form.usecase.ts`
2. [teste] `list-forms.usecase.spec.ts` → [impl] `list-forms.usecase.ts`
3. [teste] `get-form.usecase.spec.ts` → [impl] `get-form.usecase.ts`
4. [teste] `update-form.usecase.spec.ts` → [impl] `update-form.usecase.ts`
5. [teste] `delete-form.usecase.spec.ts` → [impl] `delete-form.usecase.ts`
6. [impl] DTOs
7. [teste] `forms.controller.test.ts` → [impl] `forms.controller.ts`
8. Atualizar `forms.module.ts`

## Critérios de Aceitação

- [ ] `POST /forms` cria form com status `draft`
- [ ] `GET /forms` lista forms da organização (pode filtrar por `?status=active`)
- [ ] `GET /forms/:id` retorna form com suas questions ordenadas por `order`
- [ ] `PATCH /forms/:id` atualiza campos enviados (partial update)
- [ ] `DELETE /forms/:id` remove form e suas questions
- [ ] Todas as queries filtram por `organizationId` do token
- [ ] Retorna 404 se form não existe ou pertence a outra org
- [ ] Usecases retornam `Output<T>` — nenhum `throw` interno
- [ ] Todos os `.spec.ts` passam
- [ ] Todos os `.test.ts` passam
- [ ] `npm run typecheck` passa
- [ ] Swagger documenta os 5 endpoints

## Próximas USs

- **US-031** — Gestão de Perguntas Backend
- **US-034** — Lista de Formulários Frontend
