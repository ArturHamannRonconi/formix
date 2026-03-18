# US-040: Página Pública de Resposta — Frontend

## Metadados

| Campo | Valor |
|---|---|
| **Feature** | Fase 7: Respostas |
| **Status** | Pendente |
| **Depende de** | US-039 (Submeter Resposta Backend), US-037 (Input Components — renderers usam os inputs) |
| **Bloqueia** | — |

## Contexto

Cria a página `/forms/:publicToken` — rota pública sem AppShell. Exibe título e descrição do formulário, campo de email do respondente e todas as perguntas renderizadas via `QuestionRenderer`. Ao submeter, chama `POST /responses/:publicToken`. Exibe estados de sucesso e erro.

## Arquivos

### Criar

| Arquivo | Descrição |
|---|---|
| `formix-frontend/src/services/responses/responses.service.ts` | `getPublicForm(publicToken)` (GET sem auth), `submitResponse(publicToken, data)` (POST sem auth), `listResponses(formId, page)` (GET com auth) |
| `formix-frontend/src/services/responses/responses.types.ts` | `PublicForm`, `Answer { questionId, value }`, `SubmitResponseInput`, `ResponseRow` |
| `formix-frontend/src/modules/QuestionRenderer/QuestionRenderer.tsx` | Switch por `question.type` → delega para renderer específico |
| `formix-frontend/src/modules/QuestionRenderer/renderers/TextRenderer.tsx` | Renderiza pergunta tipo `text` usando `TextInput` |
| `formix-frontend/src/modules/QuestionRenderer/renderers/TextareaRenderer.tsx` | Tipo `textarea` usando `TextArea` |
| `formix-frontend/src/modules/QuestionRenderer/renderers/CheckboxRenderer.tsx` | Tipo `checkbox` usando `Checkbox` |
| `formix-frontend/src/modules/QuestionRenderer/renderers/RadioRenderer.tsx` | Tipo `radio` usando `RadioGroup` |
| `formix-frontend/src/modules/QuestionRenderer/renderers/ToggleRenderer.tsx` | Tipo `toggle` usando `Toggle` |
| `formix-frontend/src/modules/QuestionRenderer/renderers/DropdownRenderer.tsx` | Tipo `dropdown` usando `Dropdown` |
| `formix-frontend/src/modules/QuestionRenderer/renderers/NumberRenderer.tsx` | Tipo `number` usando `NumberInput` |
| `formix-frontend/src/modules/QuestionRenderer/renderers/DateRenderer.tsx` | Tipo `date` usando `DatePicker` |
| `formix-frontend/src/modules/QuestionRenderer/renderers/RatingRenderer.tsx` | Tipo `rating` usando `RatingInput` |
| `formix-frontend/src/modules/QuestionRenderer/renderers/FileRenderer.tsx` | Tipo `file` usando `FileUpload` (placeholder) |
| `formix-frontend/src/modules/QuestionRenderer/renderers/EmailRenderer.tsx` | Tipo `email` usando `EmailInput` |
| `formix-frontend/src/app/(public)/forms/[publicToken]/page.tsx` | Página pública: sem AppShell, carrega form, renderiza perguntas, gerencia estado de respostas, submete |

## Interface dos Renderers

```typescript
// Todas as props padronizadas por QuestionRenderer
interface RendererProps {
  question: Question;         // dados da pergunta (label, required, options, validation)
  value: unknown;             // valor atual da resposta
  onChange: (v: unknown) => void;
  error?: string;             // erro de validação inline
}
```

## Estados da Página Pública

```
loading → carregando form
  ↓
form inativo/expirado/fechado → tela de erro com mensagem apropriada
  ↓
form ativo → exibe título, descrição, campo email + perguntas
  ↓
submit → loading no botão
  ↓
sucesso → tela de confirmação "Resposta enviada com sucesso!"
erro API → mensagem de erro inline (duplicidade, domínio inválido, etc.)
```

## Passos de Implementação

1. [impl] `responses.types.ts` + `responses.service.ts`
2. [impl] `QuestionRenderer.tsx` — switch por tipo
3. [impl] 11 renderers (TextRenderer, ..., EmailRenderer)
4. [impl] `forms/[publicToken]/page.tsx` — página pública com todos os estados

## Critérios de Aceitação

- [ ] Página `/forms/:publicToken` não exibe sidebar/header (sem AppShell)
- [ ] Carrega form pelo publicToken sem autenticação
- [ ] Exibe título e descrição do formulário
- [ ] Campo de email do respondente obrigatório no topo
- [ ] Perguntas renderizadas na ordem correta via `QuestionRenderer`
- [ ] `QuestionRenderer` delega para renderer correto por tipo
- [ ] Todos os 11 tipos renderizam corretamente
- [ ] Validação client-side: campos required, tipos, min/max
- [ ] Erros inline por pergunta
- [ ] Botão "Enviar" com loading state
- [ ] Tela de sucesso após submissão
- [ ] Tela de erro para form expirado/fechado/limite atingido
- [ ] `npm run typecheck` passa
- [ ] `npm run build` sucesso

## Próximas USs

- **US-041** — Visualizar Respostas Backend
