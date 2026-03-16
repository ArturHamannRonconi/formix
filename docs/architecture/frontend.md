# Arquitetura do Frontend

## Stack

- **React** — biblioteca de UI
- **Next.js** — framework com App Router, SSR/SSG, rotas baseadas em arquivos
- **TypeScript** — tipagem estática

## Estrutura de diretórios

```
src/
  app/            # Rotas e páginas (App Router do Next.js)
  components/     # Componentes reutilizáveis de UI
  modules/        # Componentes de domínio (composições específicas)
  hooks/          # Custom hooks
  services/       # Chamadas à API
  styles/         # Estilos globais, tokens, temas
  types/          # Tipos TypeScript compartilhados
```

### app/
Rotas do Next.js App Router. Cada pasta representa uma rota. Páginas são composições de módulos e componentes.

### components/
Componentes genéricos e reutilizáveis sem lógica de domínio:
- Buttons, Inputs, Modals, Cards
- Layout (Sidebar, Header, PageShell)
- Feedback (Toast, Loading, Error)

### modules/
Composições específicas de domínio:
- `FormBuilder/` — editor de formulários
- `QuestionRenderer/` — renderização de perguntas por tipo
- `Dashboard/` — gráficos e estatísticas
- `UserManagement/` — gestão de membros
- `InviteFlow/` — fluxo de convite

### hooks/
Custom hooks para lógica reutilizável:
- `useForm` — estado do formulário em edição
- `useAuth` — estado de autenticação
- `useOrganization` — dados da organização atual
- `useAnalytics` — dados de analytics

### services/
Funções para comunicação com a API backend:
- Uma função por endpoint
- Tratamento de erros centralizado
- Tipagem de request/response

### types/
Tipos TypeScript compartilhados entre módulos:
- DTOs de request/response
- Enums (question types, roles, etc.)
- Interfaces de domínio

## Padrões

- Componentes funcionais com TypeScript
- Props tipadas com interfaces
- Um componente por arquivo
- Testes e estilos colocados junto ao componente
- Sem lógica de negócio em componentes — delegar para hooks/services
