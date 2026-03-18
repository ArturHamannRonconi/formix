# US-034: Lista de Formulários — Frontend

## Metadados

| Campo | Valor |
|---|---|
| **Feature** | Fase 6: Formulários |
| **Status** | Pendente |
| **Depende de** | US-030 (CRUD Forms Backend), US-045 (Rotas protegidas) |
| **Bloqueia** | US-035 (FormBuilder — navegação entre lista e editor) |

## Contexto

Cria a página `/forms` com lista/grid de formulários da organização. Cada card exibe título, status (badge colorido), data de criação e total de respostas. Permite filtrar por status e navegar para criar ou editar formulário.

## Arquivos

### Criar

| Arquivo | Descrição |
|---|---|
| `formix-frontend/src/services/forms/forms.service.ts` | `listForms(orgId, status?)`, `getForm(id)`, `createForm(data)`, `updateForm(id, data)`, `deleteForm(id)`, `publishForm(id)`, `closeForm(id)`. Usa `httpClient` |
| `formix-frontend/src/services/forms/forms.types.ts` | `Form`, `FormSummary`, `Question`, `FormStatus`, `QuestionType`, `CreateFormInput`, `UpdateFormInput` |
| `formix-frontend/src/app/(app)/forms/page.tsx` | Página de lista: carrega forms, filtro por status, grid de cards, botão "Criar formulário" |
| `formix-frontend/src/modules/FormCard/FormCard.tsx` | Card de formulário: título, badge de status, data, total de respostas, links para editar/analytics/respostas |
| `formix-frontend/src/modules/FormCard/StatusBadge.tsx` | Badge colorido por status: Draft (cinza), Active (verde), Expired (amarelo), Closed (vermelho) |
| `formix-frontend/src/modules/FormCard/FormCard.module.css` | Estilos do card |

## Cores de Status

| Status | Cor |
|---|---|
| `draft` | Cinza |
| `active` | Verde |
| `expired` | Amarelo |
| `closed` | Vermelho |

## Passos de Implementação

1. [impl] `forms.types.ts` + `forms.service.ts`
2. [impl] `StatusBadge.tsx` — badge por status
3. [impl] `FormCard.tsx` — card com dados e links
4. [impl] `forms/page.tsx` — lista com filtro e botão criar

## Critérios de Aceitação

- [ ] Página `/forms` carrega lista de formulários ao montar
- [ ] Card exibe: título, badge de status colorido, data de criação
- [ ] Filtro por status (dropdown: Todos, Draft, Active, Expired, Closed)
- [ ] Botão "Criar formulário" navega para `/forms/new`
- [ ] Link "Editar" por card navega para `/forms/:id/edit`
- [ ] Loading state durante fetch
- [ ] Estado vazio com mensagem quando não há formulários
- [ ] `npm run typecheck` passa
- [ ] `npm run build` sucesso

## Próximas USs

- **US-035** — FormBuilder Frontend
