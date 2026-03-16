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
  return (
    <button className={styles[variant]} onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}
```

**Regras:**
- Props tipadas com `interface`
- Valores default via destructuring
- Um componente por arquivo
- Nome do arquivo = nome do componente

## Estrutura de diretório por componente

```
Button/
  Button.tsx
  Button.test.tsx
  Button.module.css
  index.ts
```

## FormBuilder

Componente de domínio para criação/edição de formulários.

```
modules/FormBuilder/
  FormBuilder.tsx           # Container principal
  QuestionList.tsx          # Lista de perguntas com reordenação
  QuestionEditor.tsx        # Editor de uma pergunta individual
  QuestionTypeSelector.tsx  # Seletor de tipo de pergunta
  FormSettings.tsx          # Configurações do formulário
```

**Padrões:**
- Estado do formulário gerenciado por hook `useFormBuilder`
- Drag-and-drop para reordenação de perguntas
- Cada tipo de pergunta tem preview no editor

## QuestionRenderer

Renderiza uma pergunta com base no tipo, usado na interface de resposta.

```
modules/QuestionRenderer/
  QuestionRenderer.tsx      # Switch por tipo, renderiza componente correto
  renderers/
    TextRenderer.tsx
    TextareaRenderer.tsx
    CheckboxRenderer.tsx
    RadioRenderer.tsx
    ToggleRenderer.tsx
    DropdownRenderer.tsx
    NumberRenderer.tsx
    DateRenderer.tsx
    RatingRenderer.tsx
    FileRenderer.tsx
    EmailRenderer.tsx
```

**Padrões:**
- Pattern de strategy: `QuestionRenderer` recebe tipo e delega para renderer específico
- Cada renderer é independente e autossuficiente
- Props padronizadas: `value`, `onChange`, `question`, `error`

## Dashboard

Componentes de visualização de analytics.

```
modules/Dashboard/
  Dashboard.tsx             # Layout do dashboard
  StatCard.tsx              # Card com métrica (total, média, etc.)
  charts/
    BarChart.tsx
    PieChart.tsx
    LineChart.tsx
    RatingChart.tsx
```

**Padrões:**
- Componentes de gráfico recebem dados normalizados, não dados brutos da API
- Hook `useAnalytics` busca e normaliza dados
- Responsivo por padrão

## Layout

```
components/Layout/
  AppShell.tsx              # Shell principal (sidebar + header + content)
  Sidebar.tsx
  Header.tsx
  PageContainer.tsx         # Wrapper de conteúdo com max-width e padding
```

## Input Components

```
components/inputs/
  TextInput.tsx
  TextArea.tsx
  Checkbox.tsx
  RadioGroup.tsx
  Toggle.tsx
  Dropdown.tsx
  NumberInput.tsx
  DatePicker.tsx
  RatingInput.tsx
  FileUpload.tsx
  EmailInput.tsx
```

**Padrões:**
- Todos seguem a mesma interface base: `value`, `onChange`, `error`, `label`, `required`
- Acessíveis (labels, aria attributes, keyboard navigation)
- Controlados (estado gerenciado externamente)
