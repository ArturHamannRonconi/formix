# Skill: Create Form Component

## Descrição

Cria um componente de formulário específico do domínio Formix (FormBuilder, QuestionRenderer, etc.).

## Quando usar

- Quando precisar criar componentes relacionados ao editor de formulários ou renderização de perguntas
- Componentes que ficam em `formix-frontend/src/modules/`

## Boas práticas

- Separar lógica de estado em custom hooks
- Componentes de rendering devem ser puros (recebem dados, renderizam)
- Seguir o pattern de QuestionRenderer: um componente por tipo de pergunta
- Preview no editor deve usar os mesmos renderers da interface de resposta
- Validação dinâmica baseada no tipo da pergunta

## Padrão esperado

### Estrutura de módulo

```
modules/{ModuleName}/
  {ModuleName}.tsx          # Componente principal (container)
  use{ModuleName}.ts        # Hook com lógica de estado
  components/               # Sub-componentes internos
  index.ts
```

### Template do hook

```typescript
export function use{ModuleName}() {
  // Estado e lógica aqui
  return {
    // Valores e ações expostos
  };
}
```

### Tipos de pergunta disponíveis

text, textarea, checkbox, radio, toggle, dropdown, number, date, rating, file, email
