# US-042: Visualizar Respostas — Frontend

## Metadados

| Campo | Valor |
|---|---|
| **Feature** | Fase 7: Respostas |
| **Status** | Pendente |
| **Depende de** | US-041 (Visualizar Respostas Backend), US-030 (GET /forms/:id — para obter perguntas como cabeçalhos da tabela) |
| **Bloqueia** | — |

## Contexto

Cria a página `/forms/:id/responses` que exibe as respostas individuais em uma tabela. Cada linha é uma resposta, cada coluna é uma pergunta. Dados de respondente nunca exibidos. Paginação de respostas. Link de volta para o formulário.

## Arquivos

### Criar

| Arquivo | Descrição |
|---|---|
| `formix-frontend/src/app/(app)/forms/[id]/responses/page.tsx` | Página de respostas: carrega form (para perguntas como cabeçalhos) + respostas paginadas. Tabela com scroll horizontal |

### Modificar

| Arquivo | O que muda |
|---|---|
| `formix-frontend/src/services/responses/responses.service.ts` | `listResponses(formId, offset, limit)` já criado na US-040 |

## Estrutura da Tabela

```
| Data         | Pergunta 1   | Pergunta 2    | Pergunta 3    |
|--------------|--------------|---------------|---------------|
| 20/03 15:30  | Resposta...  | Opção A       | 4             |
| 20/03 14:15  | Texto longo  | Opção B, C    | 5             |
```

> Nenhuma coluna para email ou identificador de respondente.

## Passos de Implementação

1. [impl] `forms/[id]/responses/page.tsx` — carrega form + respostas, monta tabela, paginação

## Critérios de Aceitação

- [ ] Página `/forms/:id/responses` carrega form e respostas
- [ ] Tabela tem: data de submissão + uma coluna por pergunta
- [ ] Paginação (previous/next) com indicador de total
- [ ] **Nenhum dado identificador de respondente exibido**
- [ ] Link "Voltar" para `/forms`
- [ ] Loading state durante fetch
- [ ] Estado vazio com mensagem quando não há respostas
- [ ] Scroll horizontal para tabelas largas
- [ ] `npm run typecheck` passa
- [ ] `npm run build` sucesso

## Próximas USs

- Fase 8: US-043 (Analytics Backend), US-044 (Analytics Frontend)
