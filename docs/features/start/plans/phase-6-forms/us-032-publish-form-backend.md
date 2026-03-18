# US-032: Publicar Formulário — Backend

## Metadados

| Campo | Valor |
|---|---|
| **Feature** | Fase 6: Formulários |
| **Status** | Pendente |
| **Depende de** | US-029 (Schemas), US-031 (Questões — form deve ter pelo menos 1 pergunta) |
| **Bloqueia** | US-035 (FormBuilder Frontend — botão Publicar), US-039 (Submissão de Respostas) |

## Contexto

Implementa `POST /forms/:id/publish`. Valida que o form está em status `draft` e tem pelo menos 1 pergunta. Gera um `publicToken` único (não muda após publicação). Muda status para `active`. Retorna o link público.

## Arquivos

### Criar

| Arquivo | Descrição |
|---|---|
| `forms/domain/usecases/publish-form.usecase.ts` | Input: `{ organizationId, formId }`. Verifica form existe + org. Conta questions — se 0, retorna `Output.fail`. Chama `form.publish(PublicToken.generate())`. Salva form. `Output.ok({ publicToken, publicUrl })` |
| `forms/domain/usecases/publish-form.usecase.spec.ts` | Testa: publicar form draft com perguntas, rejeitar form sem perguntas, rejeitar form já publicado, rejeitar form de outra org |
| `forms/infra/controllers/publish-form-response.dto.ts` | `{ publicToken: string, publicUrl: string }` com `@ApiProperty` |

### Modificar

| Arquivo | O que muda |
|---|---|
| `forms/infra/controllers/forms.controller.ts` | Adicionar `POST /forms/:id/publish` |
| `forms/infra/controllers/forms.controller.test.ts` | Testes para POST /publish |
| `forms/forms.module.ts` | Adicionar `PublishFormUseCase` |

## Passos de Implementação (TDD)

1. [teste] `publish-form.usecase.spec.ts` → [impl] `publish-form.usecase.ts`
2. [impl] `publish-form-response.dto.ts`
3. [teste] Expandir `forms.controller.test.ts` com POST /publish
4. [impl] Adicionar handler `POST /forms/:id/publish`
5. Atualizar `forms.module.ts`

## Critérios de Aceitação

- [ ] `POST /forms/:id/publish` muda status `draft → active`
- [ ] Gera `publicToken` único
- [ ] Retorna `{ publicToken, publicUrl }` onde `publicUrl = APP_URL/forms/:publicToken`
- [ ] Rejeita com 400 se form não tem perguntas
- [ ] Rejeita com 400 se form já está ativo/fechado/expirado
- [ ] `publicToken` não muda se form for editado após publicação
- [ ] Usecases retornam `Output<T>` — nenhum `throw` interno
- [ ] Todos os `.spec.ts` passam
- [ ] Todos os `.test.ts` passam
- [ ] `npm run typecheck` passa
- [ ] Swagger documenta o endpoint

## Próximas USs

- **US-033** — Fechar Formulário Backend
- **US-039** — Submeter Resposta (usa publicToken)
