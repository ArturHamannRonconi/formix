# Padrões de Código — Backend

## Estrutura de um usecase

```typescript
// domain/usecases/create-form.usecase.ts
export class CreateFormUseCase {
  constructor(
    private readonly formRepository: IFormRepository,
  ) {}

  async execute(input: CreateFormInput): Promise<Form> {
    // 1. Validar regras de negócio
    // 2. Criar entidade/aggregate
    // 3. Persistir via repositório
    // 4. Retornar resultado
  }
}
```

**Regras:**
- Um arquivo por usecase
- Nome no formato: `verbo-substantivo.usecase.ts`
- Recebe dependências via construtor (DI do NestJS)
- Método `execute()` como ponto de entrada
- Retorna entidade de domínio, não DTO

## Estrutura de uma entity

```typescript
// domain/entities/form.entity.ts
export class Form {
  constructor(
    private readonly id: string,
    private readonly organizationId: string,
    private title: string,
    private status: FormStatus,
  ) {}

  publish(): void {
    if (this.status !== FormStatus.DRAFT) {
      throw new DomainError('Only draft forms can be published');
    }
    this.status = FormStatus.ACTIVE;
  }
}
```

**Regras:**
- Entities possuem métodos de domínio (não são anêmicas)
- Validações de negócio dentro da entity
- Construtor valida invariantes

## Estrutura de um value object

```typescript
// domain/value-objects/email.vo.ts
export class Email {
  private constructor(private readonly value: string) {}

  static create(email: string): Email {
    if (!Email.isValid(email)) {
      throw new DomainError('Invalid email');
    }
    return new Email(email.toLowerCase());
  }

  static isValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  getValue(): string {
    return this.value;
  }
}
```

**Regras:**
- Imutável
- Factory method `create()` com validação
- Construtor privado

## Interface de repositório

```typescript
// domain/repositories/form.repository.ts
export interface IFormRepository {
  findById(id: string): Promise<Form | null>;
  findByOrganizationId(orgId: string): Promise<Form[]>;
  save(form: Form): Promise<void>;
  delete(id: string): Promise<void>;
}
```

**Regras:**
- Interface pura, sem dependência de infra
- Trabalha com entidades de domínio, não schemas
- Localizada em `domain/repositories/`

## Estrutura de um controller

```typescript
// infra/controllers/form.controller.ts
@Controller('forms')
export class FormController {
  constructor(private readonly createForm: CreateFormUseCase) {}

  @Post()
  async create(@Body() dto: CreateFormDto): Promise<FormResponseDto> {
    const form = await this.createForm.execute(dto);
    return FormMapper.toDto(form);
  }
}
```

**Regras:**
- Controller não contém lógica de negócio
- Valida input (DTOs com class-validator)
- Delega para usecases
- Converte resposta para DTO

## Nomes de arquivos

```
create-form.usecase.ts
form.entity.ts
email.vo.ts
form.repository.ts          (interface)
mongo-form.repository.ts    (implementação)
form.controller.ts
form.schema.ts
```
