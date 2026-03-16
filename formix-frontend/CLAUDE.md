# Formix Frontend — Contexto para Claude Code

## Stack

- React
- Next.js (LTS)
- TypeScript

## Estrutura de diretórios

```
src/
  app/          → Rotas e páginas (App Router do Next.js)
  components/   → Componentes reutilizáveis (UI primitivos, layout)
  modules/      → Componentes específicos de domínio (FormBuilder, Dashboard, etc.)
  hooks/        → Custom hooks
  services/     → Chamadas à API e lógica de comunicação
  styles/       → Estilos globais, tokens, temas
  types/        → Tipos TypeScript compartilhados
```

## Padrões de código

- Componentes funcionais com TypeScript
- Props tipadas com interfaces (não `type`)
- Um componente por arquivo
- Colocação: estilos e testes junto ao componente
- Hooks customizados para lógica reutilizável
- Services para toda comunicação com API

## Componentes-chave

- **FormBuilder** — editor de formulários com drag-and-drop de perguntas
- **QuestionRenderer** — renderiza perguntas por tipo (text, checkbox, radio, etc.)
- **Dashboard** — gráficos e estatísticas de respostas
- **Layout** — shell da aplicação com sidebar, header

## Regras

- Não colocar lógica de negócio em componentes — usar hooks ou services
- Componentes de UI devem ser genéricos e reutilizáveis
- Módulos contêm composições específicas de domínio
- Toda chamada à API passa por `services/`

## Consultar antes de implementar

- `docs/code-patterns/frontend-components.md` — padrões de componentes
- `docs/architecture/frontend.md` — arquitetura do frontend
