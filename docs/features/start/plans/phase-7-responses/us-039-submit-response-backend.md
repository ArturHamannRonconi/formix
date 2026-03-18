# US-039: Submeter Resposta — Backend

## Metadados

| Campo | Valor |
|---|---|
| **Feature** | Fase 7: Respostas |
| **Status** | Pendente |
| **Depende de** | US-038 (Schemas Responses), US-029 (Schemas Forms/Questions — validações) |
| **Bloqueia** | US-040 (Página Pública Frontend) |

## Contexto

Implementa `POST /responses/:publicToken` — rota **pública** (sem auth). Recebe email e answers. Executa validação completa em 11 passos (status do form, expiração, limite, domínio, duplicidade, validação de answers) antes de salvar. A response é salva **sem email ou hash**. O hash do email é salvo em coleção separada **sem referência à response**.

## Arquivos

### Criar

| Arquivo | Descrição |
|---|---|
| `responses/domain/usecases/submit-response.usecase.ts` | Implementa os 11 passos de validação e salvamento |
| `responses/domain/usecases/submit-response.usecase.spec.ts` | Testa todos os cenários de validação e caminho feliz |
| `responses/infra/controllers/responses.controller.ts` | `POST /responses/:publicToken` com `@Public()`. Swagger: `@ApiTags('responses')` |
| `responses/infra/controllers/responses.controller.test.ts` | Testes de integração |
| `responses/infra/controllers/submit-response.dto.ts` | `{ email: string, answers: { questionId: string, value: unknown }[] }` com `@ApiProperty` |

### Modificar

| Arquivo | O que muda |
|---|---|
| `responses/responses.module.ts` | Adicionar `SubmitResponseUseCase`, `ResponsesController`. Importar `FormsModule` para `IFormRepository`, `IQuestionRepository` |
| `forms/domain/usecases/delete-form.usecase.ts` | Adicionar chamadas a `responseRepo.deleteByFormId` e `responseEmailRepo.deleteByFormId` (cascata) |

## Fluxo de Validação (11 passos)

```
1. Busca form por publicToken → 404 se não encontrado
2. Verifica form.status === 'active' → 400 se não
3. Verifica expiresAt → se definido e passou, atualiza status para 'expired', retorna 400
4. Verifica maxResponses → se definido e count >= max, atualiza status para 'expired', retorna 400
5. Verifica allowedEmailDomains → se lista não vazia, verifica domínio do email, retorna 403 se inválido
6. Calcula emailHash = SHA-256(email.toLowerCase())
7. Verifica duplicidade → se allowMultipleResponses=false e emailHash existe em response_emails, retorna 409
8. Busca questions do form
9. Valida answers → required respondidas, tipos compatíveis, min/max/pattern respeitados → 400 se inválido
10. Salva ResponseAggregate { formId, organizationId, answers, submittedAt } — SEM email/hash
11. Salva ResponseEmailAggregate { formId, emailHash, respondedAt } — SEM referência à response
```

## Validação de Answers

Cada answer é validada contra a question correspondente:
- Perguntas `required` devem ter value não-nulo/vazio
- `number`: value é número, respeita `min` e `max`
- `email`: value é email válido
- `radio`/`dropdown`: value está nas `options`
- `checkbox`: value é array de strings das `options`
- `date`: value é data válida
- `rating`: value é número entre 1 e `validation.max` (default: 5)
- `text`/`textarea`: respeita `validation.pattern` se definido

## Passos de Implementação (TDD)

1. [teste] `submit-response.usecase.spec.ts` — todos os cenários de validação
2. [impl] `submit-response.usecase.ts`
3. [impl] `submit-response.dto.ts`
4. [teste] `responses.controller.test.ts`
5. [impl] `responses.controller.ts`
6. Atualizar `responses.module.ts`
7. Atualizar `delete-form.usecase.ts` com cascata de respostas

## Critérios de Aceitação

- [ ] `POST /responses/:publicToken` com dados válidos retorna 201
- [ ] Response salva sem email, hash ou qualquer identificador
- [ ] ResponseEmail salva sem referência à response (IDs diferentes, timestamps diferentes)
- [ ] Form não ativo retorna 400
- [ ] Form expirado por data: atualiza status e retorna 400
- [ ] Form no limite de respostas: atualiza status e retorna 400
- [ ] Email com domínio não permitido retorna 403
- [ ] Duplicidade (allowMultipleResponses=false) retorna 409
- [ ] Pergunta required sem resposta retorna 400
- [ ] Rota é pública (`@Public()`)
- [ ] Usecases retornam `Output<T>` — nenhum `throw` interno
- [ ] Todos os `.spec.ts` passam
- [ ] Todos os `.test.ts` passam
- [ ] `npm run typecheck` passa
- [ ] Swagger documenta o endpoint

## Próximas USs

- **US-040** — Página Pública de Resposta Frontend
- **US-041** — Visualizar Respostas Backend
