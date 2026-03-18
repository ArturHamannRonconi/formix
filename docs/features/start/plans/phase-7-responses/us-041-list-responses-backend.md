# US-041: Visualizar Respostas de um Formulário — Backend

## Metadados

| Campo | Valor |
|---|---|
| **Feature** | Fase 7: Respostas |
| **Status** | Pendente |
| **Depende de** | US-038 (Schemas Responses) |
| **Bloqueia** | US-042 (Visualizar Respostas Frontend) |

## Contexto

Implementa `GET /forms/:id/responses` para membros da organização visualizarem respostas paginadas de um formulário. Cada resposta contém apenas `_id`, `answers` e `submittedAt` — **sem nenhum dado do respondente**. Suporta paginação via `?offset=0&limit=20`.

## Arquivos

### Criar

| Arquivo | Descrição |
|---|---|
| `responses/domain/usecases/list-responses.usecase.ts` | Input: `{ organizationId, formId, offset?, limit? }`. Verifica form existe + pertence à org. Busca responses paginadas. Retorna `Output.ok({ responses: ResponseDto[], total })` |
| `responses/domain/usecases/list-responses.usecase.spec.ts` | Testa: lista responses do form, paginação, rejeita form de outra org, confirma ausência de email/hash na resposta |

### Modificar

| Arquivo | O que muda |
|---|---|
| `responses/infra/controllers/responses.controller.ts` | Adicionar `GET /forms/:id/responses` (autenticado, não público). Importar `FormsModule` para validar organizationId |
| `responses/infra/controllers/responses.controller.test.ts` | Adicionar testes para GET |
| `responses/responses.module.ts` | Adicionar `ListResponsesUseCase` |

## Resposta do Endpoint

```json
{
  "responses": [
    {
      "id": "uuid",
      "answers": [
        { "questionId": "uuid", "value": "Texto da resposta" },
        { "questionId": "uuid2", "value": ["opcao1", "opcao2"] }
      ],
      "submittedAt": "2026-03-20T15:30:00.000Z"
    }
  ],
  "total": 42,
  "offset": 0,
  "limit": 20
}
```

> **Nenhum dado identificador do respondente na resposta.**

## Passos de Implementação (TDD)

1. [teste] `list-responses.usecase.spec.ts` → [impl] `list-responses.usecase.ts`
2. [teste] Expandir `responses.controller.test.ts` com GET /forms/:id/responses
3. [impl] Adicionar handler ao `responses.controller.ts`
4. Atualizar `responses.module.ts`

## Critérios de Aceitação

- [ ] `GET /forms/:id/responses` retorna lista paginada de respostas
- [ ] Cada resposta tem apenas `id`, `answers`, `submittedAt`
- [ ] Nenhum dado de respondente (email, hash, IP) na resposta
- [ ] Suporta `?offset=0&limit=20`
- [ ] Ordenação por `submittedAt` descrescente
- [ ] Retorna 403 se form pertence a outra org
- [ ] Retorna 404 se form não existe
- [ ] Rota protegida (requer JWT)
- [ ] Usecases retornam `Output<T>` — nenhum `throw` interno
- [ ] Todos os `.spec.ts` passam
- [ ] Todos os `.test.ts` passam
- [ ] `npm run typecheck` passa
- [ ] Swagger documenta o endpoint

## Próximas USs

- **US-042** — Visualizar Respostas Frontend
