# US-007: Tela de Confirmação de Email

## Metadados

| Campo | Valor |
|---|---|
| **Feature** | Fase 2: Autenticação |
| **Status** | Pendente |
| **Depende de** | US-006 (Confirm email backend), US-005 (Signup page — redireciona para cá) |
| **Bloqueia** | — |

## Contexto

Implementa a página `/confirm-email`. Quando acessada com `?token=xxx`, processa a confirmação automaticamente ao montar. Sem token, exibe instrução para verificar o email. Em caso de erro (token inválido ou expirado), permite reenvio.

## Arquivos

### Criar

**Frontend — Pages** — `formix-frontend/src/app/confirm-email/`

| Arquivo | Descrição |
|---|---|
| `page.tsx` | Lê query param `token` via `useSearchParams()`. **Sem token**: exibe mensagem "Verifique seu email e clique no link enviado" + botão "Reenviar email" (abre input de email). **Com token**: `useEffect` dispara `POST /auth/confirm-email`. Estado: `loading` → spinner; `success` → mensagem de sucesso + link para `/login` (redireciona automaticamente após 3s); `error` → mensagem de erro + botão "Reenviar email". Formulário de reenvio: campo email → chama `POST /auth/resend-confirmation` |

### Modificar

| Arquivo | O que muda |
|---|---|
| `formix-frontend/src/services/auth/auth.service.ts` | Adicionar funções: `confirmEmail(token: string)`, `resendConfirmation(email: string)` |
| `formix-frontend/src/services/auth/auth.types.ts` | Adicionar types para confirm e resend |

## Passos de Implementação

1. [impl] Adicionar `confirmEmail` e `resendConfirmation` em `auth.service.ts`
2. [impl] `page.tsx` com os 3 estados (sem token / loading / sucesso / erro)

## Critérios de Aceitação

- [ ] Sem token: exibe instrução de verificar email
- [ ] Com token válido: processa confirmação e exibe sucesso + redireciona para /login
- [ ] Com token inválido/expirado: exibe erro e opção de reenvio
- [ ] Formulário de reenvio: campo email + submit chama resend-confirmation
- [ ] `npm run typecheck` passa
- [ ] `npm run build` sucesso

## Próximas USs

- **US-009** — Login page (destino após confirmação)
