# Formix Backend

API backend do Formix, construída com NestJS e MongoDB seguindo DDD simplificado.

## Stack

- Node.js LTS
- NestJS
- MongoDB (Mongoose)
- TypeScript

## Estrutura do src

```
src/
  modules/          # Módulos de domínio (DDD)
  core/             # Infraestrutura central
    database/       # Configuração e conexão com MongoDB
    environment/    # Variáveis de ambiente e configuração
  server/           # Configuração do servidor
    middlewares/    # Middlewares globais
    routes/        # Definição de rotas
  shared/           # Código compartilhado entre módulos
  utils/            # Utilitários genéricos
```

## Arquitetura dos módulos

Cada módulo em `src/modules/` segue DDD simplificado com duas camadas:

```
module/
  domain/           # Regras de negócio (sem dependência de framework)
    aggregate/      # Raiz de agregado
      entities/
      value-objects/
    usecases/
    repositories/   # Interfaces (ports)
  infra/            # Implementação técnica
    controllers/
    repositories/   # Implementações concretas
    schemas/
```

## Módulos

- **auth** — Autenticação, JWT, reset de senha
- **users** — Gestão de usuários
- **organizations** — Gestão de organizações (tenant)
- **invitations** — Convites por email
- **forms** — Criação e edição de formulários
- **responses** — Coleta anônima de respostas
- **analytics** — Dashboards e estatísticas

## Regras fundamentais

1. Domain layer não importa infra
2. Toda query filtra por `organizationId` (multi-tenant)
3. Respostas são anônimas — emails armazenados separadamente para controle de duplicidade
