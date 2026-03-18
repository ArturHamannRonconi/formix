# Plano: Fase 8 — Analytics

## Contexto

A Fase 7 entregou coleta e visualização de respostas. A Fase 8 implementa **analytics agregados**: métricas por formulário com gráficos adequados a cada tipo de pergunta. É a fase final do projeto.

Cobre US-043 e US-044. Dados são agregados sob demanda (não pré-computados). Nenhum dado identificador de respondente é exposto. Ao final de cada US concluída, atualizar `docs/features/progress.md`.

---

## Novos Pacotes a Instalar

```bash
# Frontend — biblioteca de gráficos
npm install recharts
```

## Variáveis de Ambiente

Nenhuma nova variável de ambiente nesta fase.

---

## Ordem de Execução

```
US-043 (Métricas Backend) ──▶ US-044 (Dashboard Frontend)
```

---

## Estrutura de Arquivos

```
formix-backend/src/modules/analytics/
  domain/
    usecases/
      get-form-analytics.usecase.ts + .spec.ts   ← US-043
  infra/
    controllers/
      analytics.controller.ts + .test.ts         ← US-043
      analytics-response.dto.ts                  ← US-043
  analytics.module.ts                             ← US-043

formix-frontend/src/
  services/analytics/
    analytics.service.ts                          ← US-044
    analytics.types.ts                            ← US-044
  hooks/
    useAnalytics.ts                               ← US-044
  modules/Dashboard/
    Dashboard.tsx                                 ← US-044
    StatCard.tsx                                  ← US-044
    charts/
      BarChart.tsx                                ← US-044
      PieChart.tsx                                ← US-044
      LineChart.tsx                               ← US-044
      RatingChart.tsx                             ← US-044
  app/(app)/forms/[id]/analytics/page.tsx        ← US-044
```

---

## Métricas por Tipo de Pergunta

| Tipo | Métricas |
|---|---|
| text, textarea, email | Amostra de respostas recentes (últimas 5-10) |
| checkbox | Contagem por opção, combinações mais comuns |
| radio, dropdown | Distribuição percentual por opção (para PieChart) |
| toggle | Contagem sim/não |
| number | Média, mediana, min, max, histograma (para BarChart) |
| date | Distribuição temporal (para LineChart) |
| rating | Média, distribuição por nota (para RatingChart) |
| file | Total de uploads |

---

## Verificação da Fase Completa

- [ ] `npm run typecheck` passa no backend
- [ ] Todos os `.spec.ts` passam
- [ ] Todos os `.test.ts` passam
- [ ] `GET /forms/:id/analytics` retorna métricas agregadas
- [ ] Nenhum dado identificador de respondente nos analytics
- [ ] Swagger documenta o endpoint
- [ ] `npm run typecheck` passa no frontend
- [ ] `npm run build` sucesso
- [ ] Dashboard renderiza gráficos adequados por tipo de pergunta
- [ ] **PRD completo: todas as USs implementadas**

---

## Arquivos Críticos de Referência

- `docs/code-patterns/backend-patterns.md`
- `docs/code-patterns/analytics.md`
- `docs/domain-rules/analytics.md` (se existir)
- `docs/code-patterns/frontend-components.md` (módulo Dashboard)
- `formix-backend/src/modules/responses/` — IResponseRepository para agregação
- `formix-backend/src/modules/forms/` — IFormRepository, IQuestionRepository
