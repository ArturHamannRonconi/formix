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

## Testes e TDD

O projeto é guiado por **TDD (Test-Driven Development)**. Toda feature começa pelos testes — os testes definem o comportamento esperado e o código de produção é escrito para fazê-los passar.

### Framework de testes

- **Jest** — framework de testes do backend
- Cada arquivo de código deve ter seu arquivo de teste correspondente

### Convenção de nomenclatura

| Tipo de arquivo | Extensão de teste | Tipo de teste |
|---|---|---|
| Usecases (`*.usecase.ts`) | `*.usecase.spec.ts` | Unitário |
| Entities (`*.entity.ts`) | `*.entity.spec.ts` | Unitário |
| Value Objects (`*.vo.ts`) | `*.vo.spec.ts` | Unitário |
| Controllers (`*.controller.ts`) | `*.controller.test.ts` | Integração |
| Repositories (`*-*.repository.ts`) | `*-*.repository.test.ts` | Integração |

### Testes unitários (`.spec.ts`)

Testam regras de negócio isoladamente, sem dependências externas.

```typescript
// domain/usecases/create-form.usecase.spec.ts
describe('CreateFormUseCase', () => {
  let usecase: CreateFormUseCase;
  let formRepository: IFormRepository;

  beforeEach(() => {
    formRepository = { save: jest.fn(), findById: jest.fn() } as any;
    usecase = new CreateFormUseCase(formRepository);
  });

  it('should create a form with draft status', async () => {
    const input = { title: 'Survey', organizationId: 'org-1' };
    const form = await usecase.execute(input);
    expect(form.status).toBe(FormStatus.DRAFT);
    expect(formRepository.save).toHaveBeenCalled();
  });
});
```

```typescript
// domain/entities/form.entity.spec.ts
describe('Form', () => {
  it('should publish a draft form', () => {
    const form = new Form('id', 'org-1', 'Survey', FormStatus.DRAFT);
    form.publish();
    expect(form.status).toBe(FormStatus.ACTIVE);
  });

  it('should throw when publishing a non-draft form', () => {
    const form = new Form('id', 'org-1', 'Survey', FormStatus.ACTIVE);
    expect(() => form.publish()).toThrow('Only draft forms can be published');
  });
});
```

### Testes de integração (`.test.ts`)

Testam a integração com framework (NestJS) e banco de dados (MongoDB).

```typescript
// infra/controllers/form.controller.test.ts
describe('FormController (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({ /* ... */ }).compile();
    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => { await app.close(); });

  it('POST /forms should create a form', async () => {
    const response = await request(app.getHttpServer())
      .post('/forms')
      .send({ title: 'Survey', description: 'A test survey' })
      .expect(201);
    expect(response.body.title).toBe('Survey');
  });
});
```

### Fluxo TDD

1. **Red** — Escrever o teste primeiro (ele deve falhar)
2. **Green** — Escrever o mínimo de código para o teste passar
3. **Refactor** — Melhorar o código mantendo os testes passando

### Testes no frontend

Não há necessidade de testes no frontend neste momento.

---

## Nomes de arquivos

```
create-form.usecase.ts
create-form.usecase.spec.ts     (teste unitário)
form.entity.ts
form.entity.spec.ts             (teste unitário)
email.vo.ts
email.vo.spec.ts                (teste unitário)
form.repository.ts              (interface — sem teste)
mongo-form.repository.ts        (implementação)
mongo-form.repository.test.ts   (teste de integração)
form.controller.ts
form.controller.test.ts         (teste de integração)
form.schema.ts
```
