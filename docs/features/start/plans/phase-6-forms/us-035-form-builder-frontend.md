# US-035: FormBuilder — Criar/Editar Formulário (Frontend)

## Metadados

| Campo | Valor |
|---|---|
| **Feature** | Fase 6: Formulários |
| **Status** | Pendente |
| **Depende de** | US-030 (CRUD Backend), US-031 (Questions Backend), US-032 (Publicar Backend), US-033 (Fechar Backend), US-037 (Input Components — usados no QuestionEditor) |
| **Bloqueia** | — |

## Contexto

Cria as páginas `/forms/new` e `/forms/:id/edit` com o editor visual de formulários. O FormBuilder permite editar título/descrição/settings, gerenciar perguntas (adicionar, editar, remover) com drag-and-drop para reordenação, e publicar/fechar o formulário. Estado gerenciado pelo hook `useFormBuilder`. Usa `@dnd-kit` para drag-and-drop.

## Arquivos

### Criar

| Arquivo | Descrição |
|---|---|
| `formix-frontend/src/hooks/useFormBuilder.ts` | Gerencia estado do FormBuilder: formData, questions, dirty state. Expõe: `addQuestion`, `updateQuestion`, `removeQuestion`, `reorderQuestions`, `saveForm`, `publishForm`, `closeForm` |
| `formix-frontend/src/modules/FormBuilder/FormBuilder.tsx` | Container principal: usa `useFormBuilder`, compõe todas as seções |
| `formix-frontend/src/modules/FormBuilder/QuestionList.tsx` | Lista sortable de perguntas via `@dnd-kit/sortable`. Cada item é arrastável. Ao reordenar, chama `reorderQuestions` |
| `formix-frontend/src/modules/FormBuilder/QuestionEditor.tsx` | Editor por pergunta: label, tipo (read-only após criação), required toggle, options (se aplicável), validation. Usa componentes de input da US-037 |
| `formix-frontend/src/modules/FormBuilder/QuestionTypeSelector.tsx` | Grid de 11 tipos com ícones. Ao selecionar, cria nova pergunta com tipo escolhido |
| `formix-frontend/src/modules/FormBuilder/FormSettings.tsx` | Seção de configurações: expiresAt (DatePicker), maxResponses (NumberInput), allowMultipleResponses (Toggle), allowedEmailDomains (TextInput de tags — comma separated) |
| `formix-frontend/src/modules/FormBuilder/FormBuilder.module.css` | Estilos |
| `formix-frontend/src/app/(app)/forms/new/page.tsx` | Página de criação: monta FormBuilder sem formId inicial |
| `formix-frontend/src/app/(app)/forms/[id]/edit/page.tsx` | Página de edição: carrega form + questions, passa para FormBuilder |

## Estrutura do Hook useFormBuilder

```typescript
// src/hooks/useFormBuilder.ts
export function useFormBuilder(formId?: string) {
  // Estado: formData (title, description, settings), questions[], isDirty, isLoading
  // Ao montar com formId: carrega dados do form via formsService.getForm(formId)
  // addQuestion(type): cria pergunta localmente com order automático, persiste no servidor
  // updateQuestion(id, data): atualiza localmente + persiste
  // removeQuestion(id): remove localmente + persiste
  // reorderQuestions(newOrder): atualiza localmente + persiste
  // saveForm(): PATCH /forms/:id com formData
  // publishForm(): POST /forms/:id/publish
  // closeForm(): POST /forms/:id/close
  return { formData, questions, isDirty, isLoading, ...actions }
}
```

## Componentes de Exibição por Tipo de Pergunta

No `QuestionEditor`, o preview da pergunta usa os componentes de input da US-037:

| Tipo | Componente |
|---|---|
| text | TextInput (disabled) |
| textarea | TextArea (disabled) |
| checkbox | Checkbox (disabled) |
| radio | RadioGroup (disabled) |
| toggle | Toggle (disabled) |
| dropdown | Dropdown (disabled) |
| number | NumberInput (disabled) |
| date | DatePicker (disabled) |
| rating | RatingInput (disabled) |
| file | FileUpload (disabled) |
| email | EmailInput (disabled) |

## Passos de Implementação

1. [impl] `useFormBuilder.ts` — hook de estado com integração à API
2. [impl] `QuestionTypeSelector.tsx` — grid de tipos
3. [impl] `FormSettings.tsx` — configurações do form
4. [impl] `QuestionEditor.tsx` — editor por pergunta com preview
5. [impl] `QuestionList.tsx` — lista sortable com @dnd-kit
6. [impl] `FormBuilder.tsx` — container principal
7. [impl] `forms/new/page.tsx` — página de criação
8. [impl] `forms/[id]/edit/page.tsx` — página de edição

## Critérios de Aceitação

- [ ] `/forms/new` cria rascunho automaticamente ao carregar (ou ao adicionar primeira pergunta)
- [ ] `/forms/:id/edit` carrega dados existentes
- [ ] Adicionar pergunta: abre `QuestionTypeSelector`, cria pergunta com tipo escolhido
- [ ] Editar pergunta: editar label, required, options (quando aplicável)
- [ ] Remover pergunta com confirmação
- [ ] Drag-and-drop reordena perguntas na lista
- [ ] Seção de configurações: expiresAt, maxResponses, allowMultipleResponses, allowedEmailDomains
- [ ] Botão "Salvar rascunho" persiste mudanças
- [ ] Botão "Publicar" habilitado apenas quando há pelo menos 1 pergunta
- [ ] Botão "Fechar formulário" visível apenas quando status é `active`
- [ ] Toast de feedback para cada ação
- [ ] `npm run typecheck` passa
- [ ] `npm run build` sucesso

## Dependências de Pacotes

### Produção
- `@dnd-kit/core`
- `@dnd-kit/sortable`
- `@dnd-kit/utilities`

## Próximas USs

- Fase 7: US-038 (Schemas Responses), US-039 (Submeter Resposta), US-040 (Página pública)
