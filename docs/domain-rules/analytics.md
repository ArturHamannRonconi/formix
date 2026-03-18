# Regras de Domínio — Analytics

## Métricas por formulário

- Total de respostas
- Respostas ao longo do tempo (por dia/semana/mês)

## Métricas por pergunta

| Tipo | Métricas |
|---|---|
| text, textarea, email | Nuvem de palavras, respostas recentes |
| checkbox | Contagem por opção, combinações mais comuns |
| radio, dropdown | Distribuição percentual por opção |
| toggle | Contagem sim/não |
| number | Média, mediana, min, max, histograma |
| date | Distribuição ao longo do tempo |
| rating | Média, distribuição por nota |
| file | Total de uploads |

## Regras

- Read-only — não alteram dados
- Sob demanda (não pré-computados)
- Filtrar por `organizationId` (multi-tenancy)
- Não expor dados que identifiquem respondentes
