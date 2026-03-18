# US-043: Métricas por Formulário — Backend

## Metadados

| Campo | Valor |
|---|---|
| **Feature** | Fase 8: Analytics |
| **Status** | Pendente |
| **Depende de** | US-038 (Schemas Responses — dados a agregar), US-029 (Schemas Forms/Questions — estrutura de perguntas) |
| **Bloqueia** | US-044 (Dashboard Frontend) |

## Contexto

Implementa `GET /forms/:id/analytics`. Agrega métricas sob demanda via MongoDB aggregation pipelines. Retorna total de respostas, respostas ao longo do tempo e métricas específicas por tipo de pergunta. **Nenhum dado identificador de respondente é exposto.** O módulo `analytics` é independente — não tem aggregate próprio, apenas usecases e controller que consultam `IResponseRepository` e `IQuestionRepository`.

## Arquivos

### Criar

| Arquivo | Descrição |
|---|---|
| `analytics/domain/usecases/get-form-analytics.usecase.ts` | Input: `{ organizationId, formId, groupBy?: 'day' \| 'week' \| 'month' }`. Busca form + questions + agrega responses. Retorna `Output.ok(AnalyticsDto)` |
| `analytics/domain/usecases/get-form-analytics.usecase.spec.ts` | Testa: retorna total, respostas ao longo do tempo, métricas por tipo de pergunta, rejeita form de outra org |
| `analytics/infra/controllers/analytics.controller.ts` | `GET /forms/:id/analytics?groupBy=day`. `@ApiTags('analytics')`, `@ApiBearerAuth()` |
| `analytics/infra/controllers/analytics.controller.test.ts` | Testes de integração |
| `analytics/infra/controllers/analytics-response.dto.ts` | DTO completo com todas as métricas |
| `analytics/analytics.module.ts` | Módulo NestJS: importa `ResponsesModule`, `FormsModule` |

## Estrutura da Resposta

```typescript
interface AnalyticsDto {
  formId: string;
  totalResponses: number;
  responsesOverTime: { date: string; count: number }[];  // agrupado por groupBy
  questionMetrics: QuestionMetric[];
}

type QuestionMetric =
  | { questionId: string; type: 'text' | 'textarea' | 'email'; recentResponses: string[] }
  | { questionId: string; type: 'radio' | 'dropdown'; distribution: { option: string; count: number; percentage: number }[] }
  | { questionId: string; type: 'checkbox'; optionCounts: { option: string; count: number }[]; topCombinations: { combination: string[]; count: number }[] }
  | { questionId: string; type: 'toggle'; yesCount: number; noCount: number }
  | { questionId: string; type: 'number'; avg: number; median: number; min: number; max: number; histogram: { range: string; count: number }[] }
  | { questionId: string; type: 'date'; distribution: { date: string; count: number }[] }
  | { questionId: string; type: 'rating'; avg: number; distribution: { rating: number; count: number }[] }
  | { questionId: string; type: 'file'; totalUploads: number }
```

## Aggregation por Tipo

Cada tipo de pergunta usa uma MongoDB aggregation específica:

- **radio/dropdown**: `$group` por value, calcular percentagens
- **checkbox**: `$unwind` no array de values, `$group` por cada opção
- **toggle**: `$group` por value (true/false)
- **number**: `$group` com `$avg`, `$min`, `$max` + histograma via `$bucket`
- **rating**: `$group` por value com contagens + `$avg`
- **date**: `$group` por data (truncada)
- **text/textarea/email**: `$sort` por submittedAt desc, `$limit` 10
- **file**: `$count` de respostas com value não-nulo

## Passos de Implementação (TDD)

1. [teste] `get-form-analytics.usecase.spec.ts` — cada tipo de pergunta
2. [impl] `get-form-analytics.usecase.ts`
3. [impl] `analytics-response.dto.ts`
4. [teste] `analytics.controller.test.ts`
5. [impl] `analytics.controller.ts`
6. [impl] `analytics.module.ts`

## Critérios de Aceitação

- [ ] `GET /forms/:id/analytics` retorna métricas agregadas
- [ ] `totalResponses` correto
- [ ] `responsesOverTime` suporta `?groupBy=day` (default), `week`, `month`
- [ ] Métricas corretas para cada um dos 8 grupos de tipos de pergunta
- [ ] **Nenhum dado identificador de respondente** nas métricas
- [ ] Retorna 403 se form pertence a outra org
- [ ] Dados agregados sob demanda (sem cache)
- [ ] Usecases retornam `Output<T>` — nenhum `throw` interno
- [ ] Todos os `.spec.ts` passam
- [ ] Todos os `.test.ts` passam
- [ ] `npm run typecheck` passa
- [ ] Swagger documenta o endpoint

## Próximas USs

- **US-044** — Dashboard de Analytics Frontend
