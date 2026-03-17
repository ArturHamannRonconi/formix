# US-047: Serviço de Email

## Metadados

| Campo | Valor |
|---|---|
| **Feature** | Fase 1: Fundação |
| **Status** | Pendente |
| **Depende de** | US-001 — Setup do Backend |
| **Bloqueia** | — |

## Contexto

A variável `EMAIL_PROVIDER` já existe em `environment.config.ts` com default `'console'`. Esta US cria a interface `IEmailService` no shared layer, a implementação console para desenvolvimento e o `EmailModule` global para injeção de dependência em qualquer módulo que precise enviar emails (auth, invitations).

## Arquivos

### Criar

`formix-backend/src/shared/email/`

| Arquivo | Descrição |
|---|---|
| `email-service.interface.ts` | Interface `IEmailService` com `send(to, template, data)`; enum `EmailTemplate` (EMAIL_CONFIRMATION, INVITATION, PASSWORD_RESET); symbol `EMAIL_SERVICE` |
| `console-email.service.ts` | Implementação que loga `to`, `template` e `data` no console via `console.log` |
| `console-email.service.spec.ts` | Unit test: verifica que `send()` resolve sem erros e loga os dados corretos |
| `email.module.ts` | `@Global()` NestJS module: provider `{ provide: EMAIL_SERVICE, useClass: ConsoleEmailService }`, exports `EMAIL_SERVICE` |

### Modificar

| Arquivo | O que muda |
|---|---|
| `formix-backend/src/app.module.ts` | Importar `EmailModule` |

## Passos de Implementação

1. [impl] Criar `email-service.interface.ts` com `IEmailService`, `EmailTemplate` e `EMAIL_SERVICE`
2. [teste] Escrever `console-email.service.spec.ts` — Red
3. [impl] Criar `console-email.service.ts` — Green
4. [impl] Criar `email.module.ts` com `@Global()` e provider/export
5. Importar `EmailModule` no `AppModule`
6. Verificar: typecheck + testes

## Critérios de Aceitação

- [ ] `console-email.service.spec.ts` passa
- [ ] `npm run typecheck` passa sem erros
- [ ] `ConsoleEmailService` pode ser injetado via token `EMAIL_SERVICE` em outros módulos

## Próximas USs

- **US-016** — Schemas MongoDB + Entidades de Domínio (paralela, independente)
- **US-004** — Auth: Signup + Login (usa `EMAIL_SERVICE` para confirmação de email)
- **US-005** — Invitations (usa `EMAIL_SERVICE` para envio de convites)
