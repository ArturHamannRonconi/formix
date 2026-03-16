# Skill: Create React Component

## Descrição

Cria um componente React reutilizável seguindo os padrões do Formix.

## Quando usar

- Quando precisar criar um novo componente de UI genérico (Button, Input, Modal, Card, etc.)
- Componentes que ficam em `formix-frontend/src/components/`

## Boas práticas

- Componente funcional com TypeScript
- Props definidas com `interface` nomeada como `{ComponentName}Props`
- Valores default via destructuring
- Acessibilidade: labels, aria attributes, keyboard support
- Exportação nomeada (não default)

## Padrão esperado

### Estrutura de arquivos

```
components/{ComponentName}/
  {ComponentName}.tsx
  {ComponentName}.test.tsx
  {ComponentName}.module.css
  index.ts
```

### Template do componente

```typescript
interface {ComponentName}Props {
  // props aqui
}

export function {ComponentName}({ ...props }: {ComponentName}Props) {
  return (
    // JSX
  );
}
```

### Template do index.ts

```typescript
export { {ComponentName} } from './{ComponentName}';
export type { {ComponentName}Props } from './{ComponentName}';
```
