# Skill: Create Dashboard Widget

## Descrição

Cria um widget ou gráfico para o dashboard de analytics do Formix.

## Quando usar

- Quando precisar criar componentes de visualização de dados (gráficos, cards de métricas, tabelas)
- Componentes que ficam em `formix-frontend/src/modules/Dashboard/`

## Boas práticas

- Widgets recebem dados já normalizados (não dados brutos da API)
- Responsivo por padrão
- Cores e estilos consistentes com o tema
- Loading state e empty state para cada widget
- Acessibilidade: dados também acessíveis via texto (não apenas visual)

## Padrão esperado

### Estrutura

```
modules/Dashboard/
  charts/
    {ChartName}.tsx
  StatCard.tsx
  index.ts
```

### Template de chart

```typescript
interface {ChartName}Props {
  data: {ChartData}[];
  title: string;
  loading?: boolean;
}

export function {ChartName}({ data, title, loading }: {ChartName}Props) {
  if (loading) return <ChartSkeleton />;
  if (!data.length) return <EmptyChart message="Sem dados" />;

  return (
    // Gráfico
  );
}
```

### Template de StatCard

```typescript
interface StatCardProps {
  label: string;
  value: string | number;
  trend?: { value: number; direction: 'up' | 'down' };
}
```
