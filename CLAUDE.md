# Formix — Contexto para Claude Code

## O que é o Formix

Formix é um SaaS multi-tenant que permite empresas criarem formulários personalizados (similar ao Google Forms), compartilharem links de resposta, receberem respostas anônimas e visualizarem dashboards com analytics.

## Arquitetura

- **Monorepo** com três diretórios principais: `formix-backend`, `formix-frontend`, `docs`
- **Backend**: Node.js LTS + NestJS + MongoDB, seguindo DDD simplificado
- **Frontend**: React + Next.js (LTS)
- **Banco de dados**: MongoDB

## Módulos do backend

```
users, organizations, forms, responses, invitations, auth, analytics
```

Estrutura do backend:

```
src/
  modules/      → Módulos de domínio (cada um com domain/ e infra/)
  core/         → database/, environment/
  server/       → middlewares/, routes/
  shared/       → Código compartilhado entre módulos
  utils/        → Utilitários genéricos
```

Cada módulo segue a estrutura DDD:

```
module/
  domain/       → aggregate/ (entities, value-objects), usecases, repositories (interfaces)
  infra/        → controllers, repositories, schemas
```

## Regras obrigatórias

### Import rules

- `infra` PODE importar `domain`
- `domain` NÃO PODE importar `infra`
- Domain layer contém apenas regras de negócio, sem dependência de framework ou banco

### Multi-tenancy

- Toda operação deve ser isolada por `organizationId`
- Queries devem sempre filtrar por organização

### Anonimato de respostas

- Respostas são armazenadas SEM vínculo com email
- Emails são armazenados separadamente (coleção `response_emails`) apenas para controle de duplicidade
- Nunca associar email diretamente a uma resposta

### Segurança

- Validar inputs em todas as boundaries
- Sanitizar dados antes de persistir
- Tokens de convite e links de formulário devem ter expiração

## Guidelines de desenvolvimento

1. **Leia a documentação antes de implementar** — `docs/` contém arquitetura, modelagem, regras de domínio e padrões
2. **Siga o DDD** — regras de negócio ficam na domain layer, nunca nos controllers
3. **Um módulo por contexto** — respeite as boundaries entre módulos (ver `docs/boundaries/`)
4. **Código simples** — evite abstrações prematuras, mantenha o mínimo necessário
5. **Testes** — todo usecase deve ter testes unitários; controllers devem ter testes de integração

## Como Claude deve ajudar

- Consultar `docs/` para entender regras antes de gerar código
- Usar os agents em `.claude/agents/` para tarefas especializadas
- Usar as skills em `.claude/skills/` para criação de componentes padronizados
- Sempre respeitar as import rules e boundaries entre módulos
- Perguntar se houver ambiguidade nas regras de domínio
