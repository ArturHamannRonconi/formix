# Regras de Domínio — Analytics

## Visão geral

O módulo de analytics agrega dados de respostas para exibição em dashboards.

## Métricas disponíveis

### Por formulário
- Total de respostas
- Respostas ao longo do tempo (por dia/semana/mês)
- Taxa de preenchimento (respostas / acessos ao link, se implementado)

### Por pergunta
Depende do tipo da pergunta:

| Tipo | Métricas |
|---|---|
| text, textarea, email | Nuvem de palavras, respostas recentes |
| checkbox | Contagem por opção selecionada, combinações mais comuns |
| radio, dropdown | Distribuição percentual por opção |
| toggle | Contagem sim/não |
| number | Média, mediana, min, max, histograma |
| date | Distribuição ao longo do tempo |
| rating | Média, distribuição por nota |
| file | Total de uploads |

## Regras

- Analytics são read-only — não alteram dados
- Dados são agregados sob demanda (não pré-computados inicialmente)
- Respeitar multi-tenancy: apenas dados da organização do usuário
- Não expor informações que possam identificar respondentes
