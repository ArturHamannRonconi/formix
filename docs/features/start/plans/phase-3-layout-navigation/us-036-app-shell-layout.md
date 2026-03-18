# US-036: Layout Principal — Frontend

## Metadados

| Campo | Valor |
|---|---|
| **Feature** | Fase 3: Layout e Navegação |
| **Status** | Pendente |
| **Depende de** | — (independente, apenas serviços de auth já existentes) |
| **Bloqueia** | US-045 (Rotas — usa AppShell no layout de rotas protegidas) |

## Contexto

Cria a estrutura visual base do aplicativo: `AppShell` (container principal), `Sidebar` (navegação lateral), `Header` (nome da org, usuário, logout) e `PageContainer` (área de conteúdo com max-width e padding). Esta US não depende de nenhum endpoint novo — usa o `useAuth` hook que será finalizado na US-045, mas pode ser implementada com um stub simples para o header. É o esqueleto que todas as páginas protegidas vão usar.

## Arquivos

### Criar

| Arquivo | Descrição |
|---|---|
| `formix-frontend/src/components/Layout/AppShell.tsx` | Container principal: Sidebar + Header + children. Em desktop, sidebar fixa lateral. Em mobile, sidebar como drawer com hamburger no header |
| `formix-frontend/src/components/Layout/Sidebar.tsx` | Nav lateral com links: Formulários (`/forms`), Membros (`/settings/members`), Configurações (`/settings/profile`). Indicador de item ativo. Botão de fechar (mobile) |
| `formix-frontend/src/components/Layout/Header.tsx` | Barra superior: nome da organização (esquerda), nome do usuário + botão de logout (direita), botão hamburger (mobile). Usa `useAuth` para dados do usuário |
| `formix-frontend/src/components/Layout/PageContainer.tsx` | Wrapper de conteúdo: `max-width: 1200px`, padding consistente, responsivo |
| `formix-frontend/src/components/Layout/AppShell.module.css` | Estilos do AppShell (grid layout, breakpoints) |
| `formix-frontend/src/components/Layout/Sidebar.module.css` | Estilos da sidebar (fixed desktop, drawer mobile) |
| `formix-frontend/src/components/Layout/Header.module.css` | Estilos do header |
| `formix-frontend/src/components/Layout/PageContainer.module.css` | Estilos do PageContainer |
| `formix-frontend/src/components/Layout/index.ts` | Barrel export de todos os componentes de layout |

### Modificar

| Arquivo | O que muda |
|---|---|
| `formix-frontend/src/app/(app)/layout.tsx` | Usar `AppShell` como wrapper do layout de rotas protegidas (criado na US-045, mas AppShell deve estar pronto) |

## Passos de Implementação

1. [impl] `PageContainer.tsx` + estilos — componente mais simples, sem dependências
2. [impl] `Sidebar.tsx` + estilos — nav links com `next/link`, estado `isOpen` (mobile)
3. [impl] `Header.tsx` + estilos — usa stub de `useAuth` para nome de usuário/org
4. [impl] `AppShell.tsx` + estilos — compõe Sidebar + Header + children, gerencia estado hamburger
5. [impl] `index.ts` — barrel export
6. Verificar navegação por teclado e focus indicators

## Critérios de Aceitação

- [ ] AppShell renderiza corretamente com sidebar fixa em desktop (≥768px)
- [ ] Em mobile (<768px), sidebar colapsa; botão hamburger no header abre/fecha
- [ ] Sidebar tem links para `/forms`, `/settings/members`, `/settings/profile`
- [ ] Link ativo tem indicador visual
- [ ] Header exibe nome da organização e nome do usuário
- [ ] Botão de logout no header chama `useAuth().logout()`
- [ ] Skip link "Pular para conteúdo" na AppShell para acessibilidade
- [ ] Navegação por teclado funciona em todos os links da sidebar
- [ ] Focus indicators visíveis em todos os elementos interativos
- [ ] `npm run typecheck` passa
- [ ] `npm run build` sucesso

## Próximas USs

- **US-045** — Rotas e Navegação (usa AppShell no layout protegido)
- **US-037** — Input Components (pode rodar em paralelo)
