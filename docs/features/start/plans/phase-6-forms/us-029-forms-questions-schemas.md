# US-029: Schemas MongoDB — Forms e Questions

## Metadados

| Campo | Valor |
|---|---|
| **Feature** | Fase 6: Formulários |
| **Status** | Pendente |
| **Depende de** | US-016 (Schemas Users/Organizations — organizationId referenciado) |
| **Bloqueia** | US-030, US-031, US-032, US-033 |

## Contexto

Cria os schemas Mongoose `forms` e `questions`, os aggregates/entities de domínio, value objects e repositórios. `Form` é o aggregate root. `Question` é uma entidade independente em coleção separada (não embeddada) para flexibilidade nos analytics. Ambos sempre filtram por `organizationId` para multi-tenancy.

## Arquivos

### Criar

**Value Objects** — `formix-backend/src/modules/forms/domain/aggregate/value-objects/`

| Arquivo | Descrição |
|---|---|
| `form-id.vo.ts` | `FormId`: `create()`, `from(value)`, `getValue()`, `equals()` |
| `question-id.vo.ts` | `QuestionId`: mesmo padrão |
| `form-status.vo.ts` | Enum: `draft`, `active`, `expired`, `closed`. Métodos: `isDraft()`, `isActive()`, `canAcceptResponses()` |
| `question-type.vo.ts` | Enum 11 tipos. Método `requiresOptions(): boolean` (true para checkbox, radio, dropdown) |
| `public-token.vo.ts` | `PublicToken`: `generate()` cria UUID random, `from(value)` para reconstituição |

**Domain Entities/Aggregates**

| Arquivo | Descrição |
|---|---|
| `forms/domain/aggregate/question.entity.ts` | Props: `id`, `formId`, `organizationId`, `type`, `label`, `description?`, `required`, `order`, `options?` (string[]), `validation?` `{ min?, max?, pattern? }`, `createdAt`. `create()`, `reconstitute()`, `update()`, `validateForType()` (valida options obrigatórias para checkbox/radio/dropdown) |
| `forms/domain/aggregate/question.entity.spec.ts` | Testa: create, validateForType (rejeita radio sem options), update |
| `forms/domain/aggregate/form.aggregate.ts` | Props: `id`, `organizationId`, `createdBy`, `title`, `description?`, `publicToken?`, `settings { expiresAt?, maxResponses?, allowMultipleResponses, allowedEmailDomains }`, `status`, `createdAt`, `updatedAt`. Métodos: `create()`, `reconstitute()`, `update()`, `publish(publicToken)` → draft→active, `close()` → active→closed, `isExpired()`, `canAcceptResponses()` |
| `forms/domain/aggregate/form.aggregate.spec.ts` | Testa: publish muda status, close muda status, publish rejeita form não-draft, close rejeita form não-active, isExpired |

**Repository Interfaces**

| Arquivo | Descrição |
|---|---|
| `forms/domain/repositories/form.repository.ts` | `IFormRepository`: `save`, `findById`, `findByOrganizationId`, `findByPublicToken`, `delete` |
| `forms/domain/repositories/question.repository.ts` | `IQuestionRepository`: `save`, `findById`, `findByFormId`, `findByFormIdOrdered`, `delete`, `deleteByFormId` |

**Infra — Schemas**

| Arquivo | Descrição |
|---|---|
| `forms/infra/schemas/form.schema.ts` | Schema Mongoose: `_id`, `organizationId`, `createdBy`, `title`, `description`, `publicToken` (unique), `settings` (subdoc), `status`, `createdAt`, `updatedAt`. Índices: `{ organizationId: 1 }`, `{ publicToken: 1 }` unique, `{ organizationId: 1, status: 1 }` |
| `forms/infra/schemas/question.schema.ts` | Schema Mongoose: `_id`, `formId`, `organizationId`, `type`, `label`, `description`, `required`, `order`, `options`, `validation` (subdoc), `createdAt`. Índices: `{ formId: 1, order: 1 }`, `{ organizationId: 1 }` |

**Infra — Repositories**

| Arquivo | Descrição |
|---|---|
| `forms/infra/repositories/mongo-form.repository.ts` | Implementação Mongoose de `IFormRepository` |
| `forms/infra/repositories/mongo-form.repository.test.ts` | Testes de integração: save, findById, findByOrganizationId, findByPublicToken, delete |
| `forms/infra/repositories/mongo-question.repository.ts` | Implementação Mongoose de `IQuestionRepository` |
| `forms/infra/repositories/mongo-question.repository.test.ts` | Testes de integração: save, findByFormIdOrdered, deleteByFormId |
| `forms/forms.module.ts` | Módulo NestJS: registra schemas, providers, exporta repositórios |

## Passos de Implementação (TDD)

1. [impl] Value objects: `form-id.vo.ts`, `question-id.vo.ts`, `form-status.vo.ts`, `question-type.vo.ts`, `public-token.vo.ts`
2. [teste] `question.entity.spec.ts` → [impl] `question.entity.ts`
3. [teste] `form.aggregate.spec.ts` → [impl] `form.aggregate.ts`
4. [impl] Repository interfaces
5. [impl] Schemas Mongoose (`form.schema.ts`, `question.schema.ts`)
6. [teste] `mongo-form.repository.test.ts` → [impl] `mongo-form.repository.ts`
7. [teste] `mongo-question.repository.test.ts` → [impl] `mongo-question.repository.ts`
8. [impl] `forms.module.ts`

## Critérios de Aceitação

- [ ] `FormAggregate.publish()` muda status para `active` e aceita publicToken
- [ ] `FormAggregate.close()` muda status para `closed`
- [ ] `publish()` rejeita se status não é `draft`
- [ ] `close()` rejeita se status não é `active`
- [ ] `QuestionEntity.validateForType()` rejeita checkbox/radio/dropdown sem options
- [ ] `findByPublicToken` busca form por publicToken único
- [ ] `deleteByFormId` remove todas as perguntas de um form
- [ ] Todos os `.spec.ts` passam
- [ ] Todos os `.test.ts` passam
- [ ] `npm run typecheck` passa

## Próximas USs

- **US-030** — CRUD Formulários Backend
- **US-031** — Gestão de Perguntas Backend
- **US-032** — Publicar Formulário Backend
- **US-033** — Fechar Formulário Backend
