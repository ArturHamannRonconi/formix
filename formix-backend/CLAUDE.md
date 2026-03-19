# Formix Backend — Contexto para Claude Code

## Stack

- Node.js LTS
- NestJS
- MongoDB (Mongoose)
- TypeScript
- Swagger / OpenAPI (`@nestjs/swagger`)

## Estrutura do src

```
src/
  modules/          # Módulos de domínio (DDD)
  providers/        # Integrações com serviços externos (email, pagamento, SMS, storage…)
    email/          # Ex: console-email, sendgrid-email
    payment/        # Ex: stripe-gateway, pagarme-gateway
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

## Providers (`src/providers/`)

Integrações com serviços externos que a aplicação **não controla e não pode depender diretamente**. Todo serviço terceiro com múltiplas implementações possíveis vai aqui.

Exemplos: serviço de email (SendGrid, SES, console), gateway de pagamento (Stripe, PagarMe), SMS, storage.

**Padrão obrigatório:**
- O domínio (ou `shared/`) define a **interface** (port) — ex: `IEmailService`
- O provider implementa essa interface — ex: `SendgridEmailService`
- O módulo injeta a implementação via NestJS DI — **nunca importa o provider diretamente**

```
providers/
  email/
    interfaces/           # IEmailService
    console-email/        # Implementação de dev (log no console)
    sendgrid-email/       # Implementação de produção
  payment/
    interfaces/           # IPaymentGateway
    stripe-gateway/
```

**O que NÃO vai em providers/:** banco de dados (vai em `core/database/`), lógica de negócio.

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

## Documentação de API (Swagger / OpenAPI)

**Regra obrigatória: toda rota nova deve ter documentação Swagger completa.**

Toda vez que um controller ou endpoint for criado ou modificado, é obrigatório adicionar os decorators do `@nestjs/swagger`:

```typescript
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('forms')
@Controller('forms')
export class FormController {

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar formulário' })
  @ApiBody({ type: CreateFormDto })
  @ApiResponse({ status: 201, description: 'Formulário criado com sucesso', type: FormResponseDto })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async create(@Body() dto: CreateFormDto): Promise<FormResponseDto> { ... }
}
```

**Checklist obrigatório para cada endpoint:**
- `@ApiTags('nome-do-modulo')` no controller
- `@ApiOperation({ summary: '...' })` em cada método
- `@ApiBody({ type: Dto })` em rotas com body (POST, PUT, PATCH)
- `@ApiResponse({ status, description, type })` para cada status possível (201, 200, 400, 401, 403, 404, 409...)
- `@ApiBearerAuth()` em rotas autenticadas
- DTOs de request e response decorados com `@ApiProperty()` (ou `@ApiPropertyOptional()` para opcionais)

**DTOs devem usar `@ApiProperty`:**
```typescript
export class CreateFormDto {
  @ApiProperty({ example: 'Pesquisa de satisfação', description: 'Título do formulário' })
  title: string;

  @ApiPropertyOptional({ example: 'Formulário anônimo de satisfação' })
  description?: string;
}
```

O Swagger UI fica disponível em `GET /api/docs` (configurado em `src/main.ts`).

## Padrões de código obrigatórios

### 1 Aggregate por módulo = 1 coleção MongoDB

Cada módulo tem exatamente 1 classe Aggregate que representa um documento inteiro no banco:
- `UserAggregate` ↔ coleção `users`
- `FormAggregate` ↔ coleção `forms`

O Aggregate pode conter:
- **Entities internas** (geralmente em arrays) — têm identidade própria via IDValueObject (ex: `SessionEntity[]`)
- **Value objects** — propriedade única com regra de negócio embutida (ex: `Email`, `Password`)

### IDValueObject obrigatório

Toda aggregate e entity possui um IDValueObject tipado — nunca `string` puro para identidade:

```typescript
export class UserId {
  static create(): UserId { return new UserId(randomUUID()); }
  static from(value: string): UserId { ... }
  getValue(): string { return this.value; }
  equals(other: UserId): boolean { return this.value === other.value; }
}
```

### Repositório: 1 por módulo, save() é sempre upsert

- 1 repositório por módulo, referente à coleção daquele módulo
- `save(aggregate)` verifica internamente se o documento existe e faz insert ou update
- Inputs/outputs das funções usam **tipos de domínio** (IDValueObject, Aggregate, Entity), nunca strings puras

```typescript
export interface IUserRepository {
  save(user: UserAggregate): Promise<void>;
  findById(id: UserId): Promise<Output<UserAggregate>>;
  findByEmail(email: Email): Promise<Output<UserAggregate>>;
}
```

### Acesso a entidades internas via aggregate

Para acessar uma entity dentro de um aggregate, busque o aggregate via repositório e use um método do aggregate:

```typescript
const userResult = await this.userRepository.findById(userId);
if (userResult.isFailure) return Output.fail(userResult.errorMessage);
const session = userResult.value.findSessionById(sessionId);
```

### Output pattern — nunca throw em usecases

Usecases retornam `Output<T>` e **nunca lançam exceções**. Apenas controllers convertem falhas em exceções HTTP:

```typescript
// usecase — retorna Output
async execute(input): Promise<Output<{ id: string }>> {
  const result = await this.repo.findById(id);
  if (result.isFailure) return Output.fail(result.errorMessage);
  // ...
  return Output.ok({ id: created.id.getValue() });
}

// controller — converte em exceção HTTP
const output = await this.useCase.execute(dto);
if (output.isFailure) throw new BadRequestException(output.errorMessage);
```

**Exceção à regra:** value objects e aggregates **podem** lançar erro no `create()` — isso representa dado inválido na entrada, não resultado de regra de negócio do usecase.

---

Ver detalhes e exemplos completos em `docs/code-patterns/backend-patterns.md`.

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
