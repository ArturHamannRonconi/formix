# US-001: Setup do Backend (NestJS + MongoDB)

## Metadados

| Campo | Valor |
|---|---|
| **Feature** | Fase 1: Fundação |
| **Status** | Concluído |
| **Depende de** | — |
| **Bloqueia** | US-016 — Schemas MongoDB + Entidades de Domínio, US-047 — Serviço de Email |

## Contexto

O diretório `formix-backend/` existia vazio. Esta US inicializa o projeto NestJS com toda a configuração de tooling (TypeScript, ESLint, Prettier, Jest), cria o bootstrap mínimo da aplicação (EnvironmentModule, DatabaseModule, AppModule) e valida que o servidor sobe e os testes passam.

## Arquivos

### Criar

| Arquivo | Descrição |
|---|---|
| `formix-backend/package.json` | Scripts: dev, build, start, test:unit, test:integration, typecheck, lint, format |
| `formix-backend/tsconfig.json` | strict, decorators, paths: @modules, @core, @shared, @utils |
| `formix-backend/tsconfig.build.json` | Extends tsconfig, exclui tests e node_modules |
| `formix-backend/nest-cli.json` | sourceRoot: "src" |
| `formix-backend/.eslintrc.js` | @typescript-eslint/recommended + prettier |
| `formix-backend/.prettierrc` | singleQuote: true, trailingComma: "all", semi: true |
| `formix-backend/jest.config.ts` | ts-jest, moduleNameMapper para aliases, testRegex para .spec e .test |
| `formix-backend/.env` | MONGODB_URI, PORT=3001, NODE_ENV=development |
| `formix-backend/.env.example` | Mesmas chaves, sem valores |
| `formix-backend/.gitignore` | node_modules, dist, .env |
| `formix-backend/src/shared/domain-error.ts` | Classe DomainError base |
| `formix-backend/src/shared/domain-error.spec.ts` | Testes unitários do DomainError |
| `formix-backend/src/core/environment/environment.config.ts` | ConfigModule.forRoot() com validação |
| `formix-backend/src/core/environment/environment.config.spec.ts` | Testa validação de variáveis obrigatórias |
| `formix-backend/src/core/environment/environment.module.ts` | Exporta ConfigModule |
| `formix-backend/src/core/database/database.module.ts` | MongooseModule.forRootAsync() com ConfigService |
| `formix-backend/src/core/database/database.module.test.ts` | Testa conexão com mongodb-memory-server |
| `formix-backend/src/app.module.ts` | Importa EnvironmentModule e DatabaseModule |
| `formix-backend/src/main.ts` | NestFactory.create(), listen na PORT configurada |

## Passos de Implementação

1. `npm init -y` no diretório `formix-backend/`
2. Instalar dependências de produção e dev
3. Criar arquivos de configuração (tsconfig, nest-cli, eslint, prettier, jest, gitignore)
4. Criar `.env` e `.env.example`
5. [teste] Escrever `domain-error.spec.ts` — Red
6. [impl] Criar `domain-error.ts` — Green
7. [teste] Escrever `environment.config.spec.ts` — Red
8. [impl] Criar `environment.config.ts` e `environment.module.ts` — Green
9. [teste] Escrever `database.module.test.ts` — Red
10. [impl] Criar `database.module.ts` — Green
11. Criar `app.module.ts` e `main.ts`
12. Verificar: typecheck → testes → dev

## Critérios de Aceitação

- [x] `npm run typecheck` passa sem erros
- [x] `npm run test` passa (5 unitários + 1 integração)
- [x] `npm run dev` inicia servidor em PORT=3001 sem erros
- [x] DatabaseModule conecta ao MongoDB via mongodb-memory-server nos testes

## Dependências de Pacotes

### Produção

- `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`, `reflect-metadata`, `rxjs`
- `@nestjs/mongoose`, `mongoose`
- `@nestjs/config`, `class-validator`, `class-transformer`
- `bcrypt`

### Dev

- `typescript`, `@types/node`, `ts-node`, `tsconfig-paths`
- `@nestjs/cli`, `@nestjs/testing`
- `jest`, `ts-jest`, `@types/jest`, `supertest`, `@types/supertest`
- `@types/bcrypt`
- `eslint`, `prettier`, `eslint-config-prettier`, `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`
- `mongodb-memory-server`

## Próximas USs

- **US-016** — Schemas MongoDB + Entidades de Domínio (depende desta)
- **US-047** — Serviço de Email (depende desta)
- **US-002** — Setup do Frontend (paralela, independente)
