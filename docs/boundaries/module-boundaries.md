# Boundaries entre Módulos

## Regra geral

Módulos se comunicam via **interfaces definidas no domain** (repositórios e usecases). Um módulo nunca acessa diretamente o repositório ou schema de outro módulo.

## Import Rules

### Camadas (dentro de cada módulo)

```
✅ infra → domain          (infra pode importar domain)
❌ domain → infra          (domain NÃO pode importar infra)
```

### Entre módulos

```
✅ Module A (usecase) → Module B (repository interface)
❌ Module A (usecase) → Module B (controller)
❌ Module A (usecase) → Module B (schema)
```

Um usecase pode depender de interfaces de repositório de outro módulo (via DI), mas nunca de implementações concretas.

## Mapa de dependências entre módulos

```
auth ──────▶ users (buscar/criar user)
auth ──────▶ organizations (criar org no signup)
auth ──────▶ memberships (criar membership no signup)

invitations ▶ users (criar user no aceite)
invitations ▶ memberships (criar membership no aceite)

forms ──────▶ (independente)

responses ──▶ forms (verificar status, settings, perguntas)

analytics ──▶ responses (agregar respostas)
analytics ──▶ forms (obter perguntas para contexto)
```

## O que cada módulo expõe

| Módulo | Expõe para outros módulos |
|---|---|
| users | `IUserRepository` (buscar, criar user) |
| organizations | `IOrganizationRepository` (criar, buscar org) |
| memberships | `IMembershipRepository` (criar, buscar membership) |
| invitations | Nada (usado apenas internamente + controllers) |
| forms | `IFormRepository`, `IQuestionRepository` (buscar form, verificar status) |
| responses | `IResponseRepository` (leitura para analytics) |
| analytics | Nada (apenas leitura, consumidor) |
| auth | Nada (orquestra outros módulos, não é consumido) |

## Princípios

1. **Dependência unidirecional** — evitar ciclos entre módulos
2. **Interface pública mínima** — expor apenas o necessário
3. **Domain como contrato** — interfaces do domain são o contrato entre módulos
4. **Infra é privada** — controllers e schemas nunca são acessados por outros módulos
