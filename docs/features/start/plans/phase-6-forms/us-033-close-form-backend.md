# US-033: Fechar Formulário — Backend

## Metadados

| Campo | Valor |
|---|---|
| **Feature** | Fase 6: Formulários |
| **Status** | Pendente |
| **Depende de** | US-032 (Publicar — status active é prerequisito) |
| **Bloqueia** | US-035 (FormBuilder Frontend — botão Fechar) |

## Contexto

Implementa `POST /forms/:id/close`. Valida que o form está com status `active`. Muda para `closed`. Formulário fechado para de aceitar respostas.

## Arquivos

### Criar

| Arquivo | Descrição |
|---|---|
| `forms/domain/usecases/close-form.usecase.ts` | Input: `{ organizationId, formId }`. Verifica form existe + org + status active. Chama `form.close()`. Salva. `Output.ok({ closed: true })` |
| `forms/domain/usecases/close-form.usecase.spec.ts` | Testa: fechar form ativo, rejeitar form não-ativo, rejeitar form de outra org |

### Modificar

| Arquivo | O que muda |
|---|---|
| `forms/infra/controllers/forms.controller.ts` | Adicionar `POST /forms/:id/close` |
| `forms/infra/controllers/forms.controller.test.ts` | Testes para POST /close |
| `forms/forms.module.ts` | Adicionar `CloseFormUseCase` |

## Passos de Implementação (TDD)

1. [teste] `close-form.usecase.spec.ts` → [impl] `close-form.usecase.ts`
2. [teste] Expandir `forms.controller.test.ts` com POST /close
3. [impl] Adicionar handler `POST /forms/:id/close`
4. Atualizar `forms.module.ts`

## Critérios de Aceitação

- [ ] `POST /forms/:id/close` muda status `active → closed`
- [ ] Retorna 400 se form não está ativo (draft/closed/expired)
- [ ] Retorna 404 se form não pertence à organização
- [ ] Form fechado retorna erro nas submissões de resposta (verificado na US-039)
- [ ] Usecases retornam `Output<T>` — nenhum `throw` interno
- [ ] Todos os `.spec.ts` passam
- [ ] Todos os `.test.ts` passam
- [ ] `npm run typecheck` passa
- [ ] Swagger documenta o endpoint

## Próximas USs

- **US-034** — Lista de Formulários Frontend
- **US-035** — FormBuilder Frontend
