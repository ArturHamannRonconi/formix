# Formix

SaaS multi-tenant para criação de formulários personalizados, compartilhamento de links de resposta, coleta anônima de respostas e visualização de dashboards com analytics.

## Visão geral

Formix permite que empresas:

- Criem formulários personalizados com diversos tipos de perguntas
- Compartilhem links públicos para coleta de respostas
- Recebam respostas de forma anônima
- Visualizem dashboards com estatísticas e gráficos

## Arquitetura

Monorepo com três componentes principais:

| Diretório | Descrição |
|---|---|
| `formix-backend/` | API NestJS + MongoDB com DDD simplificado |
| `formix-frontend/` | Aplicação React + Next.js |
| `docs/` | Documentação de arquitetura, modelagem e padrões |

## Stack técnico

- **Frontend**: React, Next.js, TypeScript
- **Backend**: Node.js, NestJS, MongoDB, TypeScript
- **Arquitetura**: DDD simplificado, multi-tenant por organização

## Estrutura do monorepo

```
formix/
├── formix-backend/      # API backend
├── formix-frontend/     # Aplicação frontend
├── docs/                # Documentação técnica
│   ├── architecture/    # Arquitetura do sistema
│   ├── data-modeling/   # Modelagem de dados (MongoDB)
│   ├── domain-rules/    # Regras de domínio por módulo
│   ├── code-patterns/   # Padrões de código
│   └── boundaries/      # Limites entre módulos
└── .claude/             # Configuração do Claude Code
    ├── agents/          # Agents especializados
    └── skills/          # Skills para geração padronizada
```

## Rodando o projeto

### Pré-requisitos

- Node.js LTS
- MongoDB rodando localmente (ou URI configurada no `.env`)

### Primeira vez

```bash
# Copiar variáveis de ambiente
cp formix-backend/.env.example formix-backend/.env
cp formix-frontend/.env.example formix-frontend/.env.local

# Instalar dependências
npm install --prefix formix-backend && npm install --prefix formix-frontend
```

### Iniciar frontend e backend juntos

```bash
npx concurrently \
  "npm run dev --prefix formix-backend" \
  "npm run dev --prefix formix-frontend"
```

| Serviço  | URL                   |
|----------|-----------------------|
| Frontend | http://localhost:3000 |
| Backend  | http://localhost:3001 |

### Iniciar separadamente

```bash
# Backend (terminal 1)
cd formix-backend && npm run dev

# Frontend (terminal 2)
cd formix-frontend && npm run dev
```

---

## Documentação

Consulte o diretório `docs/` para informações detalhadas sobre:

- [Arquitetura do sistema](docs/architecture/)
- [Modelagem de dados](docs/data-modeling/)
- [Regras de domínio](docs/domain-rules/)
- [Padrões de código](docs/code-patterns/)
- [Boundaries entre módulos](docs/boundaries/)
