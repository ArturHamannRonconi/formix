# Boundaries entre Módulos

## Import Rules

```
✅ infra → domain          (infra pode importar domain)
❌ domain → infra          (domain NÃO pode importar infra)
✅ Module A (usecase) → Module B (repository interface)
❌ Module A (usecase) → Module B (controller ou schema)
```

Usecases dependem de interfaces de repositório de outros módulos via DI — nunca de implementações concretas.

## Mapa de dependências

```
auth ──────▶ users (buscar/criar user)
auth ──────▶ organizations (criar org no signup)

invitations ▶ users (criar user no aceite)
invitations ▶ organizations (criar membership no aceite)

forms ──────▶ (independente)
responses ──▶ forms (verificar status, settings, perguntas)
analytics ──▶ responses + forms (agregar)
```

## O que cada módulo expõe

| Módulo | Expõe |
|---|---|
| users | `IUserRepository` |
| organizations | `IOrganizationRepository` (inclui acesso a memberships embutidas) |
| forms | `IFormRepository`, `IQuestionRepository` |
| responses | `IResponseRepository` (leitura para analytics) |
| invitations, analytics, auth | Nada (consumidores) |

## Princípios

1. **Dependência unidirecional** — sem ciclos entre módulos
2. **Interface pública mínima** — expor apenas o necessário
3. **Domain como contrato** — interfaces do domain definem o contrato entre módulos
4. **Infra é privada** — controllers e schemas nunca acessados por outros módulos
