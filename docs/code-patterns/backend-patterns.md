# Padrões de Código — Backend

## Aggregate

1 aggregate por módulo = 1 coleção MongoDB. Encapsula toda consistência interna do módulo.

```typescript
// domain/aggregate/user.aggregate.ts
export class User {
  private constructor(private props: UserProps) {}

  static create(input: CreateUserInput): User {
    return new User({ id: UserId.create(), ...input, createdAt: new Date(), updatedAt: new Date() });
  }

  static reconstitute(props: UserProps): User { return new User(props); }

  addRefreshToken(token: RefreshTokenEntity): void {
    this.props.refreshTokens.push(token);
    this.props.updatedAt = new Date();
  }

  findRefreshTokenByHash(hash: string): RefreshTokenEntity | null {
    return this.props.refreshTokens.find(t => t.tokenHash === hash) ?? null;
  }

  get id(): UserId { return this.props.id; }
  get refreshTokens(): RefreshTokenEntity[] { return [...this.props.refreshTokens]; }
}
```

**Regras:**
- `create()` para novos, `reconstitute()` para rebuild do banco
- Entities internas (arrays) têm identidade via IDValueObject — acessadas via métodos do aggregate
- Value objects representam propriedades com regra embutida (`Email`, `Password`)
- Estado nunca modificado de fora — apenas via métodos do aggregate

---

## IDValueObject

Toda aggregate e entity possui IDValueObject tipado — nunca `string` puro para identidade.

```typescript
// domain/aggregate/value-objects/user-id.vo.ts
export class UserId {
  private constructor(private readonly value: string) {}
  static create(): UserId { return new UserId(randomUUID()); }
  static from(value: string): UserId {
    if (!value?.trim()) throw new Error('Invalid UserId');
    return new UserId(value);
  }
  getValue(): string { return this.value; }
  equals(other: UserId): boolean { return this.value === other.value; }
}
```

Cada aggregate e entity tem seu tipo de ID: `UserId`, `RefreshTokenId`, `FormId`, etc.

---

## Entity (interna ao Aggregate)

Entities vivem dentro do aggregate como propriedades (geralmente arrays). Sem coleção própria no banco.

```typescript
// domain/aggregate/entities/refresh-token.entity.ts
export class RefreshTokenEntity {
  private constructor(private props: RefreshTokenProps) {}

  static create(expiresInMs: number): RefreshTokenEntity {
    const rawToken = randomUUID();
    return new RefreshTokenEntity({
      id: RefreshTokenId.create(),
      tokenHash: sha256(rawToken),
      family: randomUUID(),
      usedAt: null,
      expiresAt: new Date(Date.now() + expiresInMs),
      createdAt: new Date(),
      _rawToken: rawToken,
    });
  }

  static reconstitute(props: RefreshTokenProps): RefreshTokenEntity { return new RefreshTokenEntity(props); }

  markAsUsed(): void { this.props.usedAt = new Date(); }
  isExpired(): boolean { return new Date() > this.props.expiresAt; }
  wasUsed(): boolean { return this.props.usedAt !== null; }

  get rawToken(): string | undefined { return this.props._rawToken; } // só após create()
  get tokenHash(): string { return this.props.tokenHash; }
  get family(): string { return this.props.family; }
}
```

**Acesso correto:**
```typescript
const result = await this.userRepo.findById(userId);
if (result.isFailure) return Output.fail(result.errorMessage);
const token = result.value.findRefreshTokenByHash(hash);
if (!token) return Output.fail('Token not found');
```

---

## Value Object

Imutável, sem identidade, construtor privado, `create()` com validação.

```typescript
export class Email {
  private constructor(private readonly value: string) {}
  static create(raw: string): Email {
    if (!raw || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) throw new Error('Invalid email');
    return new Email(raw.toLowerCase());
  }
  getValue(): string { return this.value; }
  equals(other: Email): boolean { return this.value === other.value; }
}
```

Pode lançar erro no `create()` — é boundary de entrada, não usecase.

---

## Output (resultado de usecase)

Usecases **nunca lançam exceções** — retornam `Output<T>`. Apenas controllers convertem falhas em exceções HTTP.

```typescript
// Assinatura (src/shared/output.ts)
class Output<T> {
  static ok<T>(value?: T): Output<T>
  static fail<T>(errorMessage: string): Output<T>
  get isFailure(): boolean
  get value(): T          // lança se isFailure
  get errorMessage(): string
}
```

**Usecase:**
```typescript
async execute(input): Promise<Output<{ accessToken: string }>> {
  const result = await this.userRepo.findByEmail(email);
  if (result.isFailure) return Output.fail('Invalid credentials');
  if (!result.value.emailConfirmed) return Output.fail('Email not confirmed');
  // ...
  return Output.ok({ accessToken });
}
```

**Controller:**
```typescript
const output = await this.loginUseCase.execute(dto);
if (output.isFailure) {
  if (output.errorMessage === 'Email not confirmed') throw new ForbiddenException(output.errorMessage);
  throw new UnauthorizedException(output.errorMessage);
}
return output.value;
```

---

## Repositório

1 por módulo. `save()` é sempre upsert. Inputs/outputs usam tipos de domínio.

```typescript
// domain/repositories/user.repository.ts
export interface IUserRepository {
  save(user: User): Promise<void>;
  findById(id: UserId): Promise<Output<User>>;
  findByEmail(email: Email): Promise<Output<User>>;
  findByRefreshTokenHash(hash: string): Promise<Output<User>>;
  exists(email: Email): Promise<boolean>;
}
export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
```

```typescript
// infra/repositories/mongo-user.repository.ts
async save(user: User): Promise<void> {
  await this.userModel.findOneAndUpdate(
    { _id: user.id.getValue() },
    { $set: this.toDocument(user) },
    { upsert: true },
  );
}
async findById(id: UserId): Promise<Output<User>> {
  const doc = await this.userModel.findOne({ _id: id.getValue() }).exec();
  if (!doc) return Output.fail('User not found');
  return Output.ok(this.toEntity(doc));
}
```

**Regras:** `save()` recebe o aggregate inteiro. `findBy*()` retorna `Output<Aggregate>`. Mapeamento aggregate ↔ documento exclusivo no repositório (`toDocument`, `toEntity`).

---

## Usecase

```typescript
@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
    @Inject('JWT_SIGN_FUNCTION') private readonly jwtSign: JwtSignFn,
  ) {}

  async execute(input: LoginInput): Promise<Output<LoginOutput>> {
    const result = await this.userRepo.findByEmail(Email.create(input.email));
    if (result.isFailure) return Output.fail('Invalid credentials');
    const user = result.value;
    if (!await user.passwordHash.compare(input.password)) return Output.fail('Invalid credentials');
    if (!user.emailConfirmed) return Output.fail('Email not confirmed');
    // ...
    return Output.ok({ accessToken, refreshToken: token.rawToken });
  }
}
```

**Regras:** 1 arquivo por usecase (`verbo-substantivo.usecase.ts`). Método `execute()`. Retorna `Output<T>`. Trabalha com tipos de domínio, nunca DTOs.

---

## Controller

```typescript
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  @Post('login')
  @Public()
  @ApiOperation({ summary: 'Login' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, type: LoginResponseDto })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  @ApiResponse({ status: 403, description: 'Email não confirmado' })
  async login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
    const output = await this.loginUseCase.execute(dto);
    if (output.isFailure) {
      if (output.errorMessage === 'Email not confirmed') throw new ForbiddenException(output.errorMessage);
      throw new UnauthorizedException(output.errorMessage);
    }
    return output.value;
  }
}
```

**Regras:** Sem lógica de negócio. Único lugar onde `Output.isFailure` vira exceção HTTP. **Swagger obrigatório em toda rota:** `@ApiTags`, `@ApiOperation`, `@ApiResponse` (todos os status), `@ApiBearerAuth` em rotas autenticadas.

---

## DTO

```typescript
export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Secure1234' })
  @IsString()
  password: string;
}
```

`@ApiProperty` em obrigatórios, `@ApiPropertyOptional` em opcionais. DTOs de response também decorados.

---

## Testes e TDD

| Arquivo | Extensão de teste | Tipo |
|---|---|---|
| `*.usecase.ts` | `*.usecase.spec.ts` | Unitário |
| `*.aggregate.ts` / `*.entity.ts` / `*.vo.ts` | `*.spec.ts` | Unitário |
| `*.controller.ts` | `*.controller.test.ts` | Integração |
| `mongo-*.repository.ts` | `*.repository.test.ts` | Integração |

**Fluxo TDD:** Red → Green → Refactor.

**Spec unitário (usecase):**
```typescript
describe('LoginUseCase', () => {
  let usecase: LoginUseCase;
  let userRepo: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    userRepo = { findByEmail: jest.fn(), save: jest.fn() } as any;
    usecase = new LoginUseCase(userRepo, jest.fn().mockReturnValue('token'));
  });

  it('should return tokens on valid login', async () => {
    const user = await createConfirmedUser();
    userRepo.findByEmail.mockResolvedValue(Output.ok(user));
    const output = await usecase.execute({ email: 'u@x.com', password: 'Pass1' });
    expect(output.isFailure).toBe(false);
    expect(output.value.accessToken).toBeDefined();
  });

  it('should fail with generic message when user not found', async () => {
    userRepo.findByEmail.mockResolvedValue(Output.fail('not found'));
    const output = await usecase.execute({ email: 'x@x.com', password: 'p' });
    expect(output.isFailure).toBe(true);
    expect(output.errorMessage).toBe('Invalid credentials');
  });
});
```

---

## Nomes de arquivos

```
user.aggregate.ts / user.aggregate.spec.ts
refresh-token.entity.ts / refresh-token.entity.spec.ts
user-id.vo.ts
email.vo.ts / email.vo.spec.ts
user.repository.ts              (interface — sem teste)
mongo-user.repository.ts / mongo-user.repository.test.ts
auth.controller.ts / auth.controller.test.ts
user.schema.ts
login.usecase.ts / login.usecase.spec.ts
```
