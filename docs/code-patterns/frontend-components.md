# Padrões de Código — Frontend Components

## Componente básico

```typescript
// components/Button/Button.tsx
interface ButtonProps {
  label: string;
  variant?: 'primary' | 'secondary';
  onClick: () => void;
  disabled?: boolean;
}

export function Button({ label, variant = 'primary', onClick, disabled }: ButtonProps) {
  return <button className={styles[variant]} onClick={onClick} disabled={disabled}>{label}</button>;
}
```

**Regras:** Props tipadas com `interface`. Um componente por arquivo. Nome do arquivo = nome do componente.

## Estrutura por componente

```
Button/
  Button.tsx
  Button.test.tsx
  Button.module.css
  index.ts
```

## Módulos de domínio

### FormBuilder (`modules/FormBuilder/`)

```
FormBuilder.tsx           # Container principal
QuestionList.tsx          # Lista com reordenação (drag-and-drop)
QuestionEditor.tsx        # Editor por pergunta
QuestionTypeSelector.tsx
FormSettings.tsx
```

Estado gerenciado por hook `useFormBuilder`.

### QuestionRenderer (`modules/QuestionRenderer/`)

```
QuestionRenderer.tsx      # Switch por tipo → renderer específico
renderers/
  TextRenderer.tsx / TextareaRenderer.tsx / CheckboxRenderer.tsx
  RadioRenderer.tsx / ToggleRenderer.tsx / DropdownRenderer.tsx
  NumberRenderer.tsx / DateRenderer.tsx / RatingRenderer.tsx
  FileRenderer.tsx / EmailRenderer.tsx
```

Props padronizadas: `value`, `onChange`, `question`, `error`.

### Dashboard (`modules/Dashboard/`)

```
Dashboard.tsx / StatCard.tsx
charts/
  BarChart.tsx / PieChart.tsx / LineChart.tsx / RatingChart.tsx
```

Componentes recebem dados normalizados (não brutos da API). Hook `useAnalytics` normaliza.

### Layout (`components/Layout/`)

```
AppShell.tsx / Sidebar.tsx / Header.tsx / PageContainer.tsx
```

## Input Components (`components/inputs/`)

```
TextInput / TextArea / Checkbox / RadioGroup / Toggle
Dropdown / NumberInput / DatePicker / RatingInput / FileUpload / EmailInput
```

Interface base comum: `value`, `onChange`, `error`, `label`, `required`. Controlados e acessíveis.
