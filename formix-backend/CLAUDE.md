# Formix Backend — Contexto para Claude Code

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

## Arquitetura: DDD Simplificado

Cada módulo em `src/modules/` possui duas camadas:

### Domain Layer

Contém: aggregate (com entities e value-objects dentro), usecases, interfaces de repositório.

Regras:
- **Não pode importar nada de infra** (controllers, schemas, mongoose, etc.)
- Não pode ter dependência de framework
- Toda regra de negócio fica aqui
- Repositórios são interfaces (ports), implementados na infra

### Infra Layer

Contém: controllers, implementações de repositório, schemas do banco.

Regras:
- Pode importar domain
- Controllers recebem requests e delegam para usecases
- Repositórios implementam as interfaces definidas no domain
- Schemas definem a estrutura do MongoDB
- Configuração de banco fica em `src/core/database/`, não dentro do módulo

## Módulos

| Módulo | Responsabilidade |
|---|---|
| `auth` | Autenticação, tokens, reset de senha |
| `users` | CRUD de usuários, perfil |
| `organizations` | CRUD de organizações, configurações |
| `invitations` | Convites por email, aceite de convite |
| `forms` | Criação/edição de formulários e perguntas |
| `responses` | Recebimento e armazenamento anônimo de respostas |
| `analytics` | Agregações e estatísticas de respostas |

## Testes e TDD

O desenvolvimento é guiado por **TDD** — toda feature começa pelos testes. Os testes definem o comportamento esperado e o código é escrito para fazê-los passar.

- **Framework**: Jest
- **Testes unitários** (`.spec.ts`): usecases, entities, value objects — testam regras de negócio sem dependências externas
- **Testes de integração** (`.test.ts`): controllers, repositories — testam integração com NestJS e MongoDB
- Cada arquivo de código deve ter seu arquivo de teste correspondente
- **Frontend não tem testes** neste momento

Fluxo: Red (teste falha) → Green (código mínimo) → Refactor (melhorar mantendo testes passando)

## Padrões de código

- Um usecase por arquivo
- Usecases recebem dependências via construtor (injeção de dependência do NestJS)
- Entities possuem métodos de domínio (não são anêmicas)
- Value objects são imutáveis
- Validação de input nos controllers, validação de regra de negócio nos usecases/entities

## Regras de negócio críticas

- Respostas são anônimas: email fica em `response_emails`, resposta fica em `responses`, sem FK entre eles
- Cada email responde apenas uma vez por formulário
- Formulários expiram por tempo ou por limite de respostas
- Multi-tenant: toda query filtra por `organizationId`

## Consultar antes de implementar

- `docs/data-modeling/` — estrutura de coleções e índices
- `docs/domain-rules/` — regras de domínio por módulo
- `docs/boundaries/` — o que cada módulo pode acessar
- `docs/architecture/` — visão geral e diagramas
