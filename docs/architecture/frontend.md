# Arquitetura do Frontend

## Stack

Next.js (App Router) + React + TypeScript

## Estrutura

```
src/
  app/            # Rotas (App Router — pasta = rota)
  components/     # UI genérica: Button, Input, Modal, Layout, Feedback
  modules/        # Composições de domínio: FormBuilder, QuestionRenderer, Dashboard, UserManagement, InviteFlow
  hooks/          # useAuth, useForm, useOrganization, useAnalytics
  services/       # Chamadas à API (1 função por endpoint, erros centralizados)
  styles/         # Globais, tokens, temas
  types/          # DTOs, enums, interfaces compartilhadas
```

## Padrões

- Componentes funcionais com TypeScript, props tipadas com `interface`
- Um componente por arquivo; testes e estilos colocados junto
- Sem lógica de negócio em componentes — delegar para hooks/services

Ver estrutura detalhada em `docs/code-patterns/frontend-components.md`.
