# US-037: Componentes de Input Reutilizáveis — Frontend

## Metadados

| Campo | Valor |
|---|---|
| **Feature** | Fase 3: Layout e Navegação |
| **Status** | Pendente |
| **Depende de** | — (independente) |
| **Bloqueia** | US-035 (FormBuilder), US-040 (QuestionRenderer na página pública) |

## Contexto

Cria os 11 componentes de input padronizados que serão usados tanto no FormBuilder (edição) quanto no QuestionRenderer (resposta pública). Todos seguem interface base comum: `value`, `onChange`, `error`, `label`, `required`. São componentes controlados — estado gerenciado externamente. Sem lógica de negócio, apenas apresentação e acessibilidade.

## Arquivos

### Criar

| Arquivo | Descrição |
|---|---|
| `formix-frontend/src/components/inputs/TextInput/TextInput.tsx` | Input de texto simples. Props: `value`, `onChange`, `label`, `error`, `required`, `placeholder`, `disabled` |
| `formix-frontend/src/components/inputs/TextInput/TextInput.module.css` | Estados: default, focused, error, disabled |
| `formix-frontend/src/components/inputs/TextInput/index.ts` | Barrel export |
| `formix-frontend/src/components/inputs/TextArea/TextArea.tsx` | Textarea redimensionável. Props idem + `rows` |
| `formix-frontend/src/components/inputs/TextArea/TextArea.module.css` | |
| `formix-frontend/src/components/inputs/TextArea/index.ts` | |
| `formix-frontend/src/components/inputs/Checkbox/Checkbox.tsx` | Checkbox ou grupo de checkboxes. Props: `value` (string[]), `onChange`, `options` (array de `{label, value}`), `label`, `error`, `required` |
| `formix-frontend/src/components/inputs/Checkbox/Checkbox.module.css` | |
| `formix-frontend/src/components/inputs/Checkbox/index.ts` | |
| `formix-frontend/src/components/inputs/RadioGroup/RadioGroup.tsx` | Grupo de radio buttons. Props: `value` (string), `onChange`, `options`, `label`, `error`, `required` |
| `formix-frontend/src/components/inputs/RadioGroup/RadioGroup.module.css` | |
| `formix-frontend/src/components/inputs/RadioGroup/index.ts` | |
| `formix-frontend/src/components/inputs/Toggle/Toggle.tsx` | Toggle switch (sim/não). Props: `value` (boolean), `onChange`, `label`, `error`, `required` |
| `formix-frontend/src/components/inputs/Toggle/Toggle.module.css` | |
| `formix-frontend/src/components/inputs/Toggle/index.ts` | |
| `formix-frontend/src/components/inputs/Dropdown/Dropdown.tsx` | Select dropdown. Props: `value` (string), `onChange`, `options`, `label`, `error`, `required`, `placeholder` |
| `formix-frontend/src/components/inputs/Dropdown/Dropdown.module.css` | |
| `formix-frontend/src/components/inputs/Dropdown/index.ts` | |
| `formix-frontend/src/components/inputs/NumberInput/NumberInput.tsx` | Input numérico. Props: `value` (number \| null), `onChange`, `label`, `error`, `required`, `min`, `max` |
| `formix-frontend/src/components/inputs/NumberInput/NumberInput.module.css` | |
| `formix-frontend/src/components/inputs/NumberInput/index.ts` | |
| `formix-frontend/src/components/inputs/DatePicker/DatePicker.tsx` | Input de data (type="date"). Props: `value` (string ISO), `onChange`, `label`, `error`, `required` |
| `formix-frontend/src/components/inputs/DatePicker/DatePicker.module.css` | |
| `formix-frontend/src/components/inputs/DatePicker/index.ts` | |
| `formix-frontend/src/components/inputs/RatingInput/RatingInput.tsx` | Rating com estrelas (1-5 ou 1-10 configurável). Props: `value` (number \| null), `onChange`, `label`, `error`, `required`, `max` (default: 5) |
| `formix-frontend/src/components/inputs/RatingInput/RatingInput.module.css` | |
| `formix-frontend/src/components/inputs/RatingInput/index.ts` | |
| `formix-frontend/src/components/inputs/FileUpload/FileUpload.tsx` | Placeholder de upload. Props: `value` (null — placeholder MVP), `onChange`, `label`, `error`, `required`. Exibe mensagem "Upload em breve" |
| `formix-frontend/src/components/inputs/FileUpload/FileUpload.module.css` | |
| `formix-frontend/src/components/inputs/FileUpload/index.ts` | |
| `formix-frontend/src/components/inputs/EmailInput/EmailInput.tsx` | Input de email (type="email"). Props: `value`, `onChange`, `label`, `error`, `required`, `placeholder` |
| `formix-frontend/src/components/inputs/EmailInput/EmailInput.module.css` | |
| `formix-frontend/src/components/inputs/EmailInput/index.ts` | |
| `formix-frontend/src/components/inputs/index.ts` | Barrel export de todos os 11 inputs |
| `formix-frontend/src/types/input.types.ts` | Interface base `BaseInputProps` usada por todos os inputs |

## Interface Base

```typescript
// src/types/input.types.ts
export interface BaseInputProps {
  label: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

export interface OptionItem {
  label: string;
  value: string;
}
```

## Passos de Implementação

1. [impl] `src/types/input.types.ts` — interface base
2. [impl] `TextInput` + estilos (mais simples, referência para os demais)
3. [impl] `EmailInput` (herda padrão do TextInput com `type="email"`)
4. [impl] `TextArea` + estilos
5. [impl] `NumberInput` + estilos
6. [impl] `DatePicker` + estilos
7. [impl] `Toggle` + estilos
8. [impl] `RadioGroup` + estilos
9. [impl] `Checkbox` + estilos (array de valores)
10. [impl] `Dropdown` + estilos
11. [impl] `RatingInput` + estilos (interação com estrelas via teclado)
12. [impl] `FileUpload` placeholder + estilos
13. [impl] `inputs/index.ts` barrel export

## Critérios de Aceitação

- [ ] Todos os 11 componentes de input existem e exportam corretamente
- [ ] Todos implementam a interface base (`value`, `onChange`, `error`, `label`, `required`)
- [ ] Todos são controlados (estado gerenciado externamente)
- [ ] Labels associados via `htmlFor` / `id`
- [ ] Estado de erro exibe mensagem e aplica estilo visual
- [ ] Estado disabled bloqueia interação
- [ ] Focus indicators visíveis em todos (`:focus-visible`)
- [ ] Checkbox e RadioGroup navegáveis por teclado
- [ ] RatingInput navegável por teclado (arrow keys)
- [ ] Toggle acessível como `role="switch"`
- [ ] FileUpload é placeholder MVP com mensagem informativa
- [ ] `npm run typecheck` passa
- [ ] `npm run build` sucesso

## Próximas USs

- **US-035** — FormBuilder (usa inputs no QuestionEditor)
- **US-040** — Página pública de resposta (usa inputs no QuestionRenderer)
