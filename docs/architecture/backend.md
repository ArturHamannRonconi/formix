# Arquitetura do Backend

## Estrutura do src

```
src/
  modules/          # Módulos de domínio (DDD)
  providers/        # Integrações com serviços externos (ver seção abaixo)
    email/          # Ex: console-email, sendgrid-email, ses-email
    payment/        # Ex: stripe-gateway, pagarme-gateway
  core/
    database/       # Configuração MongoDB
    environment/    # Variáveis de ambiente
  shared/           # Código compartilhado (Output, VOs, interfaces)
  utils/
```

## Providers

A pasta `src/providers/` agrupa integrações com serviços externos que a aplicação **não pode controlar nem depender diretamente**. Qualquer serviço terceiro com múltiplas implementações possíveis pertence aqui.

**Regra:** O domínio define uma interface (port) em `shared/` ou dentro do próprio módulo. O provider implementa essa interface. O módulo injeta a implementação via DI — nunca importa o provider diretamente.

```
providers/
  email/
    interfaces/           # IEmailService (porta — definida aqui ou em shared/)
    console-email/        # Implementação para desenvolvimento (log no console)
    sendgrid-email/       # Implementação para produção (SendGrid)
    ses-email/            # Alternativa (AWS SES)
  payment/
    interfaces/           # IPaymentGateway
    stripe-gateway/
    pagarme-gateway/
```

**Exemplos de o que vai em `providers/`:**
- Serviço de email (SendGrid, SES, Mailgun, console)
- Gateway de pagamento (Stripe, PagSeguro, PagarMe)
- Serviço de SMS (Twilio, AWS SNS)
- Storage de arquivos (S3, GCS, local)
- Push notifications (Firebase FCM, OneSignal)

**O que NÃO vai em `providers/`:** banco de dados (vai em `core/database/`), autenticação interna, lógica de negócio.

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
