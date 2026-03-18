# US-038: Schemas MongoDB — Responses e Response_Emails

## Metadados

| Campo | Valor |
|---|---|
| **Feature** | Fase 7: Respostas |
| **Status** | Pendente |
| **Depende de** | US-029 (Schemas Forms — formId referenciado) |
| **Bloqueia** | US-039 (Submeter Resposta), US-041 (Visualizar Respostas) |

## Contexto

Cria os schemas Mongoose `responses` e `response_emails` com **separação total** para garantir anonimato. `responses` nunca armazena email, hash ou qualquer identificador. `response_emails` armazena apenas o hash SHA-256 do email para controle de duplicidade, sem referência à response. São dois aggregates independentes no mesmo módulo `responses`.

## Arquivos

### Criar

**Value Objects**

| Arquivo | Descrição |
|---|---|
| `responses/domain/aggregate/value-objects/response-id.vo.ts` | `ResponseId`: `create()`, `from(value)`, `getValue()`, `equals()` |
| `responses/domain/aggregate/value-objects/response-email-id.vo.ts` | `ResponseEmailId`: mesmo padrão |

**Aggregates**

| Arquivo | Descrição |
|---|---|
| `responses/domain/aggregate/response.aggregate.ts` | Props: `id`, `formId`, `organizationId`, `answers: { questionId: string, value: unknown }[]`, `submittedAt`. **SEM email, SEM hash.** `create(input)`, `reconstitute(props)` |
| `responses/domain/aggregate/response.aggregate.spec.ts` | Testa: create com answers, reconstitute, confirmar ausência de email/hash nas props |
| `responses/domain/aggregate/response-email.aggregate.ts` | Props: `id`, `formId`, `emailHash`, `respondedAt`. **SEM referência a responseId.** `create(formId, emailHash)`, `reconstitute(props)` |
| `responses/domain/aggregate/response-email.aggregate.spec.ts` | Testa: create, confirmar ausência de responseId |

**Repository Interfaces**

| Arquivo | Descrição |
|---|---|
| `responses/domain/repositories/response.repository.ts` | `IResponseRepository`: `save`, `findByFormId(formId, options: { limit, offset })`, `countByFormId`, `deleteByFormId` |
| `responses/domain/repositories/response-email.repository.ts` | `IResponseEmailRepository`: `save`, `existsByFormIdAndEmailHash(formId, emailHash)`, `deleteByFormId` |

**Infra — Schemas**

| Arquivo | Descrição |
|---|---|
| `responses/infra/schemas/response.schema.ts` | `_id`, `formId`, `organizationId`, `answers` (array de `{ questionId, value }`), `submittedAt`. **SEM email, SEM emailHash.** Índices: `{ formId: 1 }`, `{ formId: 1, submittedAt: -1 }`, `{ organizationId: 1 }` |
| `responses/infra/schemas/response-email.schema.ts` | `_id`, `formId`, `emailHash`, `respondedAt`. **SEM referência a responses.** Índice: `{ formId: 1, emailHash: 1 }` unique |

**Infra — Repositories**

| Arquivo | Descrição |
|---|---|
| `responses/infra/repositories/mongo-response.repository.ts` | Implementação Mongoose |
| `responses/infra/repositories/mongo-response.repository.test.ts` | Testa: save, findByFormId com paginação, countByFormId, deleteByFormId |
| `responses/infra/repositories/mongo-response-email.repository.ts` | Implementação Mongoose |
| `responses/infra/repositories/mongo-response-email.repository.test.ts` | Testa: save, existsByFormIdAndEmailHash, deleteByFormId |
| `responses/responses.module.ts` | Módulo NestJS: registra schemas, providers, exporta repositórios |

## Passos de Implementação (TDD)

1. [impl] Value objects: `response-id.vo.ts`, `response-email-id.vo.ts`
2. [teste] `response.aggregate.spec.ts` → [impl] `response.aggregate.ts`
3. [teste] `response-email.aggregate.spec.ts` → [impl] `response-email.aggregate.ts`
4. [impl] Repository interfaces
5. [impl] Schemas Mongoose
6. [teste] `mongo-response.repository.test.ts` → [impl] `mongo-response.repository.ts`
7. [teste] `mongo-response-email.repository.test.ts` → [impl] `mongo-response-email.repository.ts`
8. [impl] `responses.module.ts`

## Critérios de Aceitação

- [ ] `ResponseAggregate` não tem campo email, emailHash, userId ou IP
- [ ] `ResponseEmailAggregate` não tem campo responseId ou qualquer referência a response
- [ ] `existsByFormIdAndEmailHash` retorna boolean sem expor dados
- [ ] `deleteByFormId` existe em ambos os repositórios (para cascata no delete de form)
- [ ] Índice unique `{ formId, emailHash }` em response_emails
- [ ] Todos os `.spec.ts` passam
- [ ] Todos os `.test.ts` passam
- [ ] `npm run typecheck` passa

## Próximas USs

- **US-039** — Submeter Resposta Backend
- **US-041** — Visualizar Respostas Backend
