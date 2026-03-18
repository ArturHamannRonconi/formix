# Arquitetura do Backend

## Estrutura do src

```
src/
  modules/          # Módulos de domínio (DDD)
  core/
    database/       # Configuração MongoDB
    environment/    # Variáveis de ambiente
  server/
    middlewares/
    routes/
  shared/           # Código compartilhado (Output, VOs, interfaces)
  utils/
```

## DDD Simplificado

### Domain Layer (`module/domain/`)

```
aggregate/
  entities/         # Entities internas (identidade via IDValueObject)
  value-objects/    # VOs imutáveis (Email, Password, UserId…)
  user.aggregate.ts # Raiz — 1 por módulo = 1 coleção MongoDB
usecases/           # Orquestram regras de negócio → retornam Output<T>
repositories/       # Interfaces (ports) — sem implementação
```

**Regras:** Sem imports de infra, NestJS ou Mongoose. Ver padrões em `docs/code-patterns/backend-patterns.md`.

### Infra Layer (`module/infra/`)

```
controllers/        # Endpoints REST — convertem Output.fail em exceções HTTP
repositories/       # Implementações dos repositórios (Mongoose)
schemas/            # Schemas do MongoDB
```

## Módulos

| Módulo | Responsabilidade |
|---|---|
| auth | Signup, login, logout, refresh token, reset de senha, confirmação de email |
| users | CRUD de usuários e perfil |
| organizations | Organizações + memberships embutidas (admin/member) |
| invitations | Convites por email, aceite |
| forms | CRUD de formulários e perguntas |
| responses | Recebimento anônimo de respostas |
| analytics | Agregações e estatísticas |

**Nota:** Auth não tem repositórios próprios — usa `IUserRepository` e `IOrganizationRepository`.

## Injeção de dependência

```typescript
providers: [
  LoginUseCase,
  { provide: USER_REPOSITORY, useClass: MongoUserRepository },
]
```
