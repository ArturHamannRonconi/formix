# US-044: Dashboard de Analytics — Frontend

## Metadados

| Campo | Valor |
|---|---|
| **Feature** | Fase 8: Analytics |
| **Status** | Pendente |
| **Depende de** | US-043 (Métricas Backend) |
| **Bloqueia** | — (última US do projeto) |

## Contexto

Cria a página `/forms/:id/analytics` com dashboard visual de métricas. Para cada tipo de pergunta, renderiza o gráfico mais adequado usando Recharts. O hook `useAnalytics` normaliza os dados da API antes de passá-los para os componentes de gráfico — componentes de gráfico recebem dados normalizados, não dados brutos. É a **última US do projeto**.

## Arquivos

### Criar

| Arquivo | Descrição |
|---|---|
| `formix-frontend/src/services/analytics/analytics.service.ts` | `getFormAnalytics(formId, groupBy?)` |
| `formix-frontend/src/services/analytics/analytics.types.ts` | Tipos espelhando o DTO do backend |
| `formix-frontend/src/hooks/useAnalytics.ts` | Busca analytics, normaliza dados para cada tipo de gráfico. Retorna `{ data, isLoading, error }` |
| `formix-frontend/src/modules/Dashboard/StatCard.tsx` | Card de métrica simples: label + valor grande. Ex: "Total de respostas: 42" |
| `formix-frontend/src/modules/Dashboard/charts/BarChart.tsx` | Wrapper de Recharts BarChart com dados normalizados `{ name, value }[]` |
| `formix-frontend/src/modules/Dashboard/charts/PieChart.tsx` | Wrapper de Recharts PieChart com dados normalizados `{ name, value }[]` |
| `formix-frontend/src/modules/Dashboard/charts/LineChart.tsx` | Wrapper de Recharts LineChart para séries temporais `{ date, count }[]` |
| `formix-frontend/src/modules/Dashboard/charts/RatingChart.tsx` | BarChart customizado para ratings (eixo X: notas 1-5, eixo Y: contagem) + StatCard de média |
| `formix-frontend/src/modules/Dashboard/Dashboard.tsx` | Container: StatCards de resumo + LineChart de respostas ao longo do tempo + seção por pergunta |
| `formix-frontend/src/modules/Dashboard/Dashboard.module.css` | Grid responsivo (2 colunas desktop, 1 mobile) |
| `formix-frontend/src/app/(app)/forms/[id]/analytics/page.tsx` | Página que usa `useAnalytics` e renderiza `<Dashboard>` |

## Mapeamento Tipo → Gráfico

| Tipo da Pergunta | Componente | Dados Normalizados |
|---|---|---|
| radio, dropdown | PieChart | `distribution` → `{ name: option, value: count }[]` |
| checkbox | BarChart | `optionCounts` → `{ name: option, value: count }[]` |
| toggle | PieChart | `{ name: 'Sim', value: yesCount }, { name: 'Não', value: noCount }` |
| number | BarChart + 4x StatCard | `histogram` → `{ name: range, value: count }[]` + avg, median, min, max |
| rating | RatingChart + StatCard | `distribution` → `{ name: rating, value: count }[]` + avg |
| date | LineChart | `distribution` → `{ date, count }[]` |
| text, textarea, email | Lista de respostas recentes | `recentResponses: string[]` |
| file | StatCard | `totalUploads` |

## Estrutura do Dashboard

```
/forms/:id/analytics
├── StatCard: Total de respostas
├── LineChart: Respostas ao longo do tempo [groupBy: day/week/month]
└── Por cada pergunta:
    ├── Título da pergunta
    └── Gráfico adequado ao tipo (ver tabela acima)
```

## Passos de Implementação

1. [impl] `analytics.types.ts` + `analytics.service.ts`
2. [impl] `useAnalytics.ts` — normalização de dados
3. [impl] `StatCard.tsx` — componente simples
4. [impl] `BarChart.tsx`, `PieChart.tsx`, `LineChart.tsx`, `RatingChart.tsx` — wrappers Recharts
5. [impl] `Dashboard.tsx` — composição com mapeamento tipo → gráfico
6. [impl] `analytics/page.tsx` — usa useAnalytics + Dashboard

## Critérios de Aceitação

- [ ] Página `/forms/:id/analytics` carrega e exibe métricas
- [ ] StatCard de total de respostas visível
- [ ] LineChart de respostas ao longo do tempo com seletor day/week/month
- [ ] Cada pergunta exibe o gráfico correto para seu tipo
- [ ] Componentes de gráfico recebem dados normalizados (não dados brutos da API)
- [ ] Layout responsivo: 2 colunas desktop, 1 coluna mobile
- [ ] Loading state durante fetch
- [ ] Estado vazio quando form não tem respostas
- [ ] **Nenhum dado identificador de respondente exibido**
- [ ] `npm run typecheck` passa
- [ ] `npm run build` sucesso

## Dependências de Pacotes

### Produção
- `recharts`

## Próximas USs

**PRD completo. Todas as USs implementadas.**
