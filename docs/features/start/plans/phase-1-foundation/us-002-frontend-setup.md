# US-002: Setup do Frontend (Next.js + React)

## Metadados

| Campo | Valor |
|---|---|
| **Feature** | Fase 1: Fundação |
| **Status** | Concluído |
| **Depende de** | — |
| **Bloqueia** | US-003 — Comunicação Frontend → Backend |

## Contexto

O diretório `formix-frontend/` existe com `README.md`, `CLAUDE.md` e estrutura `src/`, mas sem `package.json` nem código. Esta US inicializa o projeto com Next.js + React + TypeScript, configura todo o tooling e cria o código base mínimo com design tokens.

## Arquivos

### Criar

| Arquivo | Descrição |
|---|---|
| `formix-frontend/package.json` | Scripts: dev, build, start, lint, typecheck |
| `formix-frontend/tsconfig.json` | strict: true, jsx: preserve, paths: `@/*: ["./src/*"]` |
| `formix-frontend/next.config.mjs` | reactStrictMode: true |
| `formix-frontend/.eslintrc.json` | extends: ["next/core-web-vitals", "prettier"] |
| `formix-frontend/.prettierrc` | singleQuote: true, trailingComma: "all", semi: true |
| `formix-frontend/.gitignore` | node_modules, .next, .env.local |
| `formix-frontend/.env.local` | NEXT_PUBLIC_API_URL=http://localhost:3001 |
| `formix-frontend/.env.example` | Mesmas chaves, valores de exemplo |
| `formix-frontend/src/app/layout.tsx` | Root layout com `<html lang="pt-BR">`, metadata (title: "Formix"), importa globals.css |
| `formix-frontend/src/app/page.tsx` | Página de teste com `<h1>Formix</h1>` |
| `formix-frontend/src/app/globals.css` | CSS reset + design tokens como custom properties |

## Passos de Implementação

1. `npm init -y` no diretório `formix-frontend/`
2. Instalar dependências de produção: `next react react-dom`
3. Instalar dependências de dev: `typescript @types/react @types/react-dom @types/node eslint eslint-config-next prettier eslint-config-prettier`
4. Criar `tsconfig.json`, `next.config.mjs`, `.eslintrc.json`, `.prettierrc`, `.gitignore`
5. Criar `.env.local` e `.env.example`
6. Criar `src/app/globals.css` com CSS reset e design tokens
7. Criar `src/app/layout.tsx` com root layout
8. Criar `src/app/page.tsx` com página de teste
9. Verificar: typecheck → build → dev

## Critérios de Aceitação

- [x] `npm run typecheck` passa sem erros
- [x] `npm run build` gera build bem-sucedido
- [ ] `npm run dev` sobe servidor em localhost:3000 e renderiza "Formix"
- [x] ESLint configurado e sem erros no código base
- [x] Design tokens definidos em `globals.css` (cores, spacing, fonts)

## Dependências de Pacotes

### Produção

- `next`
- `react`
- `react-dom`

### Dev

- `typescript`
- `@types/react`
- `@types/react-dom`
- `@types/node`
- `eslint`
- `eslint-config-next`
- `prettier`
- `eslint-config-prettier`

## Próximas USs

- **US-003** — Comunicação Frontend → Backend (depende desta)
- **US-016** — Schemas MongoDB + Entidades de Domínio (paralela, backend)
- **US-047** — Serviço de Email (paralela, backend)
